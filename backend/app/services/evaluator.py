"""
CIFAR-10 Model Evaluator

Trains a simple CNN on CIFAR-10 and generates all artifacts needed
for the ML Failure Analysis Dashboard.

Usage:
    python -m app.services.evaluator [--epochs 3] [--seed 42]
"""

import argparse
import json
import os
import random
from pathlib import Path
from typing import Optional
from collections import defaultdict

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from PIL import Image
from tqdm import tqdm


# CIFAR-10 class labels
CIFAR10_LABELS = [
    "airplane", "automobile", "bird", "cat", "deer",
    "dog", "frog", "horse", "ship", "truck"
]

# Confidence threshold for "high confidence error"
CONF_THRESHOLD = 0.8


def set_seed(seed: int):
    """Set random seeds for reproducibility"""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


class SimpleCNN(nn.Module):
    """
    Simple CNN for CIFAR-10 classification.
    Fast to train, good enough to produce interesting failures.
    """
    def __init__(self):
        super(SimpleCNN, self).__init__()
        # Convolutional layers
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        
        # Pooling
        self.pool = nn.MaxPool2d(2, 2)
        
        # Dropout
        self.dropout1 = nn.Dropout(0.25)
        self.dropout2 = nn.Dropout(0.5)
        
        # Fully connected layers
        self.fc1 = nn.Linear(128 * 4 * 4, 256)
        self.fc2 = nn.Linear(256, 10)
        
        # Batch normalization
        self.bn1 = nn.BatchNorm2d(32)
        self.bn2 = nn.BatchNorm2d(64)
        self.bn3 = nn.BatchNorm2d(128)
    
    def forward(self, x):
        # Conv block 1: 32x32 -> 16x16
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        
        # Conv block 2: 16x16 -> 8x8
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        
        # Conv block 3: 8x8 -> 4x4
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        
        # Flatten
        x = x.view(-1, 128 * 4 * 4)
        x = self.dropout1(x)
        
        # FC layers
        x = F.relu(self.fc1(x))
        x = self.dropout2(x)
        x = self.fc2(x)
        
        return x


def get_data_loaders(batch_size: int = 128):
    """Get CIFAR-10 train and test data loaders"""
    
    # Data augmentation for training
    train_transform = transforms.Compose([
        transforms.RandomCrop(32, padding=4),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616))
    ])
    
    # No augmentation for test
    test_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616))
    ])
    
    # Download datasets
    train_dataset = datasets.CIFAR10(
        root='./data', train=True, download=True, transform=train_transform
    )
    test_dataset = datasets.CIFAR10(
        root='./data', train=False, download=True, transform=test_transform
    )
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=2
    )
    test_loader = DataLoader(
        test_dataset, batch_size=batch_size, shuffle=False, num_workers=2
    )
    
    return train_loader, test_loader, test_dataset


def train_model(model: nn.Module, train_loader: DataLoader, 
                epochs: int = 3, device: str = 'cpu') -> nn.Module:
    """Train the model"""
    model = model.to(device)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=2, gamma=0.5)
    criterion = nn.CrossEntropyLoss()
    
    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        correct = 0
        total = 0
        
        pbar = tqdm(train_loader, desc=f'Epoch {epoch+1}/{epochs}')
        for inputs, labels in pbar:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            pbar.set_postfix({
                'loss': f'{running_loss/total:.4f}',
                'acc': f'{100.*correct/total:.2f}%'
            })
        
        scheduler.step()
        print(f'Epoch {epoch+1}: Loss={running_loss/len(train_loader):.4f}, Acc={100.*correct/total:.2f}%')
    
    return model


def evaluate_model(model: nn.Module, test_loader: DataLoader, 
                   device: str = 'cpu') -> tuple:
    """
    Evaluate model and collect predictions with confidence scores.
    Returns: (all_predictions, all_labels, all_probs, all_indices)
    """
    model.eval()
    all_predictions = []
    all_labels = []
    all_probs = []
    all_indices = []
    
    idx = 0
    with torch.no_grad():
        for inputs, labels in tqdm(test_loader, desc='Evaluating'):
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = F.softmax(outputs, dim=1)
            
            for i in range(len(labels)):
                all_predictions.append(outputs[i].cpu())
                all_labels.append(labels[i].item())
                all_probs.append(probs[i].cpu().numpy())
                all_indices.append(idx)
                idx += 1
    
    return all_predictions, all_labels, all_probs, all_indices


def save_test_images(test_dataset, indices: list, output_dir: Path):
    """Save test images to static folder"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get raw dataset without transforms for saving images
    raw_dataset = datasets.CIFAR10(root='./data', train=False, download=False)
    
    print(f"Saving {len(indices)} test images to {output_dir}...")
    for idx in tqdm(indices, desc='Saving images'):
        img, _ = raw_dataset[idx]  # PIL Image
        img_path = output_dir / f"{idx:05d}.png"
        img.save(img_path)


def generate_artifacts(
    all_labels: list,
    all_probs: list,
    all_indices: list,
    output_dir: Path,
    image_base_url: str = "/static/images/test"
):
    """Generate all dashboard artifacts from evaluation results"""
    
    num_samples = len(all_labels)
    num_classes = 10
    
    # Initialize metrics
    confusion_matrix = np.zeros((num_classes, num_classes), dtype=int)
    predictions_data = []
    
    # Per-class tracking
    class_correct = defaultdict(int)
    class_total = defaultdict(int)
    class_error_confidences = defaultdict(list)
    
    # Confidence buckets for calibration curve
    conf_buckets = {
        '0.0-0.2': {'correct': 0, 'total': 0, 'min': 0.0, 'max': 0.2},
        '0.2-0.3': {'correct': 0, 'total': 0, 'min': 0.2, 'max': 0.3},
        '0.3-0.4': {'correct': 0, 'total': 0, 'min': 0.3, 'max': 0.4},
        '0.4-0.5': {'correct': 0, 'total': 0, 'min': 0.4, 'max': 0.5},
        '0.5-0.6': {'correct': 0, 'total': 0, 'min': 0.5, 'max': 0.6},
        '0.6-0.7': {'correct': 0, 'total': 0, 'min': 0.6, 'max': 0.7},
        '0.7-0.8': {'correct': 0, 'total': 0, 'min': 0.7, 'max': 0.8},
        '0.8-0.9': {'correct': 0, 'total': 0, 'min': 0.8, 'max': 0.9},
        '0.9-1.0': {'correct': 0, 'total': 0, 'min': 0.9, 'max': 1.0},
    }
    
    # Breakdown counters
    correct_confident = 0  # Correct & conf >= 0.8
    correct_unsure = 0     # Correct & conf < 0.8
    wrong_unsure = 0       # Wrong & conf < 0.8
    wrong_confident = 0    # Wrong & conf >= 0.8
    
    print("Processing predictions...")
    for i in tqdm(range(num_samples)):
        true_label = all_labels[i]
        probs = all_probs[i]
        idx = all_indices[i]
        
        pred_label = np.argmax(probs)
        confidence = probs[pred_label]
        is_correct = bool(pred_label == true_label)
        is_high_conf_error = bool((not is_correct) and (confidence >= CONF_THRESHOLD))
        
        # Update confusion matrix
        confusion_matrix[true_label][pred_label] += 1
        
        # Update class stats
        class_total[true_label] += 1
        if is_correct:
            class_correct[true_label] += 1
        else:
            class_error_confidences[true_label].append(confidence)
        
        # Update confidence buckets
        for bucket_name, bucket in conf_buckets.items():
            if bucket['min'] <= confidence < bucket['max'] or \
               (bucket['max'] == 1.0 and confidence == 1.0):
                bucket['total'] += 1
                if is_correct:
                    bucket['correct'] += 1
                break
        
        # Update breakdown
        if is_correct:
            if confidence >= CONF_THRESHOLD:
                correct_confident += 1
            else:
                correct_unsure += 1
        else:
            if confidence >= CONF_THRESHOLD:
                wrong_confident += 1
            else:
                wrong_unsure += 1
        
        # Get top-k predictions
        top_k_indices = np.argsort(probs)[::-1][:3]
        top_predictions = [
            {"label": CIFAR10_LABELS[k], "probability": round(float(probs[k]), 4)}
            for k in top_k_indices
        ]
        
        # Build prediction record
        prediction_record = {
            "id": f"pred_{idx:05d}",
            "imageUrl": f"{image_base_url}/{idx:05d}.png",
            "trueLabel": CIFAR10_LABELS[true_label],
            "predictedLabel": CIFAR10_LABELS[pred_label],
            "confidence": round(float(confidence), 4),
            "isCorrect": is_correct,
            "isHighConfidenceError": is_high_conf_error,
            "topPredictions": top_predictions
        }
        predictions_data.append(prediction_record)
    
    # Calculate metrics
    total_correct = sum(class_correct.values())
    accuracy = total_correct / num_samples
    total_failures = num_samples - total_correct
    
    # Per-class precision/recall for macro averaging
    precisions = []
    recalls = []
    for c in range(num_classes):
        tp = confusion_matrix[c][c]
        fp = sum(confusion_matrix[r][c] for r in range(num_classes)) - tp
        fn = sum(confusion_matrix[c]) - tp
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        
        precisions.append(precision)
        recalls.append(recall)
    
    macro_precision = np.mean(precisions)
    macro_recall = np.mean(recalls)
    f1_score = 2 * macro_precision * macro_recall / (macro_precision + macro_recall) \
               if (macro_precision + macro_recall) > 0 else 0
    
    # Average confidence
    avg_confidence = np.mean([p['confidence'] for p in predictions_data])
    
    # ===== Save artifacts =====
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. predictions.jsonl
    print("Saving predictions.jsonl...")
    with open(output_dir / "predictions.jsonl", 'w') as f:
        for pred in predictions_data:
            f.write(json.dumps(pred) + '\n')
    
    # 2. confusion_matrix.json
    print("Saving confusion_matrix.json...")
    cm_data = {
        "labels": CIFAR10_LABELS,
        "matrix": confusion_matrix.tolist()
    }
    with open(output_dir / "confusion_matrix.json", 'w') as f:
        json.dump(cm_data, f, indent=2)
    
    # 3. confidence_curve.json
    print("Saving confidence_curve.json...")
    curve_data = []
    for bucket_name, bucket in conf_buckets.items():
        total = bucket['total']
        correct = bucket['correct']
        curve_data.append({
            "confidenceBucket": bucket_name,
            "confidenceMin": bucket['min'],
            "confidenceMax": bucket['max'],
            "totalCount": total,
            "correctCount": correct,
            "incorrectCount": total - correct,
            "accuracyInBucket": round(correct / total, 3) if total > 0 else 0
        })
    with open(output_dir / "confidence_curve.json", 'w') as f:
        json.dump(curve_data, f, indent=2)
    
    # 4. errors_by_class.json
    print("Saving errors_by_class.json...")
    errors_data = []
    for c in range(num_classes):
        total = class_total[c]
        correct = class_correct[c]
        errors = total - correct
        error_confs = class_error_confidences[c]
        avg_err_conf = np.mean(error_confs) if error_confs else 0
        
        errors_data.append({
            "className": CIFAR10_LABELS[c],
            "totalSamples": total,
            "correctCount": correct,
            "errorCount": errors,
            "errorRate": round(errors / total, 4) if total > 0 else 0,
            "avgConfidenceOnErrors": round(float(avg_err_conf), 4)
        })
    with open(output_dir / "errors_by_class.json", 'w') as f:
        json.dump(errors_data, f, indent=2)
    
    # 5. overview.json
    print("Saving overview.json...")
    overview_data = {
        "modelName": "SimpleCNN (CIFAR-10)",
        "datasetName": "CIFAR-10 Test Set",
        "totalSamples": num_samples,
        "accuracy": round(accuracy, 4),
        "precision": round(macro_precision, 4),
        "recall": round(macro_recall, 4),
        "f1Score": round(f1_score, 4),
        "avgConfidence": round(float(avg_confidence), 4),
        "correctConfident": round(100 * correct_confident / num_samples, 1),
        "correctUnsure": round(100 * correct_unsure / num_samples, 1),
        "wrongUnsure": round(100 * wrong_unsure / num_samples, 1),
        "wrongConfident": round(100 * wrong_confident / num_samples, 1),
        "totalFailures": total_failures
    }
    with open(output_dir / "overview.json", 'w') as f:
        json.dump(overview_data, f, indent=2)
    
    # 6. labels.json
    print("Saving labels.json...")
    with open(output_dir / "labels.json", 'w') as f:
        json.dump(CIFAR10_LABELS, f, indent=2)
    
    print("\n===== Artifact Generation Complete =====")
    print(f"Accuracy: {accuracy*100:.2f}%")
    print(f"Total Failures: {total_failures}")
    print(f"High Confidence Errors: {wrong_confident} ({100*wrong_confident/num_samples:.1f}%)")
    print(f"Artifacts saved to: {output_dir}")
    
    return overview_data


def run_evaluation(epochs: int = 3, seed: int = 42, 
                   save_images: bool = True,
                   output_dir: Optional[Path] = None,
                   images_dir: Optional[Path] = None):
    """
    Main evaluation pipeline:
    1. Train model on CIFAR-10
    2. Evaluate on test set
    3. Generate all artifacts
    4. Save test images
    """
    # Set paths
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / "data"
    if images_dir is None:
        images_dir = Path(__file__).parent.parent / "static" / "images" / "test"
    
    # Set seed for reproducibility
    print(f"Setting random seed: {seed}")
    set_seed(seed)
    
    # Device
    device = 'cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    # Get data
    print("Loading CIFAR-10 dataset...")
    train_loader, test_loader, test_dataset = get_data_loaders()
    
    # Initialize model
    model = SimpleCNN()
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Train
    print(f"\nTraining for {epochs} epochs...")
    model = train_model(model, train_loader, epochs=epochs, device=device)
    
    # Evaluate
    print("\nRunning evaluation on test set...")
    all_preds, all_labels, all_probs, all_indices = evaluate_model(
        model, test_loader, device=device
    )
    
    # Save images
    if save_images:
        print("\nSaving test images...")
        save_test_images(test_dataset, all_indices, images_dir)
    
    # Generate artifacts
    print("\nGenerating artifacts...")
    overview = generate_artifacts(
        all_labels, all_probs, all_indices, output_dir
    )
    
    return overview


def main():
    parser = argparse.ArgumentParser(
        description='CIFAR-10 Model Evaluator - Generate ML Failure Analysis Artifacts'
    )
    parser.add_argument(
        '--epochs', type=int, default=3,
        help='Number of training epochs (default: 3)'
    )
    parser.add_argument(
        '--seed', type=int, default=42,
        help='Random seed for reproducibility (default: 42)'
    )
    parser.add_argument(
        '--no-images', action='store_true',
        help='Skip saving test images (faster, use if images already exist)'
    )
    parser.add_argument(
        '--output-dir', type=str, default=None,
        help='Output directory for artifacts (default: backend/app/data)'
    )
    
    args = parser.parse_args()
    
    output_dir = Path(args.output_dir) if args.output_dir else None
    
    run_evaluation(
        epochs=args.epochs,
        seed=args.seed,
        save_images=not args.no_images,
        output_dir=output_dir
    )


if __name__ == '__main__':
    main()


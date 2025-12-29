# ML Failure Analysis Dashboard

> **Live Demo:** [Your Vercel URL here]

A dashboard for analyzing ML model failures, with a focus on identifying dangerous high-confidence errors. Built with React + TypeScript (frontend) and FastAPI (backend).

Built for the [Internship Name] application to demonstrate production-grade ML debugging tools.

## 🎯 What to Look At

This dashboard's killer feature: **finding high-confidence wrong predictions** — the most dangerous errors in production.

### Screenshot 1: Overview + Confusion Matrix
![Overview](./docs/overview.png)
- Model achieves ~88% accuracy on CIFAR-10
- **4.7% of predictions are high-confidence but wrong** (the red danger zone)
- Confusion matrix shows cat↔dog and automobile↔truck are major confusion pairs

### Screenshot 2: High Confidence Wrong Filter
![Confident Wrong](./docs/confident-wrong.png)
- Click "Only Confident Wrong" checkbox to reveal the killer feature
- These are predictions where the model is ≥80% confident but completely wrong
- Notice the confidence scores: 0.85, 0.91, 0.93 — dangerously overconfident

### Screenshot 3: Sample Inspector
![Inspector](./docs/inspector.png)
- Click any row to inspect in detail
- See the full top-3 predictions and confidence breakdown
- Actual image from CIFAR-10 test set shown

### Screenshot 4: Reliability Diagram + Slice Explorer
![Calibration](./docs/calibration.png)
- **ECE (Expected Calibration Error)**: 4.23% — shows model is fairly well calibrated
- Click confusion matrix cells to explore specific error slices (e.g., "cat → dog")
- Export filtered predictions as CSV/JSONL for deeper analysis

---

## 🚀 Quick Start (Local Development)

### Option 1: Frontend Only (Mock Data)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 - uses mock data by default.

### Option 2: Full Stack (Real Backend)

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then create `frontend/.env.local`:
```env
VITE_USE_MOCKS=false
VITE_API_BASE=http://localhost:8000
```

## 📦 Production Deployment (Real Data)

> 📖 **Detailed deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

### Step 1: Deploy Backend to Railway

**Why Railway?** Free tier, easy Python deployment, persistent storage.

1. **Create account** at [railway.app](https://railway.app)

2. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

3. **Deploy backend:**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Set environment variables** in Railway Dashboard:
   - Add your domain to CORS if needed
   
5. **Get your backend URL:** e.g., `https://ml-dashboard-backend.up.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set environment variables** in Vercel Dashboard:
   - `VITE_USE_MOCKS` = `false`
   - `VITE_API_BASE` = `https://your-railway-url.railway.app`

4. **Redeploy** to apply env vars:
   ```bash
   vercel --prod
   ```

### Alternative: Render (Backend)

If you prefer [render.com](https://render.com):
1. Connect your GitHub repo
2. Create a new Web Service
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables if needed

## 🛠 Features

### Core
- **Model Overview** - Accuracy, precision, recall, F1, confidence breakdown
- **Confusion Matrix** - Clickable cells to explore error slices
- **Confidence Curve** - Accuracy vs confidence buckets
- **Errors by Class** - Bar chart of error distribution

### v2 Features
- **Reliability Diagram** - Model calibration with ECE (Expected Calibration Error)
- **Slice Explorer** - Click confusion matrix cells to filter to specific misclassifications
- **Export** - Download filtered predictions as CSV or JSONL
- **Overconfident Errors Toggle** - Highlight dangerous high-confidence mistakes

## 📁 Project Structure

```
ml-failure-dashboard/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/             # API client & types
│   │   ├── components/      # React components
│   │   └── pages/           # Dashboard page
│   ├── vercel.json          # Vercel config
│   └── package.json
│
├── backend/                  # FastAPI
│   ├── app/
│   │   ├── api/routes.py    # API endpoints
│   │   ├── data/            # JSON artifacts
│   │   ├── models/          # Pydantic schemas
│   │   └── services/        # Data store & evaluator
│   └── requirements.txt
│
└── README.md
```

## 🔗 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/overview` | Model metrics & failure breakdown |
| `GET /api/confusion-matrix` | Confusion matrix data |
| `GET /api/confidence-curve` | Calibration curve data |
| `GET /api/errors-by-class` | Error distribution by class |
| `GET /api/predictions` | Paginated predictions with filters |
| `GET /api/predictions/{id}` | Single prediction by ID |
| `GET /api/calibration` | Reliability diagram data with ECE |
| `GET /api/export` | Export predictions as CSV or JSONL |

## 🧠 Generate Real Data (CIFAR-10)

**Before deploying, generate real evaluation artifacts:**

```bash
cd backend
source venv/bin/activate

# Install dependencies (if not done)
pip install -r requirements.txt

# Train model and generate artifacts (~5-10 minutes)
python -m app.services.evaluator --epochs 3 --seed 42
```

This will:
- ✅ Train a SimpleCNN on CIFAR-10 (reaches ~65-75% accuracy)
- ✅ Evaluate on 10,000 test images
- ✅ Generate all JSON artifacts in `app/data/`
- ✅ Save test images to `app/static/images/test/`
- ✅ Compute calibration (ECE) and reliability diagram data

**Note:** Use `--epochs 5` for better accuracy (~80%) but takes longer.

## 📸 Taking Screenshots for README

After running the app locally with real data:

1. **Screenshot 1 (Overview + Confusion Matrix):**
   - Open http://localhost:5173
   - Capture the top section with metrics cards and confusion matrix
   - Save as `docs/overview.png`

2. **Screenshot 2 (High Confidence Wrong):**
   - Check the "Only Confident Wrong" checkbox in filters
   - Click "Apply"
   - Capture the failure table showing confident-wrong predictions
   - Save as `docs/confident-wrong.png`

3. **Screenshot 3 (Sample Inspector):**
   - Click on any row in the failure table
   - Capture the right panel showing image + predictions
   - Save as `docs/inspector.png`

4. **Screenshot 4 (Calibration):**
   - Scroll down to "Model Calibration" section
   - Capture the reliability diagram with ECE value
   - Save as `docs/calibration.png`

**Tip:** Use a clean browser window, zoom to 100%, and capture in light mode for best visibility.

## ✅ Deployment Checklist

Before sharing with interviewers:

- [ ] Generate real data: `python -m app.services.evaluator --epochs 3`
- [ ] Take 4 screenshots and add to `docs/` folder
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel with backend URL
- [ ] Test deployed app works with real data
- [ ] Update README with live demo URL
- [ ] Commit screenshots to GitHub
- [ ] Test all features work in production:
  - [ ] High confidence wrong filter
  - [ ] Confusion matrix clicking
  - [ ] Export CSV/JSONL
  - [ ] Calibration diagram loads

## 🎓 Built For

This project was built as part of my application to [Internship Name]. It demonstrates:
- Full-stack development (React + FastAPI)
- ML/AI debugging and observability
- Production deployment (Vercel + Railway)
- Clean code architecture and documentation

**Tech Stack:**
- **Frontend:** React, TypeScript, Vite, TailwindCSS, Recharts
- **Backend:** FastAPI, Pydantic, PyTorch, scikit-learn
- **Deployment:** Vercel (frontend), Railway (backend)

## 📝 License

MIT

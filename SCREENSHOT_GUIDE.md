# Screenshot Guide

This guide helps you capture professional screenshots for your README.

## Setup

1. **Ensure app is running with REAL data:**
   ```bash
   # Terminal 1: Backend
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   
   # Terminal 2: Frontend  
   cd frontend
   npm run dev
   ```

2. **Open browser:**
   - Chrome/Edge recommended (best rendering)
   - Open DevTools (F12) → Device Toolbar (Ctrl+Shift+M)
   - Set to "Responsive" at 1920x1080
   - Or use desktop at 100% zoom

3. **Navigate to:** http://localhost:5173

## Screenshot 1: Overview + Confusion Matrix

**What to capture:** Top section showing metrics and visualizations

**Steps:**
1. Wait for all data to load (spinners disappear)
2. Scroll to top of page
3. Capture from header down to and including:
   - MetricCards (accuracy, precision, etc.)
   - Confusion Matrix
   - Confidence Curve  
   - Errors by Class charts

**Crop:** Show header + "Model Overview" + "Failure Patterns" sections

**Save as:** `docs/overview.png`

---

## Screenshot 2: High Confidence Wrong Filter

**What to capture:** The killer feature - showing dangerous errors

**Steps:**
1. Scroll down to "Failure Explorer" section
2. In the Filters Bar:
   - Check ☑ "Only Confident Wrong" checkbox
   - Click "Apply" button
3. Wait for table to refresh
4. Capture the Filters Bar + FailureTable showing:
   - Checkbox is checked
   - Table showing predictions with confidence ≥ 0.80
   - Red-highlighted confidence scores
   - Error indicators

**Important:** Make sure confidence values are clearly visible (0.85, 0.91, etc.)

**Save as:** `docs/confident-wrong.png`

---

## Screenshot 3: Sample Inspector

**What to capture:** Detail view of a single high-confidence error

**Steps:**
1. With "Only Confident Wrong" still active
2. Click on any row in the FailureTable (preferably one with conf > 0.85)
3. Wait for right panel to populate
4. Capture:
   - Left side: Selected row highlighted in table
   - Right side: Sample Inspector showing:
     - CIFAR-10 test image
     - True label vs Predicted label
     - Confidence score
     - Top-3 predictions with probabilities

**Tip:** Choose a visually interesting error (cat↔dog is good)

**Save as:** `docs/inspector.png`

---

## Screenshot 4: Reliability Diagram + Slice Explorer

**What to capture:** Calibration metrics and slice exploration

**Option A - Just Calibration:**
1. Clear filters (click "Clear all")
2. Scroll to "Model Calibration" section
3. Capture:
   - Reliability Diagram chart
   - ECE value (should be ~4-5%)
   - Legend and tooltips if visible

**Option B - Slice Explorer (Better!):**
1. Clear all filters
2. Scroll back up to Confusion Matrix
3. Click on a cell with errors (e.g., cat→dog, row 3, col 5)
4. Capture:
   - Confusion Matrix with one cell highlighted (cyan)
   - Slice chip showing "cat → dog" with X button
   - Auto-filtered failure table below

**Save as:** `docs/calibration.png`

---

## Screenshot Tips

### Before Taking Screenshots:
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Hide bookmarks bar (Ctrl+Shift+B)
- ✅ Close other tabs
- ✅ Disable browser extensions (or use Incognito)
- ✅ Set browser zoom to 100%

### Composition:
- 📐 Leave some padding around edges (don't crop too tight)
- 🎨 Capture during loading animations is fine (shows it's dynamic)
- 📊 Ensure numbers/text are legible
- 🖼️ PNG format (not JPG) for crisp text

### Tools:
- **Mac:** Cmd+Shift+4 (drag to select area)
- **Windows:** Win+Shift+S (Snipping Tool)
- **Linux:** Flameshot or Spectacle
- **Chrome DevTools:** Ctrl+Shift+P → "Capture screenshot"

### Quality Check:
After taking each screenshot:
1. Open in image viewer
2. Check text is readable at 100%
3. Verify colors are accurate
4. Ensure all important elements are visible

---

## After Screenshots

1. **Optimize images** (optional but recommended):
   ```bash
   # Install ImageMagick
   brew install imagemagick  # Mac
   sudo apt install imagemagick  # Linux
   
   # Resize if too large (keep under 500KB each)
   convert docs/overview.png -resize 1920x docs/overview.png
   ```

2. **Verify in README:**
   ```bash
   # Preview locally
   open README.md  # Mac
   code README.md  # VSCode
   ```

3. **Commit to Git:**
   ```bash
   git add docs/*.png
   git commit -m "docs: add screenshots for README"
   git push origin main
   ```

4. **Check on GitHub:**
   - Go to your repo
   - View README
   - Ensure images display correctly
   - If not, check file paths match

---

## Alternative: Use Demo Data

If you can't generate real data, the mock data works too:
- Screenshots will still look professional
- Shows you understand the domain
- Can mention "mock data" in interview if asked

But real data is better because:
- More authentic metrics
- Actual CIFAR-10 images
- Shows you ran the full pipeline



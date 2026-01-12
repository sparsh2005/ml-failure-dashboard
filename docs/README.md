# Screenshots Folder

Place your screenshots here:

- `overview.png` - Overview + Confusion Matrix
- `confident-wrong.png` - Failure table filtered to high confidence errors
- `inspector.png` - Sample inspector showing a confident-wrong example
- `calibration.png` - Reliability diagram with ECE

## How to Take Screenshots

1. Run the app locally with real data:
   ```bash
   cd backend && source venv/bin/activate
   python -m app.services.evaluator --epochs 3
   uvicorn app.main:app --reload --port 8000
   ```

2. In another terminal:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open http://localhost:5173 and take screenshots as described in main README

## Screenshot Tips

- Use 100% zoom in browser
- Capture at 1920x1080 or similar resolution
- Use clean browser window (no extensions, bookmarks bar hidden)
- Make sure data is loaded before capturing
- Crop to show relevant sections clearly



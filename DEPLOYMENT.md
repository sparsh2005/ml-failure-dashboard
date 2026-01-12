# Deployment Guide

## Prerequisites

✅ **You already have:**
- Real CIFAR-10 data generated in `backend/app/data/`
- Test images in `backend/app/static/images/test/`
- Frontend built and tested locally

## Option A: Railway (Recommended - Easiest)

### 1. Deploy Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to backend
cd backend

# Initialize Railway project
railway init

# Deploy (takes 2-3 minutes)
railway up

# Get your backend URL
railway domain
```

Your backend will be at: `https://ml-failure-dashboard-backend.up.railway.app` (or similar)

**Test it:** Open `https://your-url.railway.app/docs` to see API docs

### 2. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd ../frontend

# Deploy to production
vercel --prod
```

**When prompted:**
- Setup and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **ml-failure-dashboard**
- Directory? **./**
- Override settings? **N**

### 3. Connect Frontend to Backend

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   ```
   VITE_USE_MOCKS = false
   VITE_API_BASE = https://your-railway-url.up.railway.app
   ```
3. Redeploy: `vercel --prod`

### 4. Update CORS in Backend

If you get CORS errors, update `backend/app/main.py`:

```python
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-vercel-app.vercel.app",  # Add your Vercel URL
]
```

Then redeploy backend: `railway up`

---

## Option B: Render (Alternative)

### 1. Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name:** ml-failure-dashboard-backend
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Click "Create Web Service"

Wait 5-10 minutes for deployment.

### 2. Deploy Frontend (Same as Railway)

Follow steps 2-4 from Railway guide above.

---

## Option C: Both on Vercel (Advanced)

Deploy backend as Vercel Serverless Function:

1. Move backend to `/api` directory
2. Convert FastAPI to Vercel-compatible format
3. Deploy everything with `vercel --prod`

**Note:** Not recommended for ML apps with large data files.

---

## Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.railway.app/health
# Should return: {"status":"healthy"}
```

### API Test
```bash
curl https://your-backend-url.railway.app/api/overview
# Should return JSON with model metrics
```

### Frontend Test
1. Open your Vercel URL
2. Wait for data to load (may take 5-10 seconds first time)
3. Test features:
   - ✅ Overview loads
   - ✅ Confusion matrix displays
   - ✅ Click confusion matrix cell (slice explorer)
   - ✅ Check "Only Confident Wrong"
   - ✅ Click Export → CSV

---

## Troubleshooting

### CORS Error
**Problem:** Frontend can't connect to backend

**Solution:** 
1. Add your Vercel URL to CORS origins in `backend/app/main.py`
2. Redeploy backend

### 502 Bad Gateway (Railway)
**Problem:** Backend crashed or taking too long to start

**Solution:**
1. Check Railway logs: `railway logs`
2. Ensure all dependencies in `requirements.txt`
3. Check memory usage (upgrade Railway plan if needed)

### Static Files Not Loading (Images)
**Problem:** CIFAR-10 test images return 404

**Solution:**
1. Ensure images are in `backend/app/static/images/test/`
2. Check Railway includes static files (they should)
3. Test: `https://your-backend-url.railway.app/static/images/test/00000.png`

### Slow First Load
**Problem:** Vercel/Railway cold start takes 10-20 seconds

**Solution:** 
- Expected behavior on free tier
- Consider keeping backend warm with uptimerobot.com
- Upgrade to paid plan for instant wake

---

## Cost

- **Railway Free Tier:** $5 credit/month (enough for this project)
- **Vercel Free Tier:** Unlimited for personal projects
- **Render Free Tier:** 750 hours/month

**Total cost: $0** for demo purposes! 🎉

---

## Final Checklist

Before sharing with interviewers:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed with backend URL configured
- [ ] All 4 screenshots taken and added to `docs/`
- [ ] README updated with live demo URL
- [ ] Test all features in production
- [ ] Check mobile responsiveness
- [ ] Commit all changes to GitHub
- [ ] Share both GitHub repo and live demo URL

Good luck with your interview! 🚀



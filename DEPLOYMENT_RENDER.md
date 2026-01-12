# Deploy Backend to Render (GUI Only - No CLI)

This is the **easiest** way to deploy. No terminal commands needed!

## Step 1: Sign Up

1. Go to [render.com](https://render.com)
2. Click "Get Started" 
3. Sign up with GitHub (recommended)

## Step 2: Create Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect Account"** to link your GitHub
4. Find and select your `ml-failure-dashboard` repository

## Step 3: Configure

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `ml-failure-dashboard-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Python 3` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

## Step 4: Deploy

1. Scroll down and click **"Create Web Service"**
2. Wait 5-10 minutes for deployment (watch the logs)
3. When you see "Your service is live 🎉", you're done!

## Step 5: Get Your URL

Your backend URL will be something like:
```
https://ml-failure-dashboard-backend.onrender.com
```

Copy this URL - you'll need it for Vercel!

## Step 6: Test

Open in browser:
```
https://your-url.onrender.com/docs
```

You should see the FastAPI documentation page!

---

## Troubleshooting

### Build Failed?

**Check the logs** in Render dashboard. Common issues:

1. **Missing requirements.txt**
   - Make sure `backend/requirements.txt` exists
   - Solution: Already fixed in your repo ✅

2. **Python version mismatch**
   - Add a `runtime.txt` file in backend folder:
     ```
     python-3.11.0
     ```

3. **Out of memory**
   - Render free tier has 512MB RAM
   - This should be enough for your app
   - If not, upgrade to paid plan ($7/mo)

### Deployment is slow?

First deployment takes 5-10 minutes. This is normal!
- Installing PyTorch takes time
- Subsequent deploys are faster (cached)

### Cold starts (first request is slow)?

On free tier, Render spins down after 15 min of inactivity.
- First request after sleep takes ~30 seconds to wake up
- This is fine for demo purposes
- Upgrade to paid plan for always-on

---

## Next Steps

Now deploy your frontend! Go back to main DEPLOYMENT.md:
- Section "Deploy Frontend to Vercel" (Step 2)
- Use this Render URL instead of Railway URL

Done! 🎉


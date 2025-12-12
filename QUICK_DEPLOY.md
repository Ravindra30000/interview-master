# Quick Deploy Guide - Google Cloud Run

## Prerequisites Check

1. ✅ **Google Cloud Account** with billing enabled
2. ✅ **gcloud CLI** installed: `gcloud --version`
3. ✅ **Project ID** ready

## Quick Start (Windows PowerShell)

### Step 1: Install gcloud CLI (if not installed)

Download from: https://cloud.google.com/sdk/docs/install

Or use Chocolatey:
```powershell
choco install gcloudsdk
```

### Step 2: Login and Setup

```powershell
# Login
gcloud auth login

# Set your project (replace YOUR_PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### Step 3: Create .env.production

Copy `.env.example` to `.env.production` and fill in your values:

```powershell
Copy-Item .env.example .env.production
# Then edit .env.production with your actual values
```

### Step 4: Deploy

**Option A: Use PowerShell script (Easiest)**
```powershell
.\deploy.ps1 -ProjectId "your-project-id" -Region "us-central1"
```

**Option B: Manual deployment**
```powershell
gcloud run deploy interview-master `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=your_key,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain,NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id,NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id,NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key,NODE_ENV=production" `
  --memory=1Gi `
  --cpu=1 `
  --timeout=300
```

### Step 5: Get Your URL

After deployment, you'll get a URL like:
```
https://interview-master-xxxxx-uc.a.run.app
```

### Step 6: Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` with your actual URL:

```powershell
gcloud run services update interview-master `
  --update-env-vars="NEXT_PUBLIC_APP_URL=https://your-actual-url.run.app" `
  --region us-central1
```

### Step 7: Configure Firebase CORS

Update Firebase Storage CORS to allow your Cloud Run domain:

```powershell
# Create cors.json
@'
[{
  "origin": ["https://your-service-url.run.app"],
  "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
  "maxAgeSeconds": 3600
}]
'@ | Out-File -FilePath cors.json -Encoding utf8

# Apply CORS (replace YOUR_BUCKET_NAME)
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

## Troubleshooting

**Build fails?**
- Check `next.config.mjs` has `output: 'standalone'` ✅ (already done)
- Ensure all dependencies are installed

**Service won't start?**
```powershell
# Check logs
gcloud run services logs read interview-master --region us-central1 --limit=50
```

**CORS errors?**
- Make sure Firebase Storage CORS is configured
- Verify `NEXT_PUBLIC_APP_URL` matches your Cloud Run URL

## That's It! 🎉

Your app should now be live at your Cloud Run URL!


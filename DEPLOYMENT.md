# Google Cloud Run Deployment Guide

This guide will help you deploy InterviewMaster to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed and configured
3. **Docker** installed (for local testing)
4. **Project ID** created in Google Cloud Console

## Step 1: Install Google Cloud SDK

If you haven't already:

```bash
# Windows (PowerShell)
# Download from: https://cloud.google.com/sdk/docs/install

# Or use Chocolatey
choco install gcloudsdk

# Verify installation
gcloud --version
```

## Step 2: Authenticate and Set Up Project

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 3: Configure Environment Variables

Create a `.env.production` file with your production environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=https://your-service-url.run.app
NODE_ENV=production
```

## Step 4: Build and Deploy

### Option A: Deploy using gcloud (Recommended)

```bash
# Build and deploy in one command
gcloud run deploy interview-master \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=your_key,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain,NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id,NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id,NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key,NEXT_PUBLIC_APP_URL=https://interview-master-xxxxx.run.app,NODE_ENV=production" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10
```

### Option B: Build Docker image locally and push

```bash
# Set your project ID
export PROJECT_ID=YOUR_PROJECT_ID
export SERVICE_NAME=interview-master
export REGION=us-central1

# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=your_key,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain,NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id,NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id,NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key,NEXT_PUBLIC_APP_URL=https://interview-master-xxxxx.run.app,NODE_ENV=production" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10
```

## Step 5: Set Environment Variables via Console

Alternatively, set environment variables through the Cloud Console:

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service
3. Click "Edit & Deploy New Revision"
4. Go to "Variables & Secrets" tab
5. Add all environment variables
6. Click "Deploy"

## Step 6: Update Firebase CORS Settings

Update Firebase Storage CORS to allow your Cloud Run domain:

1. Go to Firebase Console → Storage
2. Click on "Rules" tab
3. Add CORS configuration:

```json
[
  {
    "origin": ["https://your-service-url.run.app"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Or use gsutil:

```bash
# Create cors.json file
echo '[{"origin": ["https://your-service-url.run.app"], "method": ["GET", "HEAD", "PUT", "POST", "DELETE"], "maxAgeSeconds": 3600}]' > cors.json

# Apply CORS
gsutil cors set cors.json gs://your-bucket-name
```

## Step 7: Update NEXT_PUBLIC_APP_URL

After deployment, update the `NEXT_PUBLIC_APP_URL` environment variable with your actual Cloud Run URL:

```bash
gcloud run services update interview-master \
  --update-env-vars="NEXT_PUBLIC_APP_URL=https://your-actual-url.run.app" \
  --region us-central1
```

## Troubleshooting

### Build fails
- Check that `next.config.mjs` has `output: 'standalone'`
- Ensure all dependencies are in `package.json`

### Service won't start
- Check logs: `gcloud run services logs read interview-master --region us-central1`
- Verify environment variables are set correctly
- Check memory allocation (increase if needed)

### CORS errors
- Ensure Firebase Storage CORS is configured
- Check that `NEXT_PUBLIC_APP_URL` matches your Cloud Run URL

### Timeout errors
- Increase timeout: `--timeout=600` (max 3600 seconds)
- Check API response times

## Useful Commands

```bash
# View logs
gcloud run services logs read interview-master --region us-central1 --limit=50

# Update service
gcloud run services update interview-master --region us-central1

# Delete service
gcloud run services delete interview-master --region us-central1

# List services
gcloud run services list
```

## Cost Estimation

Cloud Run pricing:
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests
- **Free tier**: 2 million requests/month, 360,000 GiB-seconds/month, 180,000 vCPU-seconds/month

For a small app, expect ~$5-20/month depending on usage.

## Next Steps

1. Set up a custom domain (optional)
2. Configure Cloud CDN for better performance
3. Set up monitoring and alerts
4. Configure auto-scaling limits

---

**Deployment URL**: After successful deployment, you'll get a URL like:
`https://interview-master-xxxxx-uc.a.run.app`


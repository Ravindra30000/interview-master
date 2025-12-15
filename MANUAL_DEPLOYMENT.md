# Manual Deployment Guide

## Step-by-Step Commands for Google Cloud Run

This guide provides manual commands for building and deploying the application to Google Cloud Run.

---

## Prerequisites

1. **Google Cloud SDK installed** (`gcloud` CLI)
2. **Authenticated with Google Cloud**: `gcloud auth login`
3. **Environment variables ready** (Firebase and Gemini API keys)

---

## Step 1: Select/Set Your Project

```bash
# List available projects
gcloud projects list

# Set your project (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify project is set
gcloud config get-value project
```

**Example:**

```bash
# First set the project ID as environment variable
export GCLOUD_PROJECT_ID="your-gcloud-project-id"
gcloud config set project $GCLOUD_PROJECT_ID
```

---

## Step 2: Set Environment Variables

Set your API keys and configuration values:

```bash
# Google Cloud Project ID
export GCLOUD_PROJECT_ID="your-gcloud-project-id"

# Firebase Configuration
export FIREBASE_API_KEY="your-firebase-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export FIREBASE_APP_ID="your-app-id"

# Gemini API Key
export GEMINI_API_KEY="your-gemini-api-key"
```

**Verify variables are set:**

```bash
echo $FIREBASE_API_KEY
echo $GEMINI_API_KEY
```

---

## Step 3: Build Docker Image

Build the Docker image using Google Cloud Build:

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY"
```

**What this does:**

- Submits build to Google Cloud Build
- Uses `cloudbuild.yaml` configuration
- Passes environment variables as build arguments
- Builds Docker image and pushes to Container Registry
- Image will be available at: `gcr.io/YOUR_PROJECT_ID/interview-master:latest`

**Expected output:**

```
Creating temporary tarball...
Uploading tarball to Cloud Storage...
Starting build...
...
Build finished successfully
```

---

## Step 4: Deploy to Cloud Run

Deploy the built image to Cloud Run:

```bash
gcloud run deploy interview-master \
  --image gcr.io/$(gcloud config get-value project)/interview-master:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --port=3000
```

**Parameters explained:**

- `--image`: Docker image to deploy (uses current project)
- `--platform managed`: Fully managed Cloud Run
- `--region`: Deployment region (us-central1, us-east1, etc.)
- `--allow-unauthenticated`: Make service publicly accessible
- `--memory`: Memory allocation (1Gi = 1GB)
- `--cpu`: CPU allocation (1 CPU)
- `--timeout`: Request timeout in seconds (300 = 5 minutes)
- `--max-instances`: Maximum concurrent instances
- `--port`: Container port (3000 for Next.js)

**Expected output:**

```
Deploying container to Cloud Run service [interview-master] in project [YOUR_PROJECT] region [us-central1]
...
Service [interview-master] revision [interview-master-00001-abc] has been deployed and is serving 100 percent of traffic.
Service URL: https://interview-master-xxxxx-uc.a.run.app
```

---

## Complete Command Sequence (Copy-Paste Ready)

Here's the complete sequence you can copy and paste:

```bash
# Step 1: Set project (use environment variable)
export GCLOUD_PROJECT_ID="your-gcloud-project-id"
gcloud config set project $GCLOUD_PROJECT_ID

# Step 2: Set environment variables (replace with your values)
export GCLOUD_PROJECT_ID="your-gcloud-project-id"
export FIREBASE_API_KEY="your-firebase-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export FIREBASE_APP_ID="your-app-id"
export GEMINI_API_KEY="your-gemini-api-key"

# Step 3: Build
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY"

# Step 4: Deploy
gcloud run deploy interview-master \
  --image gcr.io/$GCLOUD_PROJECT_ID/interview-master:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --port=3000
```

---

## Alternative: Build and Deploy in One Command

If you want to build and deploy together:

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Set environment variables
export FIREBASE_API_KEY="your-firebase-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export FIREBASE_APP_ID="your-app-id"
export GEMINI_API_KEY="your-gemini-api-key"

# Build and deploy
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY" && \
gcloud run deploy interview-master \
  --image gcr.io/$(gcloud config get-value project)/interview-master:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --port=3000
```

---

## Verify Deployment

After deployment, verify the service is running:

```bash
# Get service URL
gcloud run services describe interview-master \
  --region us-central1 \
  --format='value(status.url)'

# List all revisions
gcloud run revisions list --service interview-master --region us-central1

# View service logs
gcloud run services logs read interview-master --region us-central1
```

---

## Update Existing Deployment

To update an existing deployment with new code:

1. **Push code to GitHub** (if not already done)
2. **Run Step 3 (Build)** again
3. **Run Step 4 (Deploy)** again

Cloud Run will automatically create a new revision and route traffic to it.

---

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Verify project has Cloud Build API enabled
- Check build logs: `gcloud builds list`

### Deployment Fails

- Verify image exists: `gcloud container images list`
- Check Cloud Run API is enabled
- Verify you have necessary permissions

### Service Not Accessible

- Check `--allow-unauthenticated` flag is set
- Verify service URL is correct
- Check service logs for errors

---

## Quick Reference

```bash
# Set project
gcloud config set project PROJECT_ID

# Build
gcloud builds submit --config=cloudbuild.yaml --substitutions=...

# Deploy
gcloud run deploy SERVICE_NAME --image gcr.io/PROJECT_ID/IMAGE:latest ...

# Get URL
gcloud run services describe SERVICE_NAME --region REGION --format='value(status.url)'
```

---

**Ready to deploy!** Follow the steps above in order. 🚀

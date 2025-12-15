# Secure Deployment Guide

## 🔐 Security First

**IMPORTANT:** API keys are no longer hardcoded in deployment scripts. They must be provided as environment variables.

## Prerequisites

1. Generate API keys:

   - **Firebase API Key**: Get from [Firebase Console](https://console.firebase.google.com/) → Project Settings → General
   - **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

2. Set environment variables before deployment

## Deployment Methods

### Method 1: Using deploy-cloud-run.sh (Recommended)

```bash
# Set environment variables
export FIREBASE_API_KEY="your-firebase-api-key"
export GEMINI_API_KEY="your-gemini-api-key"

# Optional: Override other Firebase config if needed
export FIREBASE_AUTH_DOMAIN="interview-master-d8c6f.firebaseapp.com"
export FIREBASE_PROJECT_ID="interview-master-d8c6f"
export FIREBASE_STORAGE_BUCKET="interview-master-d8c6f.firebasestorage.app"
export FIREBASE_MESSAGING_SENDER_ID="921696971578"
export FIREBASE_APP_ID="1:921696971578:web:c252b8b7683e8e69893e03"

# Run deployment
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

### Method 2: Using deploy-fresh.sh (Fresh Clone)

```bash
# Set environment variables
export FIREBASE_API_KEY="your-firebase-api-key"
export GEMINI_API_KEY="your-gemini-api-key"

# Run deployment (will clone fresh repo)
chmod +x deploy-fresh.sh
./deploy-fresh.sh
```

### Method 3: Manual Deployment

```bash
# Set environment variables
export FIREBASE_API_KEY="your-firebase-api-key"
export GEMINI_API_KEY="your-gemini-api-key"

# Build
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="interview-master-d8c6f.firebaseapp.com",_FIREBASE_PROJECT_ID="interview-master-d8c6f",_FIREBASE_STORAGE_BUCKET="interview-master-d8c6f.firebasestorage.app",_FIREBASE_MESSAGING_SENDER_ID="921696971578",_FIREBASE_APP_ID="1:921696971578:web:c252b8b7683e8e69893e03",_GEMINI_API_KEY="$GEMINI_API_KEY"

# Deploy
gcloud run deploy interview-master \
  --image gcr.io/interview-master-d8c6f/interview-master:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10
```

## Updating API Keys in Cloud Run

If you need to update API keys after deployment:

```bash
# Update Gemini API key
gcloud run services update interview-master \
  --region us-central1 \
  --update-env-vars NEXT_PUBLIC_GEMINI_API_KEY="your-new-gemini-key" \
  --project interview-master-d8c6f

# Update Firebase API key (if needed)
gcloud run services update interview-master \
  --region us-central1 \
  --update-env-vars NEXT_PUBLIC_FIREBASE_API_KEY="your-new-firebase-key" \
  --project interview-master-d8c6f
```

## Security Checklist

- ✅ No API keys in code files
- ✅ No API keys in deployment scripts
- ✅ Environment variables used for sensitive data
- ✅ `.gitignore` excludes `.env` files and secrets
- ✅ Keys stored securely in Cloud Run environment variables

## Troubleshooting

### Error: "FIREBASE_API_KEY environment variable is not set"

**Solution:** Export the variable before running the script:

```bash
export FIREBASE_API_KEY="your-key"
```

### Error: "GEMINI_API_KEY environment variable is not set"

**Solution:** Export the variable before running the script:

```bash
export GEMINI_API_KEY="your-key"
```

### Keys not working after deployment

**Solution:** Update Cloud Run environment variables directly (see "Updating API Keys" above)

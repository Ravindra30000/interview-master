# Deployment Instructions for Google Cloud Run

## Prerequisites

- Code pushed to GitHub ✅
- Google Cloud project ID (you'll set this via environment variable)
- Google Cloud Shell access
- All Firebase and Gemini credentials ready (as environment variables)

## Step-by-Step Deployment

### Option 1: Using Google Cloud Shell (Recommended)

1. **Open Google Cloud Shell**

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click the Cloud Shell icon (top right) or press `Ctrl+Shift+` (backtick)

2. **Clone the repository**

   ```bash
   git clone https://github.com/Ravindra30000/interview-master.git
   cd interview-master
   ```

3. **Set environment variables** (REQUIRED - replace with your actual values)

   ```bash
   export FIREBASE_API_KEY="your-firebase-api-key"
   export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   export FIREBASE_PROJECT_ID="your-project-id"
   export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
   export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   export FIREBASE_APP_ID="your-app-id"
   export GEMINI_API_KEY="your-gemini-api-key"
   export GCLOUD_PROJECT_ID="your-gcloud-project-id"
   ```

4. **Set the project**

   ```bash
   gcloud config set project $GCLOUD_PROJECT_ID
   ```

5. **Build and deploy using the script**

   ```bash
   chmod +x deploy-cloud-run.sh
   ./deploy-cloud-run.sh
   ```

   OR manually run the commands (after setting environment variables):

   ```bash
   # First, set all required environment variables
   export FIREBASE_API_KEY="your-firebase-api-key"
   export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   export FIREBASE_PROJECT_ID="your-project-id"
   export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
   export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   export FIREBASE_APP_ID="your-app-id"
   export GEMINI_API_KEY="your-gemini-api-key"
   export GCLOUD_PROJECT_ID="your-gcloud-project-id"

   # Build Docker image
   gcloud builds submit \
     --config=cloudbuild.yaml \
     --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY"

   # Deploy to Cloud Run
   gcloud run deploy interview-master \
     --image gcr.io/$GCLOUD_PROJECT_ID/interview-master:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory=1Gi \
     --cpu=1 \
     --timeout=300 \
     --max-instances=10
   ```

6. **Get the service URL**
   ```bash
   gcloud run services describe interview-master --region=us-central1 --format='value(status.url)'
   ```

### Option 2: Using Local PowerShell (if gcloud is installed)

1. **Open PowerShell in the project directory**

   ```powershell
   cd C:\Users\91999\Desktop\interview-master
   ```

2. **Set environment variables** (REQUIRED - replace with your actual values)

   ```powershell
   $env:FIREBASE_API_KEY="your-firebase-api-key"
   $env:FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   $env:FIREBASE_PROJECT_ID="your-project-id"
   $env:FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
   $env:FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   $env:FIREBASE_APP_ID="your-app-id"
   $env:GEMINI_API_KEY="your-gemini-api-key"
   $env:GCLOUD_PROJECT_ID="your-gcloud-project-id"
   ```

3. **Set the project**

   ```powershell
   gcloud config set project $env:GCLOUD_PROJECT_ID
   ```

4. **Set environment variables** (PowerShell syntax)

   ```powershell
   $env:FIREBASE_API_KEY="your-firebase-api-key"
   $env:FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   $env:FIREBASE_PROJECT_ID="your-project-id"
   $env:FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
   $env:FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   $env:FIREBASE_APP_ID="your-app-id"
   $env:GEMINI_API_KEY="your-gemini-api-key"
   $env:GCLOUD_PROJECT_ID="your-gcloud-project-id"
   ```

5. **Build and deploy**

   ```powershell
   # Build Docker image
   gcloud builds submit `
     --config=cloudbuild.yaml `
     --substitutions=_FIREBASE_API_KEY="$env:FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$env:FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$env:FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$env:FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$env:FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$env:FIREBASE_APP_ID",_GEMINI_API_KEY="$env:GEMINI_API_KEY"

   # Deploy to Cloud Run
   gcloud run deploy interview-master `
     --image gcr.io/$env:GCLOUD_PROJECT_ID/interview-master:latest `
     --platform managed `
     --region us-central1 `
     --allow-unauthenticated `
     --memory=1Gi `
     --cpu=1 `
     --timeout=300 `
     --max-instances=10
   ```

## Expected Build Time

- Docker build: ~5-10 minutes
- Cloud Run deployment: ~2-3 minutes
- Total: ~7-13 minutes

## Verification

After deployment, visit the service URL and verify:

- ✅ Home page loads
- ✅ Can access without login (anonymous auth)
- ✅ Can start a practice session
- ✅ Video recording works
- ✅ Multimodal analysis works
- ✅ Cleanup page is accessible

## Troubleshooting

### Build fails with "auth/invalid-api-key"

- Ensure environment variables are correctly passed in `cloudbuild.yaml`
- Check that API keys are valid

### Deployment fails with permissions error

- Ensure Cloud Build service account has necessary permissions:
  ```bash
  PROJECT_NUMBER=$(gcloud projects describe $GCLOUD_PROJECT_ID --format='value(projectNumber)')
  gcloud projects add-iam-policy-binding $GCLOUD_PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/run.admin"
  ```

### Service returns 404

- Check that the service is deployed:
  ```bash
  gcloud run services list --region=us-central1
  ```

## Next Steps After Deployment

1. Test the deployed application
2. Update Kaggle submission with the new URL
3. Verify all features work in production
4. Monitor Cloud Run logs for any issues





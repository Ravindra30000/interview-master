# Deployment Instructions for Google Cloud Run

## Prerequisites
- Code pushed to GitHub ✅
- Google Cloud project: `interview-master-d8c6f`
- Google Cloud Shell access

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

3. **Set the project**
   ```bash
   gcloud config set project interview-master-d8c6f
   ```

4. **Build and deploy using the script**
   ```bash
   chmod +x deploy-cloud-run.sh
   ./deploy-cloud-run.sh
   ```

   OR manually run the commands:

   ```bash
   # Build Docker image
   gcloud builds submit \
     --config=cloudbuild.yaml \
     --substitutions=_FIREBASE_API_KEY="AIzaSyD8JAG1wmstFYNiflCSAhdSBFPTZPtbeOo",_FIREBASE_AUTH_DOMAIN="interview-master-d8c6f.firebaseapp.com",_FIREBASE_PROJECT_ID="interview-master-d8c6f",_FIREBASE_STORAGE_BUCKET="interview-master-d8c6f.firebasestorage.app",_FIREBASE_MESSAGING_SENDER_ID="921696971578",_FIREBASE_APP_ID="1:921696971578:web:c252b8b7683e8e69893e03",_GEMINI_API_KEY="AIzaSyBJCuxWYzP9_Xe5Ugv9avBrDRzWnAlYCdQ"

   # Deploy to Cloud Run
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

5. **Get the service URL**
   ```bash
   gcloud run services describe interview-master --region=us-central1 --format='value(status.url)'
   ```

### Option 2: Using Local PowerShell (if gcloud is installed)

1. **Open PowerShell in the project directory**
   ```powershell
   cd C:\Users\91999\Desktop\interview-master
   ```

2. **Set the project**
   ```powershell
   gcloud config set project interview-master-d8c6f
   ```

3. **Build and deploy**
   ```powershell
   # Build Docker image
   gcloud builds submit `
     --config=cloudbuild.yaml `
     --substitutions=_FIREBASE_API_KEY="AIzaSyD8JAG1wmstFYNiflCSAhdSBFPTZPtbeOo",_FIREBASE_AUTH_DOMAIN="interview-master-d8c6f.firebaseapp.com",_FIREBASE_PROJECT_ID="interview-master-d8c6f",_FIREBASE_STORAGE_BUCKET="interview-master-d8c6f.firebasestorage.app",_FIREBASE_MESSAGING_SENDER_ID="921696971578",_FIREBASE_APP_ID="1:921696971578:web:c252b8b7683e8e69893e03",_GEMINI_API_KEY="AIzaSyBJCuxWYzP9_Xe5Ugv9avBrDRzWnAlYCdQ"

   # Deploy to Cloud Run
   gcloud run deploy interview-master `
     --image gcr.io/interview-master-d8c6f/interview-master:latest `
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
  PROJECT_NUMBER=$(gcloud projects describe interview-master-d8c6f --format='value(projectNumber)')
  gcloud projects add-iam-policy-binding interview-master-d8c6f \
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


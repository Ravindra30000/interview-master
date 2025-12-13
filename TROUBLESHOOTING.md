# Deployment Troubleshooting Guide

## Common Errors and Solutions

### 1. Build Fails - "auth/invalid-api-key"

**Error:** `Firebase: Error (auth/invalid-api-key)`

**Solution:**

- Verify API keys are correct in the deployment command
- Ensure no extra spaces or quotes in the substitutions
- Check that Firebase project is active

### 2. Build Fails - "Permission Denied"

**Error:** `ERROR: (gcloud.builds.submit) User [user@email.com] does not have permission to access projects instance [project-id]`

**Solution:**

```bash
# Grant Cloud Build permissions
PROJECT_NUMBER=$(gcloud projects describe interview-master-d8c6f --format='value(projectNumber)')
gcloud projects add-iam-policy-binding interview-master-d8c6f \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding interview-master-d8c6f \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding interview-master-d8c6f \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### 3. Build Fails - "Dockerfile not found"

**Error:** `ERROR: (gcloud.builds.submit) Invalid value for [source]: Dockerfile required`

**Solution:**

- Ensure you're in the project root directory
- Verify `Dockerfile` exists: `ls -la Dockerfile`
- Check `cloudbuild.yaml` references the correct path

### 4. Build Fails - "npm ci failed"

**Error:** `npm ERR! code ERESOLVE` or `npm ERR! Cannot find module`

**Solution:**

- Check `package.json` and `package-lock.json` are committed
- Verify Node.js version in Dockerfile matches local (20)
- Try updating dependencies: `npm install`

### 5. Build Fails - "Next.js build error"

**Error:** TypeScript errors or build-time errors

**Solution:**

- Fix all TypeScript errors locally first: `npm run build`
- Ensure all environment variables are set during build
- Check for missing imports or type errors

### 6. Deployment Fails - "Image not found"

**Error:** `ERROR: (gcloud.run.deploy) Image 'gcr.io/...' not found`

**Solution:**

- Ensure build completed successfully first
- Check image exists: `gcloud container images list --repository=gcr.io/interview-master-d8c6f`
- Verify project ID matches in all commands

### 7. Service Returns 500 Error

**Error:** Application crashes on startup

**Solution:**

- Check Cloud Run logs: `gcloud run services logs read interview-master --region=us-central1`
- Verify environment variables are set correctly
- Check Firebase initialization in production

### 8. Service Returns 404

**Error:** Page not found

**Solution:**

- Verify service is deployed: `gcloud run services list --region=us-central1`
- Check service URL is correct
- Ensure routes are properly configured in Next.js

## Step-by-Step Debugging

### 1. Verify Project Setup

```bash
gcloud config set project interview-master-d8c6f
gcloud config get-value project
```

### 2. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Check Build Logs

```bash
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

### 4. Check Service Status

```bash
gcloud run services describe interview-master --region=us-central1
```

### 5. View Service Logs

```bash
gcloud run services logs read interview-master --region=us-central1 --limit=50
```

## Quick Fix Commands

### Rebuild and Redeploy

```bash
# Clean previous build
gcloud builds list --limit=1 --format="value(id)" | xargs -I {} gcloud builds cancel {}

# Rebuild
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="AIzaSyD8JAG1wmstFYNiflCSAhdSBFPTZPtbeOo",_FIREBASE_AUTH_DOMAIN="interview-master-d8c6f.firebaseapp.com",_FIREBASE_PROJECT_ID="interview-master-d8c6f",_FIREBASE_STORAGE_BUCKET="interview-master-d8c6f.firebasestorage.app",_FIREBASE_MESSAGING_SENDER_ID="921696971578",_FIREBASE_APP_ID="1:921696971578:web:c252b8b7683e8e69893e03",_GEMINI_API_KEY="AIzaSyAfpsnxc982R0T71KcCyAJiq4yQ1YG0NpQ"

# Redeploy
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

## Still Having Issues?

1. **Share the full error message** - Copy the complete error output
2. **Check build logs** - Run `gcloud builds list` and view the latest build
3. **Verify local build** - Ensure `npm run build` works locally
4. **Check permissions** - Verify IAM roles are correctly assigned

#!/bin/bash

# Fresh deployment script - ensures clean build
set -e

PROJECT_ID="interview-master-d8c6f"
REGION="us-central1"
SERVICE_NAME="interview-master"

echo "=== Step 1: Removing old clone if exists ==="
rm -rf interview-master

echo "=== Step 2: Cloning fresh repository ==="
git clone https://github.com/Ravindra30000/interview-master.git
cd interview-master

echo "=== Step 3: Verifying latest code ==="
git log --oneline -1
echo "Checking import statement..."
grep "import.*videoAnalysis" src/app/api/interviews/\[id\]/analyze/route.ts

echo "=== Step 4: Setting project ==="
gcloud config set project $PROJECT_ID

echo "=== Step 5: Building Docker image (NO CACHE) ==="
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="AIzaSyD8JAG1wmstFYNiflCSAhdSBFPTZPtbeOo",_FIREBASE_AUTH_DOMAIN="interview-master-d8c6f.firebaseapp.com",_FIREBASE_PROJECT_ID="interview-master-d8c6f",_FIREBASE_STORAGE_BUCKET="interview-master-d8c6f.firebasestorage.app",_FIREBASE_MESSAGING_SENDER_ID="921696971578",_FIREBASE_APP_ID="1:921696971578:web:c252b8b7683e8e69893e03",_GEMINI_API_KEY="AIzaSyAfpsnxc982R0T71KcCyAJiq4yQ1YG0NpQ"

echo "=== Step 6: Deploying to Cloud Run ==="
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/interview-master:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10

echo "=== Step 7: Getting service URL ==="
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"


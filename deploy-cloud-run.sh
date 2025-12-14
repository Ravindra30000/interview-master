#!/bin/bash

# Deployment script for Google Cloud Run
# This script builds the Docker image with environment variables and deploys to Cloud Run
# 
# SECURITY: API keys are read from environment variables, not hardcoded
# Set these before running:
#   export FIREBASE_API_KEY="your-firebase-key"
#   export GEMINI_API_KEY="your-gemini-key"
#   (Other Firebase config values have defaults but can be overridden)

set -e

PROJECT_ID="interview-master-d8c6f"
REGION="us-central1"
SERVICE_NAME="interview-master"

# Firebase Configuration - read from environment or use defaults
FIREBASE_API_KEY="${FIREBASE_API_KEY:-}"
FIREBASE_AUTH_DOMAIN="${FIREBASE_AUTH_DOMAIN:-interview-master-d8c6f.firebaseapp.com}"
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-interview-master-d8c6f}"
FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET:-interview-master-d8c6f.firebasestorage.app}"
FIREBASE_MESSAGING_SENDER_ID="${FIREBASE_MESSAGING_SENDER_ID:-921696971578}"
FIREBASE_APP_ID="${FIREBASE_APP_ID:-1:921696971578:web:c252b8b7683e8e69893e03}"

# Gemini API Key - MUST be provided via environment variable
GEMINI_API_KEY="${GEMINI_API_KEY:-}"

# Validate required environment variables
if [ -z "$FIREBASE_API_KEY" ]; then
  echo "❌ Error: FIREBASE_API_KEY environment variable is not set"
  echo "   Set it with: export FIREBASE_API_KEY='your-firebase-api-key'"
  exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ Error: GEMINI_API_KEY environment variable is not set"
  echo "   Set it with: export GEMINI_API_KEY='your-gemini-api-key'"
  exit 1
fi

echo "✅ Environment variables validated"

echo "Building Docker image with environment variables..."
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY"

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/interview-master:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10

echo "Deployment complete!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')"


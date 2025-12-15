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

# All configuration must come from environment variables - NO HARDCODED VALUES
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-interview-master}"

# Firebase Configuration - ALL REQUIRED from environment
FIREBASE_API_KEY="${FIREBASE_API_KEY:-}"
FIREBASE_AUTH_DOMAIN="${FIREBASE_AUTH_DOMAIN:-}"
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-}"
FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET:-}"
FIREBASE_MESSAGING_SENDER_ID="${FIREBASE_MESSAGING_SENDER_ID:-}"
FIREBASE_APP_ID="${FIREBASE_APP_ID:-}"

# Gemini API Key - REQUIRED
GEMINI_API_KEY="${GEMINI_API_KEY:-}"

# Google Cloud Project ID - REQUIRED
GCLOUD_PROJECT_ID="${GCLOUD_PROJECT_ID:-}"

# Validate ALL required environment variables
if [ -z "$FIREBASE_API_KEY" ]; then
  echo "❌ Error: FIREBASE_API_KEY environment variable is not set"
  echo "   Set it with: export FIREBASE_API_KEY='your-firebase-api-key'"
  exit 1
fi

if [ -z "$FIREBASE_AUTH_DOMAIN" ]; then
  echo "❌ Error: FIREBASE_AUTH_DOMAIN environment variable is not set"
  echo "   Set it with: export FIREBASE_AUTH_DOMAIN='your-project.firebaseapp.com'"
  exit 1
fi

if [ -z "$FIREBASE_PROJECT_ID" ]; then
  echo "❌ Error: FIREBASE_PROJECT_ID environment variable is not set"
  echo "   Set it with: export FIREBASE_PROJECT_ID='your-project-id'"
  exit 1
fi

if [ -z "$FIREBASE_STORAGE_BUCKET" ]; then
  echo "❌ Error: FIREBASE_STORAGE_BUCKET environment variable is not set"
  echo "   Set it with: export FIREBASE_STORAGE_BUCKET='your-bucket.appspot.com'"
  exit 1
fi

if [ -z "$FIREBASE_MESSAGING_SENDER_ID" ]; then
  echo "❌ Error: FIREBASE_MESSAGING_SENDER_ID environment variable is not set"
  echo "   Set it with: export FIREBASE_MESSAGING_SENDER_ID='your-sender-id'"
  exit 1
fi

if [ -z "$FIREBASE_APP_ID" ]; then
  echo "❌ Error: FIREBASE_APP_ID environment variable is not set"
  echo "   Set it with: export FIREBASE_APP_ID='your-app-id'"
  exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ Error: GEMINI_API_KEY environment variable is not set"
  echo "   Set it with: export GEMINI_API_KEY='your-gemini-api-key'"
  exit 1
fi

if [ -z "$GCLOUD_PROJECT_ID" ]; then
  echo "❌ Error: GCLOUD_PROJECT_ID environment variable is not set"
  echo "   Set it with: export GCLOUD_PROJECT_ID='your-gcloud-project-id'"
  exit 1
fi

echo "✅ Environment variables validated"

echo "Building Docker image with environment variables..."
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY"

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$GCLOUD_PROJECT_ID/interview-master:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10

echo "Deployment complete!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')"


#!/bin/bash

# Google Cloud Run Deployment Script
# Usage: ./deploy.sh [project-id] [region]

set -e

PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="interview-master"

echo "🚀 Deploying InterviewMaster to Google Cloud Run"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "Creating from .env.example..."
    cp .env.example .env.production
    echo "⚠️  Please update .env.production with your production values before deploying"
    read -p "Press enter to continue after updating .env.production..."
fi

# Load environment variables from .env.production
if [ -f .env.production ]; then
    echo "📝 Loading environment variables from .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build and deploy
echo "🏗️  Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID,NEXT_PUBLIC_GEMINI_API_KEY=$NEXT_PUBLIC_GEMINI_API_KEY,NEXT_PUBLIC_APP_URL=https://$SERVICE_NAME-xxxxx.run.app,NODE_ENV=production" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Update NEXT_PUBLIC_APP_URL with the actual URL above"
echo "2. Configure Firebase Storage CORS for the new domain"
echo "3. Test the deployed application"


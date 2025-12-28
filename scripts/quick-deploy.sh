#!/bin/bash

# Quick Deployment Script
# One-command deployment to Google Cloud Run

set -e

echo "🚀 InterviewMaster Quick Deployment"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-interview-master}"

# Check if required environment variables are set
REQUIRED_VARS=(
    "FIREBASE_API_KEY"
    "FIREBASE_AUTH_DOMAIN"
    "FIREBASE_PROJECT_ID"
    "FIREBASE_STORAGE_BUCKET"
    "FIREBASE_MESSAGING_SENDER_ID"
    "FIREBASE_APP_ID"
    "GEMINI_API_KEY"
    "GCLOUD_PROJECT_ID"
)

echo "Checking environment variables..."
MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
        echo -e "${RED}❌ $VAR is not set${NC}"
    else
        echo -e "${GREEN}✅ $VAR is set${NC}"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Error: Missing required environment variables:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Set them with:"
    echo "  export FIREBASE_API_KEY='your-key'"
    echo "  export GEMINI_API_KEY='your-key'"
    echo "  # ... etc"
    exit 1
fi

# Set gcloud project
echo ""
echo "Setting Google Cloud project..."
gcloud config set project "$GCLOUD_PROJECT_ID" || {
    echo -e "${RED}Error: Failed to set gcloud project${NC}"
    exit 1
}
echo -e "${GREEN}✅ Project set to $GCLOUD_PROJECT_ID${NC}"

# Build Docker image
echo ""
echo "Building Docker image..."
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY" \
    --timeout=1200s || {
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Deploy to Cloud Run
echo ""
echo "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image "gcr.io/$GCLOUD_PROJECT_ID/interview-master:latest" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1 \
    --timeout=300 \
    --max-instances=10 \
    --port=3000 || {
    echo -e "${RED}Error: Deployment failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Deployment successful${NC}"

# Get deployment URL
echo ""
echo "Getting deployment URL..."
DEPLOYMENT_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --format='value(status.url)')

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not retrieve deployment URL${NC}"
else
    echo -e "${GREEN}✅ Deployment URL: $DEPLOYMENT_URL${NC}"
    
    # Health check
    echo ""
    echo "Performing health check..."
    sleep 5
    if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed (service may still be starting)${NC}"
    fi
fi

echo ""
echo "===================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "===================================="
echo ""
echo "Your application is live at:"
echo -e "${GREEN}$DEPLOYMENT_URL${NC}"
echo ""
echo "Next steps:"
echo "1. Test the deployment URL"
echo "2. Update your documentation with the new URL"
echo "3. Monitor the service in Google Cloud Console"

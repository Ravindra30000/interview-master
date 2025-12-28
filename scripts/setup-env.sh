#!/bin/bash

# Interactive Environment Setup Script
# Helps set up .env.local file with all required variables

set -e

ENV_FILE=".env.local"
EXAMPLE_FILE=".env.example"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 InterviewMaster Environment Setup${NC}"
echo "======================================"
echo ""

# Check if .env.local already exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    mv "$ENV_FILE" "${ENV_FILE}.backup"
    echo -e "${GREEN}✅ Backed up existing .env.local to .env.local.backup${NC}"
fi

# Create .env.local from .env.example if it exists
if [ -f "$EXAMPLE_FILE" ]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
else
    touch "$ENV_FILE"
    echo -e "${YELLOW}⚠️  .env.example not found, creating empty .env.local${NC}"
fi

echo ""
echo "Please provide the following values:"
echo ""

# Firebase Configuration
echo -e "${BLUE}Firebase Configuration:${NC}"
echo "Get these from: Firebase Console > Project Settings > General > Your apps"
echo ""

read -p "Firebase API Key: " FIREBASE_API_KEY
read -p "Firebase Auth Domain: " FIREBASE_AUTH_DOMAIN
read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "Firebase Storage Bucket: " FIREBASE_STORAGE_BUCKET
read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "Firebase App ID: " FIREBASE_APP_ID

echo ""
echo -e "${BLUE}Firebase Realtime Database:${NC}"
echo "Get from: Firebase Console > Realtime Database > Data"
read -p "Firebase Database URL (or press Enter to skip): " FIREBASE_DATABASE_URL

echo ""
echo -e "${BLUE}Google Gemini API:${NC}"
echo "Get from: https://aistudio.google.com/app/apikey"
read -p "Gemini API Key: " GEMINI_API_KEY

echo ""
echo -e "${BLUE}Google Cloud TTS (Optional for local dev):${NC}"
read -p "Service Account JSON Path (or press Enter to skip): " GOOGLE_APPLICATION_CREDENTIALS

# Update .env.local file
echo ""
echo "Updating .env.local..."

# Use sed to update values (works on both Linux and Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXT_PUBLIC_FIREBASE_API_KEY=.*|NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=.*|NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_FIREBASE_PROJECT_ID=.*|NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=.*|NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=.*|NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_FIREBASE_APP_ID=.*|NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID|" "$ENV_FILE"
    
    if [ -n "$FIREBASE_DATABASE_URL" ]; then
        sed -i '' "s|NEXT_PUBLIC_FIREBASE_DATABASE_URL=.*|NEXT_PUBLIC_FIREBASE_DATABASE_URL=$FIREBASE_DATABASE_URL|" "$ENV_FILE"
    fi
    
    sed -i '' "s|NEXT_PUBLIC_GEMINI_API_KEY=.*|NEXT_PUBLIC_GEMINI_API_KEY=$GEMINI_API_KEY|" "$ENV_FILE"
    
    if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        sed -i '' "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS|" "$ENV_FILE"
    fi
else
    # Linux
    sed -i "s|NEXT_PUBLIC_FIREBASE_API_KEY=.*|NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY|" "$ENV_FILE"
    sed -i "s|NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=.*|NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN|" "$ENV_FILE"
    sed -i "s|NEXT_PUBLIC_FIREBASE_PROJECT_ID=.*|NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID|" "$ENV_FILE"
    sed -i "s|NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=.*|NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET|" "$ENV_FILE"
    sed -i "s|NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=.*|NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID|" "$ENV_FILE"
    sed -i "s|NEXT_PUBLIC_FIREBASE_APP_ID=.*|NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID|" "$ENV_FILE"
    
    if [ -n "$FIREBASE_DATABASE_URL" ]; then
        sed -i "s|NEXT_PUBLIC_FIREBASE_DATABASE_URL=.*|NEXT_PUBLIC_FIREBASE_DATABASE_URL=$FIREBASE_DATABASE_URL|" "$ENV_FILE"
    fi
    
    sed -i "s|NEXT_PUBLIC_GEMINI_API_KEY=.*|NEXT_PUBLIC_GEMINI_API_KEY=$GEMINI_API_KEY|" "$ENV_FILE"
    
    if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        sed -i "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS|" "$ENV_FILE"
    fi
fi

echo ""
echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
echo ""
echo "Your .env.local file has been created/updated."
echo ""
echo "Next steps:"
echo "1. Review .env.local to ensure all values are correct"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test the application to verify everything works"
echo ""
echo -e "${YELLOW}⚠️  Remember: Never commit .env.local to Git!${NC}"

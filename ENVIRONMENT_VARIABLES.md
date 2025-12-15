# Required Environment Variables for Deployment

**SECURITY:** All credentials must be set as environment variables. Never hardcode them in files.

---

## Required Environment Variables

Before deploying, you must export all of these variables:

```bash
# Google Cloud Project ID
export GCLOUD_PROJECT_ID="your-gcloud-project-id"

# Firebase Configuration
export FIREBASE_API_KEY="your-firebase-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export FIREBASE_APP_ID="your-app-id"

# Gemini API Key
export GEMINI_API_KEY="your-gemini-api-key"

# Optional (has defaults)
export REGION="us-central1"  # Default: us-central1
export SERVICE_NAME="interview-master"  # Default: interview-master
```

---

## Where to Find These Values

### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Click on your web app or "Add app" if needed
6. Copy the config values:
   - `apiKey` → `FIREBASE_API_KEY`
   - `authDomain` → `FIREBASE_AUTH_DOMAIN`
   - `projectId` → `FIREBASE_PROJECT_ID`
   - `storageBucket` → `FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `FIREBASE_APP_ID`

### Google Cloud Project ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Your project ID is shown in the top bar
3. Or run: `gcloud projects list`

### Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create or select an API key
4. Copy the key → `GEMINI_API_KEY`

---

## Verification

After setting variables, verify they're set:

```bash
# Bash/Linux/Mac
echo $FIREBASE_API_KEY
echo $GEMINI_API_KEY
echo $GCLOUD_PROJECT_ID

# PowerShell (Windows)
echo $env:FIREBASE_API_KEY
echo $env:GEMINI_API_KEY
echo $env:GCLOUD_PROJECT_ID
```

---

## Security Best Practices

✅ **DO:**

- Set environment variables before running deployment scripts
- Use separate API keys for development and production
- Rotate API keys regularly
- Never commit `.env` files to git
- Use secrets management in production (Cloud Run secrets, etc.)

❌ **DON'T:**

- Hardcode credentials in files
- Commit API keys to git
- Share API keys in chat/email
- Use production keys in development

---

## Quick Setup Script

Create a file `set-env.sh` (don't commit to git):

```bash
#!/bin/bash
# set-env.sh - Set all required environment variables
# DO NOT COMMIT THIS FILE TO GIT

export GCLOUD_PROJECT_ID="your-gcloud-project-id"
export FIREBASE_API_KEY="your-firebase-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export FIREBASE_APP_ID="your-app-id"
export GEMINI_API_KEY="your-gemini-api-key"
```

Then source it before deployment:

```bash
source set-env.sh
```

**Remember:** Add `set-env.sh` to `.gitignore`!

---

**All deployment scripts now require these environment variables to be set before running.**

# Install Google Cloud SDK - Step by Step

## Quick Installation Guide

### Step 1: Download Google Cloud SDK

1. Visit: **https://cloud.google.com/sdk/docs/install**
2. Click "Download for Windows"
3. Download the installer (`GoogleCloudSDKInstaller.exe`)

### Step 2: Run the Installer

1. Run `GoogleCloudSDKInstaller.exe`
2. Follow the installation wizard
3. **Important:** Check "Run gcloud init" at the end (or run it manually)

### Step 3: Initialize gcloud

After installation, **restart your terminal/PowerShell** and run:

```powershell
# Initialize gcloud (will open browser for authentication)
gcloud init

# Login to Google Cloud
gcloud auth login

# Set your project (replace YOUR_PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### Step 4: Verify Installation

```powershell
gcloud --version
gcloud config get-value project
```

### Step 5: Deploy!

Once gcloud is installed and configured:

```powershell
.\deploy.ps1 -ProjectId "your-project-id" -Region "us-central1"
```

Or manually:

```powershell
gcloud run deploy interview-master `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_GEMINI_API_KEY=..." `
  --memory=1Gi `
  --cpu=1
```

---

## Alternative: Use Cloud Shell (No Installation Needed!)

If you don't want to install locally, you can use Google Cloud Shell:

1. Go to: **https://console.cloud.google.com/**
2. Click the Cloud Shell icon (top right)
3. Upload your project files
4. Run deployment commands directly in the browser

---

## Troubleshooting

**"gcloud not recognized"**
- Restart your terminal after installation
- Check if gcloud is in your PATH: `$env:PATH`

**Authentication issues**
- Run: `gcloud auth login`
- Run: `gcloud auth application-default login`

**Project not found**
- Create a project at: https://console.cloud.google.com/
- Enable billing for the project
- Note your Project ID

---

**After installation, come back and run: `.\deploy.ps1`**


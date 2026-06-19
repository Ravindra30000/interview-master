# deploy-cloud-run.ps1
# Native PowerShell deployment script for Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 Loading configuration from .env.local..." -ForegroundColor Cyan

# Load .env.local variables
if (Test-Path .env.local) {
    Get-Content .env.local | Foreach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $val = $parts[1].Trim()
                [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
} else {
    Write-Error ".env.local file not found!"
}

# Map NEXT_PUBLIC_ variables
$FIREBASE_API_KEY = $env:NEXT_PUBLIC_FIREBASE_API_KEY
$FIREBASE_AUTH_DOMAIN = $env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
$FIREBASE_PROJECT_ID = $env:NEXT_PUBLIC_FIREBASE_PROJECT_ID
$FIREBASE_STORAGE_BUCKET = $env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
$FIREBASE_MESSAGING_SENDER_ID = $env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
$FIREBASE_APP_ID = $env:NEXT_PUBLIC_FIREBASE_APP_ID
$GEMINI_API_KEY = $env:NEXT_PUBLIC_GEMINI_API_KEY
$GCLOUD_PROJECT_ID = $env:NEXT_PUBLIC_FIREBASE_PROJECT_ID
$REGION = "us-central1"
$SERVICE_NAME = "interview-master"

# Validate
if (-not $FIREBASE_API_KEY -or -not $GEMINI_API_KEY -or -not $GCLOUD_PROJECT_ID) {
    Write-Error "Required configuration variables are missing from .env.local!"
}

Write-Host "✅ Environment variables loaded and validated." -ForegroundColor Green

# Set GCloud project
Write-Host "Setting active Google Cloud project to $GCLOUD_PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $GCLOUD_PROJECT_ID

Write-Host "Building Docker image with environment variables via Cloud Build..." -ForegroundColor Cyan
gcloud builds submit `
  --config=cloudbuild.yaml `
  --substitutions=_FIREBASE_API_KEY="$FIREBASE_API_KEY",_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",_FIREBASE_APP_ID="$FIREBASE_APP_ID",_GEMINI_API_KEY="$GEMINI_API_KEY"

Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
  --image gcr.io/$GCLOUD_PROJECT_ID/interview-master:latest `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory=1Gi `
  --cpu=1 `
  --timeout=300 `
  --max-instances=10

Write-Host "🎉 Deployment Complete!" -ForegroundColor Green

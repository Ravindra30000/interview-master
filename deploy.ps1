# Google Cloud Run Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1 -ProjectId "your-project-id" -Region "us-central1"

param(
    [string]$ProjectId = "your-project-id",
    [string]$Region = "us-central1"
)

$ServiceName = "interview-master"

Write-Host "🚀 Deploying InterviewMaster to Google Cloud Run" -ForegroundColor Cyan
Write-Host "Project ID: $ProjectId"
Write-Host "Region: $Region"
Write-Host "Service: $ServiceName"
Write-Host ""

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Set project
Write-Host "📋 Setting project to $ProjectId..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Check if .env.production exists
if (-not (Test-Path .env.production)) {
    Write-Host "⚠️  Warning: .env.production not found" -ForegroundColor Yellow
    Write-Host "Creating from .env.example..."
    Copy-Item .env.example .env.production
    Write-Host "⚠️  Please update .env.production with your production values before deploying" -ForegroundColor Yellow
    Read-Host "Press enter to continue after updating .env.production"
}

# Load environment variables from .env.production
$envVars = @{}
if (Test-Path .env.production) {
    Write-Host "📝 Loading environment variables from .env.production..." -ForegroundColor Yellow
    Get-Content .env.production | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
        }
    }
}

# Build env vars string
$envVarsString = ""
foreach ($key in $envVars.Keys) {
    if ($envVarsString) {
        $envVarsString += ","
    }
    $envVarsString += "$key=$($envVars[$key])"
}

# Add NODE_ENV
if ($envVarsString) {
    $envVarsString += ",NODE_ENV=production"
} else {
    $envVarsString = "NODE_ENV=production"
}

# Build and deploy
Write-Host "🏗️  Building and deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --source . `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --set-env-vars="$envVarsString" `
  --memory=1Gi `
  --cpu=1 `
  --timeout=300 `
  --max-instances=10

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Service URL: $ServiceUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Don't forget to:" -ForegroundColor Yellow
Write-Host "1. Update NEXT_PUBLIC_APP_URL with the actual URL above"
Write-Host "2. Configure Firebase Storage CORS for the new domain"
Write-Host "3. Test the deployed application"


# InterviewMaster - Deployment Ready Guide

## Quick Start

This guide provides a quick reference for deploying InterviewMaster to production.

## Pre-Deployment Checklist

- [ ] All environment variables set (see `.env.example`)
- [ ] Google Cloud project created and configured
- [ ] Firebase project set up with all services enabled
- [ ] Google Gemini API key obtained
- [ ] gcloud CLI installed and authenticated
- [ ] Docker installed (for local testing)
- [ ] All code committed to Git
- [ ] No secrets in codebase

## Environment Variables

Required environment variables (set before deployment):

```bash
export GCLOUD_PROJECT_ID="your-gcloud-project-id"
export FIREBASE_API_KEY="your-firebase-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export FIREBASE_APP_ID="your-app-id"
export GEMINI_API_KEY="your-gemini-api-key"
```

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for detailed instructions.

## Deployment Methods

### Method 1: Quick Deploy (Recommended)

```bash
# Set all environment variables first
export GCLOUD_PROJECT_ID="..."
export FIREBASE_API_KEY="..."
# ... (all other variables)

# Run quick deploy script
./scripts/quick-deploy.sh
```

### Method 2: Standard Deployment

```bash
# Set environment variables
export FIREBASE_API_KEY="..."
export GEMINI_API_KEY="..."
# ... (other variables)

# Run deployment script
./deploy-cloud-run.sh
```

### Method 3: Manual Deployment

See [MANUAL_DEPLOYMENT.md](MANUAL_DEPLOYMENT.md) for step-by-step manual commands.

## Verification

### Pre-Deployment Verification

Run the verification script:

```bash
./scripts/verify-deployment.sh
```

This checks:

- Node.js and npm installation
- Dependencies installed
- Environment variables set
- No secrets in code
- Docker and gcloud CLI available
- TypeScript compilation
- Documentation present

### Post-Deployment Verification

1. **Check Deployment URL**

   ```bash
   gcloud run services describe interview-master \
     --region=us-central1 \
     --format='value(status.url)'
   ```

2. **Test Application**

   - Open deployment URL in browser
   - Test user registration/login
   - Test practice session
   - Test video recording
   - Test AI analysis
   - Test Avatar mode

3. **Monitor Logs**
   ```bash
   gcloud run services logs read interview-master \
     --region=us-central1 \
     --limit=50
   ```

## Deployment Steps Summary

1. **Set Environment Variables**

   ```bash
   export FIREBASE_API_KEY="..."
   export GEMINI_API_KEY="..."
   # ... (all required variables)
   ```

2. **Verify Deployment Readiness**

   ```bash
   ./scripts/verify-deployment.sh
   ```

3. **Deploy**

   ```bash
   ./scripts/quick-deploy.sh
   # OR
   ./deploy-cloud-run.sh
   ```

4. **Verify Deployment**
   - Check deployment URL
   - Test all features
   - Monitor logs

## Post-Deployment

### Update Documentation

Update the following with your deployment URL:

- `README.md` - Live Demo section
- `PROJECT_SUMMARY.md` - Demo URL
- Application form - Live demo link

### Monitor Service

1. **Cloud Run Console**

   - Monitor requests
   - Check errors
   - View logs
   - Monitor performance

2. **Firebase Console**

   - Check Firestore usage
   - Monitor Storage
   - View Authentication logs

3. **Google Cloud Console**
   - Monitor API usage (Gemini, TTS)
   - Check billing
   - View service health

## Troubleshooting

### Common Issues

1. **Build Fails**

   - Check environment variables are set
   - Verify Dockerfile is correct
   - Check cloudbuild.yaml syntax

2. **Deployment Fails**

   - Verify gcloud authentication
   - Check project permissions
   - Ensure Cloud Run API is enabled

3. **Application Not Loading**

   - Check Cloud Run service status
   - Verify environment variables in Cloud Run
   - Check application logs

4. **API Errors**
   - Verify API keys are correct
   - Check API quotas
   - Verify service account permissions

### Getting Help

1. Check logs:

   ```bash
   gcloud run services logs read interview-master --region=us-central1
   ```

2. Check service status:

   ```bash
   gcloud run services describe interview-master --region=us-central1
   ```

3. Review documentation:
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## Quick Reference

### Deployment Commands

```bash
# Verify deployment readiness
./scripts/verify-deployment.sh

# Quick deploy
./scripts/quick-deploy.sh

# Standard deploy
./deploy-cloud-run.sh

# Get deployment URL
gcloud run services describe interview-master \
  --region=us-central1 \
  --format='value(status.url)'

# View logs
gcloud run services logs read interview-master \
  --region=us-central1 \
  --limit=50
```

### Important URLs

- **Cloud Run Console**: https://console.cloud.google.com/run
- **Firebase Console**: https://console.firebase.google.com
- **Cloud Build**: https://console.cloud.google.com/cloud-build

## Next Steps

After successful deployment:

1. ✅ Test all features
2. ✅ Update documentation with deployment URL
3. ✅ Monitor service for 24 hours
4. ✅ Prepare submission materials
5. ✅ Create demo video
6. ✅ Submit application

## Support

For deployment issues:

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Check Google Cloud documentation

Good luck with your deployment! 🚀

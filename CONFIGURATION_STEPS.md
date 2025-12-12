# 🔧 Step-by-Step Configuration Guide

## ⚠️ IMPORTANT: Complete These Steps Before Running the App

Follow these steps in order to configure Firebase and Gemini API.

---

## Step 1: Firebase Setup (30 minutes)

### 1.1 Create Firebase Project

1. **Go to Firebase Console**

   - Visit: https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Add project"** or **"Create a project"**
   - Project name: `interview-master` (or your preferred name)
   - Click **"Continue"**
   - **Disable Google Analytics** (optional, to keep it simple)
   - Click **"Create project"**
   - Wait for project creation (30 seconds)

### 1.2 Enable Firestore Database

1. In Firebase Console, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Choose a location closest to you (e.g., `us-central1`, `asia-south1`)
5. Click **"Enable"**
6. Wait for database creation

### 1.3 Enable Authentication

1. Click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click on **"Email/Password"** provider
4. Toggle **"Enable"** for Email/Password
5. Click **"Save"**

### 1.4 Enable Cloud Storage

1. Click **"Build"** → **"Storage"**
2. Click **"Get started"**
3. Select **"Start in test mode"**
4. Choose the same location as Firestore
5. Click **"Done"**

### 1.5 Get Firebase Configuration

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register app:
   - App nickname: `InterviewMaster`
   - Firebase Hosting: Leave unchecked (we're using Vercel)
   - Click **"Register app"**
6. **Copy the config object** - You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};
```

**Save these values - you'll need them for `.env.local`**

---

## Step 2: Google Gemini API Setup (15 minutes)

### 2.1 Get API Key

1. **Go to Google AI Studio**

   - Visit: https://ai.google.com/aistudio
   - Sign in with your Google account

2. **Create API Key**

   - Click **"Get API Key"** (top right)
   - Click **"Create API Key in new project"** (or select existing project)
   - Click **"Create API Key"**
   - **Copy the API key immediately** (you won't see it again!)

3. **Important Notes:**
   - Free tier: **50 requests/day**
   - Keep this key secure
   - Don't share it publicly

---

## Step 3: Create Environment Variables File

### 3.1 Create `.env.local` File

1. In your project root (`interview-master/`), create a file named `.env.local`
2. Copy the template below and fill in your values:

```env
# Firebase Configuration (from Step 1.5)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Gemini API (from Step 2.1)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3.2 Verify `.env.local` is in `.gitignore`

Check that `.env.local` is listed in `.gitignore` (it should be already).

---

## Step 4: Install Dependencies

Run this command in your terminal:

```bash
npm install
```

This will install all required packages:

- Next.js
- React
- Firebase
- Google Gemini AI
- Tailwind CSS
- TypeScript

---

## Step 5: Verify Setup

### 5.1 Test Firebase Connection

1. Start the dev server:

   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000
3. Check browser console (F12) for any Firebase errors

### 5.2 Test Gemini API (Optional)

You can test Gemini later when we build the analysis feature.

---

## ✅ Configuration Checklist

Before proceeding to build features, verify:

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Authentication enabled (Email/Password)
- [ ] Cloud Storage enabled
- [ ] Firebase config values copied
- [ ] Gemini API key obtained
- [ ] `.env.local` file created with all values
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server runs without errors (`npm run dev`)

---

## 🆘 Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"

**Solution:** Check that all Firebase env variables in `.env.local` are correct and start with `NEXT_PUBLIC_`

### Issue: "API key not valid"

**Solution:**

- Verify Gemini API key is correct
- Check you're using the right project in Google AI Studio
- Ensure key hasn't been revoked

### Issue: Environment variables not loading

**Solution:**

- Restart dev server after adding env vars
- Ensure `.env.local` is in project root
- Check variables start with `NEXT_PUBLIC_` for client-side access

### Issue: "Permission denied" in Firestore

**Solution:**

- Firestore is in test mode (should work for development)
- Later we'll add proper security rules

---

## 🚀 Next Steps

Once configuration is complete:

1. ✅ Run `npm run dev`
2. ✅ Visit http://localhost:3000
3. ✅ See the home page
4. ✅ Proceed to build authentication (Phase 1)

**You're ready to start building!** 🎉

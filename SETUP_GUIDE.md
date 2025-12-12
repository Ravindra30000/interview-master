# InterviewMaster - Setup & Configuration Guide

## 🔑 External Services Configuration

### 1. Firebase Setup (30 minutes)

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Project name: `interview-master` (or your preferred name)
4. Disable Google Analytics (optional, for free tier)
5. Click "Create project"

#### Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (we'll secure it later)
4. Choose a location (closest to you)
5. Click "Enable"

#### Step 3: Enable Authentication

1. Go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Click "Save"

#### Step 4: Enable Cloud Storage

1. Go to **Build** → **Storage**
2. Click "Get started"
3. Start in **test mode**
4. Choose same location as Firestore
5. Click "Done"

#### Step 5: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click **Web icon** (`</>`) to add web app
4. Register app name: `InterviewMaster`
5. Copy the config object (you'll need these values)

**You'll need these values:**

```
apiKey: "AIza..."
authDomain: "your-project.firebaseapp.com"
projectId: "your-project-id"
storageBucket: "your-project.appspot.com"
messagingSenderId: "123456789"
appId: "1:123456789:web:abc123"
```

---

### 2. Google Gemini API Setup (15 minutes)

#### Step 1: Get API Key

1. Go to [Google AI Studio](https://ai.google.com/aistudio)
2. Sign in with your Google account
3. Click **Get API Key** (top right)
4. Click **Create API Key in new project** (or select existing)
5. Copy the API key immediately (you won't see it again)

**Important:**

- Free tier: 50 requests/day
- Keep this key secure (don't commit to GitHub)

---

### 3. Vercel Account (5 minutes)

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub (recommended)
3. You're ready to deploy later

---

## 📁 Project Structure

After setup, your project will look like:

```
interview-master/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home page
│   │   ├── api/                # API routes
│   │   ├── practice/           # Interview pages
│   │   ├── results/            # Results pages
│   │   └── dashboard/          # Dashboard
│   ├── components/             # React components
│   ├── lib/                    # Utilities & services
│   └── types/                  # TypeScript types
├── public/
│   └── questions.json          # Interview questions
├── .env.local                  # Environment variables (DO NOT COMMIT)
├── .gitignore
├── package.json
└── next.config.ts
```

---

## 🔐 Environment Variables

Create `.env.local` file in project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**⚠️ IMPORTANT:**

- Never commit `.env.local` to GitHub
- Add `.env.local` to `.gitignore`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Authentication enabled (Email/Password)
- [ ] Storage enabled
- [ ] Firebase config values copied
- [ ] Gemini API key obtained
- [ ] Vercel account created
- [ ] `.env.local` file created with all values
- [ ] `.gitignore` includes `.env.local`

---

## 🚀 Next Steps

Once setup is complete:

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development server
3. Visit `http://localhost:3000`
4. Test Firebase connection
5. Test Gemini API (optional test call)

---

## 🆘 Troubleshooting

### Firebase "Permission Denied"

- Check Firestore rules (should allow authenticated users)
- Verify authentication is working

### Gemini API Errors

- Verify API key is correct
- Check rate limit (50/day)
- Ensure key is in `.env.local`

### Environment Variables Not Loading

- Restart dev server after adding env vars
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Check `.env.local` is in project root

---

**Ready to start building!** 🎉

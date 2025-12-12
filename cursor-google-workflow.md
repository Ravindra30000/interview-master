# InterviewMaster - Cursor + Google AI Studio Workflow Guide
## Complete Step-by-Step Build Instructions

---

## Table of Contents
1. Initial Setup (Day 1)
2. Building with Google AI Studio
3. Building with Cursor (Backup)
4. Testing & Debugging
5. Deployment Checklist

---

## DAY 1: Initial Setup

### Step 1: Create Next.js Project
```bash
# In your terminal
npx create-next-app@latest interview-master \
  --typescript \
  --tailwind \
  --eslint \
  --src-dir \
  --app \
  --no-git

cd interview-master
```

### Step 2: Install Dependencies
```bash
npm install \
  firebase \
  @google/generative-ai \
  next-auth \
  axios \
  zustand \
  clsx \
  gray-matter

npm install -D \
  @types/node \
  @types/react \
  typescript
```

### Step 3: Setup Environment Variables
Create `.env.local`:
```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Create Folder Structure
```bash
mkdir -p src/{app,components,lib,types}
mkdir -p public/{questions}
```

### Step 5: Create Basic Files
```
interview-master/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   └── interviews/
│   │   ├── practice/
│   │   ├── results/
│   │   └── dashboard/
│   ├── components/
│   │   ├── InterviewRecorder.tsx
│   │   ├── AIAvatar.tsx
│   │   ├── ResultsCard.tsx
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── gemini.ts
│   │   ├── scoring.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
│   └── questions.json
├── .env.local
└── next.config.ts
```

---

## Using Google AI Studio (Recommended First)

### What Google AI Studio Does:
- ✅ Free API access (50 req/day)
- ✅ Test Gemini models in browser
- ✅ Generate code snippets
- ✅ Quick prototyping

### When to Use Google AI Studio:

**Use for:**
1. **Testing API calls**
   ```
   Prompt: "Write a JavaScript function to analyze interview answers"
   Copy the code → Paste into your project
   ```

2. **Debugging issues**
   ```
   Prompt: "Why does this React component cause hydration errors?"
   Paste your code → Get explanation
   ```

3. **Understanding Gemini**
   ```
   Prompt: "Show me how to use Gemini's reasoning mode for interview analysis"
   Get examples → Copy approach to your code
   ```

### Step-by-Step: Setup Gemini Integration

**Step 1: Get API Key**
1. Go to https://ai.google.com/aistudio
2. Click "Get API Key" (top right)
3. Create new API key for your project
4. Copy key → Add to .env.local

**Step 2: Create Gemini Service**
```bash
# Using Google AI Studio:
# Prompt: "Generate a TypeScript service to analyze interview answers using Gemini 2.5 Pro API"

# Response will give you code to paste in src/lib/gemini.ts
```

**Code to Paste (from Google AI Studio):**
```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function analyzeInterviewAnswer(
  question: string,
  answer: string,
  framework: string
): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
You are an expert interview coach. Analyze this interview answer and provide feedback.

QUESTION: "${question}"
ANSWER FRAMEWORK: "${framework}"
USER'S ANSWER: "${answer}"

Provide your response in this exact format:
SCORE: [0-10]
FEEDBACK: [2-3 sentences of constructive feedback]
IMPROVEMENTS:
- [specific improvement 1]
- [specific improvement 2]
- [specific improvement 3]

Be encouraging but honest.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse the response
  const scoreMatch = text.match(/SCORE: (\d+)/);
  const feedbackMatch = text.match(/FEEDBACK: (.*?)IMPROVEMENTS:/s);
  const improvementsText = text.match(/IMPROVEMENTS:([\s\S]*?)$/)?.[1] || "";

  return {
    score: parseInt(scoreMatch?.[1] || "5"),
    feedback: feedbackMatch?.[1]?.trim() || "Great effort!",
    improvements: improvementsText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim()),
  };
}
```

**Step 3: Test in Google AI Studio**
1. Go to Google AI Studio
2. Paste a test prompt:
```
Q: "Tell me about a time you failed"
Answer: "I once built a feature but didn't test it properly..."
Framework: "Problem → Your Role → Solution"

Analyze this and give score 0-10 and 3 improvements.
```
3. Test the response format
4. Adjust prompt if needed
5. Copy final prompt to your code

---

## Using Cursor (When API Limit Reached)

### What Cursor Does:
- ✅ AI-powered code editor
- ✅ Can generate entire components
- ✅ Helps with debugging
- ✅ Understands your codebase

### Cursor Commands to Use:

**Command 1: Generate Component**
```
@codebase Generate InterviewRecorder component that:
- Records video from webcam
- Captures audio
- Shows timer
- Has start/stop buttons
- Uses React hooks
- Returns recorded blob
```

**Command 2: Debug Firebase**
```
@codebase I'm getting "permission denied" error when trying to write to Firestore.
Here's my code: [paste code]
What's wrong and how do I fix it?
```

**Command 3: Complete Feature**
```
@codebase Create a complete API endpoint at src/app/api/interviews/[id]/analyze.ts
that:
- Takes user ID and interview ID from params
- Fetches answer from Firestore
- Calls Gemini API to analyze
- Saves results back to Firestore
- Returns score and feedback
```

### Key Cursor Shortcuts:
```
Cmd/Ctrl + K → Generate code
Cmd/Ctrl + L → Ask follow-up question
@codebase → Reference your entire codebase
@file filename.tsx → Reference specific file
```

---

## DAY-BY-DAY BUILD PLAN

### DAY 1-2: Firebase + Auth Setup

**Using Google AI Studio:**
```
Prompt: "Write a complete Firebase setup for a Next.js app with
- Firestore database
- Email/Password authentication
- TypeScript types
- Error handling"
```

**File to create:** `src/lib/firebase.ts`

Then paste code from Google AI Studio response.

**Test:**
```bash
npm run dev
# Visit http://localhost:3000
# Try signing up (should create user in Firebase)
```

---

### DAY 3: Questions Database Setup

**Create questions.json:**
```bash
# Using Google AI Studio:
# Prompt: "Generate 100 realistic interview questions for Backend Engineer roles,
# organized by difficulty (Junior/Mid/Senior) and category (Behavioral/Technical/System Design).
# Format as JSON with fields: id, role, difficulty, category, question, answerFramework, timeLimit"
```

**Save as:** `public/questions.json`

**Load into Firestore:**
```typescript
// src/lib/firebase.ts - Add this function
export async function initializeQuestions() {
  const questionsFile = await fetch('/questions.json');
  const data = await questionsFile.json();
  
  const batch = db.batch();
  
  data.questions.forEach(question => {
    const docRef = collection(db, 'questions').doc(question.id);
    batch.set(docRef, question);
  });
  
  await batch.commit();
  console.log('Questions loaded');
}

// Run once in useEffect on home page:
// useEffect(() => { initializeQuestions(); }, []);
```

---

### DAY 4-5: Interview Recording Component

**Using Cursor:**
```
@codebase Generate a complete InterviewRecorder component that:
1. Records video + audio from webcam/mic
2. Shows a countdown timer
3. Displays current question
4. Has Start/Stop/Submit buttons
5. Returns Blob of recorded video
6. Saves to Firebase Storage

Use React hooks (useState, useRef, useEffect)
Must work on Chrome, Safari, Firefox
```

**File:** `src/components/InterviewRecorder.tsx`

Then:
1. Copy Cursor's generated code
2. Test recording works
3. Test upload to Firebase Storage

---

### DAY 6-7: AI Avatar Component

**Using Google AI Studio:**
```
Prompt: "Create a React component that renders a simple but professional
AI avatar that:
1. Shows a SVG face with eyes, mouth, eyebrows
2. Changes expression based on state (neutral/encouraging/concerned)
3. Uses smooth CSS animations
4. Has subtle movements (nodding, blinking)
5. No complex 3D, just simple SVG
"
```

**File:** `src/components/AIAvatar.tsx`

**Test:**
```typescript
// In practice page, import and test:
const [expression, setExpression] = useState('encouraging');

return (
  <>
    <AIAvatar expression={expression} />
    <button onClick={() => setExpression('neutral')}>Neutral</button>
    <button onClick={() => setExpression('encouraging')}>Encourage</button>
  </>
);
```

---

### DAY 8-9: Speech Recognition + Local Scoring

**Using Google AI Studio:**
```
Prompt: "Write TypeScript code for:
1. Web Speech API setup (speech-to-text)
2. Detect filler words (um, uh, like, you know)
3. Analyze answer structure
4. Score confidence (0-100)
5. Score clarity (0-100)
All client-side, NO API calls"
```

**File:** `src/lib/scoring.ts`

---

### DAY 10-11: Gemini Integration + API Endpoint

**Using Google AI Studio:**
```
Prompt: "Create a Next.js API endpoint (/api/interviews/[id]/analyze) that:
1. Receives transcript and question
2. Calls Gemini 2.5 Pro to analyze
3. Returns score, feedback, improvements
4. Saves to Firestore
5. Has error handling
6. Is fast (< 10 seconds)"
```

**File:** `src/app/api/interviews/[id]/analyze.ts`

Then test:
```bash
curl -X POST http://localhost:3000/api/interviews/test/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "I once...", "question": "Tell me..."}'
```

---

### DAY 12-13: Results Dashboard + UI Polish

**Using Cursor:**
```
@codebase Create these pages with Tailwind CSS:
1. /dashboard - shows interview history
2. /results/[id] - shows results with score, feedback, improvements
3. /practice/[id] - main interview page
4. / - home/landing page

All should be clean, minimal, professional design (like LinkedIn)
Use color palette: #0066FF (blue), #F5F5F5 (gray), #00CC88 (success)
```

---

### DAY 14: Testing, Deployment, Demo Video

**Checklist:**
```
❌→✅ Testing
- [ ] Sign up / Login works
- [ ] Can start interview
- [ ] Recording works
- [ ] Speech-to-text transcribes
- [ ] Gemini analysis returns valid feedback
- [ ] Results display correctly
- [ ] Can view history
- [ ] Mobile responsive

❌→✅ Deployment
- [ ] Deploy to Vercel
- [ ] Set env vars in Vercel dashboard
- [ ] Test in production
- [ ] Monitor API usage

❌→✅ Demo Video
- [ ] Record 90-second demo
- [ ] Show problem statement
- [ ] Show interview in action
- [ ] Show improvement metrics
- [ ] Publish to GitHub
```

---

## Debugging Guide

### Issue: Firebase "Permission Denied"

**Using Cursor:**
```
@codebase I'm getting "Permission denied for default in firestore"
Here's my auth code: [paste]
Here's my Firestore rules: [paste]
Fix both.
```

**Or fix manually:**
Go to Firebase Console → Firestore → Rules → Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Issue: Gemini API Rate Limited

**Solution:**
```typescript
// Add request queuing in src/lib/gemini.ts
const requestQueue: any[] = [];
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 request per second

async function queueGeminiRequest(fn: () => Promise<any>) {
  return new Promise((resolve) => {
    requestQueue.push({ fn, resolve });
    processQueue();
  });
}

async function processQueue() {
  if (requestQueue.length === 0) return;
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_DELAY) {
    setTimeout(processQueue, REQUEST_DELAY - timeSinceLastRequest);
    return;
  }
  
  const { fn, resolve } = requestQueue.shift();
  lastRequestTime = Date.now();
  
  const result = await fn();
  resolve(result);
  
  processQueue();
}
```

### Issue: Video Upload Slow

**Solution:**
```typescript
// Compress video before upload
function compressVideo(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Reduce quality / resolution
    // For now, just reduce blob size via encoding
    blob.slice(0, blob.size / 2); // Rough compression
    
    resolve(blob);
  });
}
```

---

## Local Development Tips

### Run with Hot Reload
```bash
npm run dev
# Changes auto-reload instantly
```

### Test Firebase Offline
```bash
# In .env.local, use Firebase Emulator
FIREBASE_EMULATOR_HOST=localhost:4001
```

### Monitor API Usage
```bash
# Track Gemini requests
export GEMINI_DEBUG=true

# In terminal, see each API call
```

### Clear Database
```bash
# Firebase Console → Firestore → Delete Collection "interviews"
# Useful for testing without leftover data
```

---

## Cursor Tips for Building Faster

### Tip 1: Reference Entire Codebase
```
@codebase Generate the results page component that:
- Fetches interview by ID (already have getInterview function in lib/firebase.ts)
- Uses existing ResultsCard component
- Follows the same styling as dashboard.tsx
```

### Tip 2: Fix Errors Instantly
```
I got this error: "Cannot find module '@/components/Avatar'"
@codebase Why and how do I fix it?
```

Cursor will check your actual imports and fix.

### Tip 3: Generate Tests
```
@codebase Generate Jest tests for analyzeAnswer function in src/lib/scoring.ts
Cover: normal answers, short answers, filler words, structure
```

---

## Free Tier Optimization

### Gemini API (50 req/day)
- ❌ DON'T call for every keystroke
- ✅ DO batch analysis at end of interview
- ✅ DO cache common analysis
- ✅ DO show local scores while collecting API call count

### Firebase Firestore (50K reads/day)
- ❌ DON'T query entire database per interaction
- ✅ DO paginate results
- ✅ DO cache user data in memory
- ✅ DO batch writes

### Example: Smart Caching
```typescript
// Cache analysis results so you don't re-analyze
const analysisCache = new Map();

export async function getOrAnalyze(
  interviewId: string,
  transcript: string,
  question: string
) {
  const cacheKey = `${interviewId}`;
  
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey);
  }
  
  const result = await analyzeWithGemini(transcript, question);
  analysisCache.set(cacheKey, result);
  
  return result;
}
```

---

## Final Checklist Before Submission

- [ ] Project runs locally without errors
- [ ] All features work end-to-end
- [ ] No console errors in DevTools
- [ ] Responsive on mobile/tablet/desktop
- [ ] Video demo recorded (90 seconds)
- [ ] GitHub repo is public
- [ ] README has setup instructions
- [ ] No API keys exposed in GitHub
- [ ] Deployed to Vercel
- [ ] Production URL works
- [ ] Gemini API usage monitored
- [ ] Firebase rules are secure
- [ ] Tests pass locally

---

**You have everything. Build it. Ship it. Win it.** 🚀


# InterviewMaster AI - Complete Production Technical Specification
## Phase-by-Phase Implementation Guide for Google AI Studio + Firebase Free Tier

---

## Table of Contents
1. Architecture Overview
2. Free Tier Constraints & Optimization
3. Phase-by-Phase Breakdown (5 Phases)
4. Database Schema
5. API Specifications
6. Frontend Components
7. AI Avatar Implementation
8. Testing & Deployment
9. Cost Optimization Strategies

---

## CRITICAL: Free Tier Constraints & Workarounds

### Gemini API Free Tier:
- **Limit**: 50 requests/day (Gemini 2.5 Pro)
- **Your Strategy**: 
  - Cache interview question suggestions (ask once per role)
  - Batch process feedback (collect answer + analyze at end, not real-time)
  - Use client-side processing for basic scoring (facial expressions, filler words)

### Firebase Free Tier:
- **Firestore**: 50K reads/day, 20K writes/day, 1GB storage
- **Realtime Database**: Alternative if Firestore hits limit
- **Storage**: 1GB free
- **Your Strategy**:
  - Store video locally (browser IndexedDB until ready to process)
  - Batch interview analytics (process after session ends)
  - Cache common interview questions

### Solution: Hybrid Approach
```
Local Processing (Browser) → Cheap/Free
- Facial expression analysis (TensorFlow.js)
- Filler word detection (Web Speech API)
- Answer transcription (browser STT)
- Basic scoring (client-side)

Cloud Processing (Gemini) → Expensive (Use Sparingly)
- Deep answer quality analysis (1 call per interview)
- AI suggestions (1 call per interview)
- Avatar dialogue generation (1 call per interview)

Storage (Firebase) → Cheap
- User data only
- Interview metadata
- Aggregated analytics
```

---

## Phase-by-Phase Implementation (2 Weeks)

### PHASE 1: Setup + Interview Question Library (Days 1-2)

**Deliverables:**
- Firebase project + Firestore setup
- Interview question database (pre-populated, no API calls needed)
- Basic authentication

**Steps:**

1. **Create Firebase Project**
```
- Go to Firebase Console
- Create new project "interview-master"
- Enable Firestore, Auth, Storage
- Download config JSON
```

2. **Pre-populate Interview Questions (NO API CALLS)**
Create `questions.json` with 500+ questions organized by:
- Job role (Backend, Frontend, PM, etc.)
- Difficulty (Junior, Mid, Senior)
- Category (Experience, Technical, Behavioral)

```json
{
  "questions": [
    {
      "id": "q1",
      "role": "Backend Engineer",
      "difficulty": "Junior",
      "category": "Behavioral",
      "question": "Tell me about your biggest project failure",
      "answerFramework": "Problem → Your Role → Solution → Learning",
      "redFlags": ["No responsibility", "Blame others", "No learning"],
      "timeLimit": 90
    }
  ]
}
```

3. **Upload to Firestore**
```
Firebase Console → Data Import from JSON
```

**Cost**: $0 (pre-populated data)

---

### PHASE 2: Basic Interview Recording + Transcription (Days 3-5)

**Deliverables:**
- Video recording interface (WebRTC)
- Speech-to-text (browser Web Speech API - FREE)
- Basic interview flow

**Core Components:**

1. **Interview Setup Page**
```
- Select job role → Auto-load 5 random questions
- Set difficulty level
- Show answer framework
- Start button
```

2. **Video Recording Component** (Next.js)
```typescript
// components/InterviewRecorder.tsx
import { useRef, useState } from 'react';

export default function InterviewRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
    setIsRecording(true);
    startSpeechRecognition();
  };

  const startSpeechRecognition = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    
    let transcript = '';
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
    };
    
    recognition.onend = () => {
      setAnswers([...answers, transcript]);
    };
    
    recognition.start();
  };

  return (
    <div className="interview-recorder">
      <video ref={videoRef} autoPlay muted />
      <button onClick={startRecording}>Start Answer</button>
    </div>
  );
}
```

3. **Client-Side Speech Recognition Setup**
```typescript
// lib/speechRecognition.ts
export function initializeSpeechRecognition() {
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.language = 'en-US';
  
  return recognition;
}
```

**Cost**: $0 (all browser-side)

---

### PHASE 3: AI Avatar Implementation (Days 6-8)

**Deliverables:**
- AI-generated avatar video (using free TTS + pre-recorded poses)
- Real-time avatar sync with questions
- Minimal animation for expressions

**Avatar Strategy** (Work Around Video Generation Cost):

Option A: **Pre-recorded Avatar Videos** (Cheapest)
```
1. Hire person for 2-hour shoot (₹5K or ask friend)
2. Record 50+ interview scenarios:
   - Asking question (neutral)
   - Listening (nodding)
   - Responding positively (smile)
   - Responding negatively (concerned)
   - Encouraging (thumbs up)

3. Store in Firebase Storage as MP4 files
4. Play relevant video based on context
```

Option B: **AI Avatar Generator** (Better Quality, Costs Money)
- Synthesia, D-ID, HeyGen (all have free trials)
- BUT: Won't work on free tier long-term
- Skip for competition (use Option A)

Option C: **Minimal Avatar Animation** (Best for Free Tier)
```
- Use CSS/Canvas to create simple avatar
- Change facial expressions via SVG morphing
- Add text-to-speech for voice
```

**Implementation (Using Option C - Minimal But Professional):**

```typescript
// components/AIAvatar.tsx
import { useState, useEffect } from 'react';

interface AvatarExpression {
  mood: 'neutral' | 'encouraging' | 'concerned' | 'thinking';
  eyeOpen: number; // 0-1
  eyebrowAngle: number; // -45 to 45
  mouthOpen: number; // 0-1
}

export default function AIAvatar({ currentExpression }: { currentExpression: AvatarExpression }) {
  return (
    <svg width="300" height="400" viewBox="0 0 300 400">
      {/* Face */}
      <circle cx="150" cy="150" r="80" fill="#f5d5a8" stroke="#d4a574" strokeWidth="2" />
      
      {/* Eyes */}
      <circle cx="120" cy="130" r="12" fill="white" />
      <circle cx="180" cy="130" r="12" fill="white" />
      
      {/* Pupils with expression */}
      <circle 
        cx={120 + (currentExpression.mood === 'thinking' ? 5 : 0)} 
        cy="130" 
        r={8 * currentExpression.eyeOpen} 
        fill="black" 
      />
      <circle 
        cx={180 + (currentExpression.mood === 'thinking' ? 5 : 0)} 
        cy="130" 
        r={8 * currentExpression.eyeOpen} 
        fill="black" 
      />
      
      {/* Eyebrows */}
      <line
        x1="100"
        y1={110 - currentExpression.eyebrowAngle}
        x2="140"
        y2={100 - currentExpression.eyebrowAngle}
        stroke="#8b6f47"
        strokeWidth="3"
      />
      <line
        x1="160"
        y1={100 - currentExpression.eyebrowAngle}
        x2="200"
        y2={110 - currentExpression.eyebrowAngle}
        stroke="#8b6f47"
        strokeWidth="3"
      />
      
      {/* Mouth */}
      <path
        d={`M 120 200 Q 150 ${210 + currentExpression.mouthOpen * 10} 180 200`}
        stroke="#d4a574"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  );
}
```

**Avatar Expression Logic:**

```typescript
// lib/avatarExpressions.ts
export function getAvatarExpression(context: {
  stage: 'question' | 'listening' | 'evaluating' | 'feedback';
  userConfidence: number; // 0-100
  questionTime: number; // seconds into answer
}): AvatarExpression {
  if (context.stage === 'question') {
    return {
      mood: 'encouraging',
      eyeOpen: 1,
      eyebrowAngle: 5,
      mouthOpen: 0.3
    };
  }
  
  if (context.stage === 'listening') {
    // Nod occasionally
    return {
      mood: 'neutral',
      eyeOpen: 1,
      eyebrowAngle: context.questionTime % 2 < 1 ? 0 : 2,
      mouthOpen: 0.1
    };
  }
  
  // More logic for other stages...
  return { mood: 'neutral', eyeOpen: 1, eyebrowAngle: 0, mouthOpen: 0 };
}
```

**Cost**: $0 (CSS/SVG animation)

---

### PHASE 4: Core AI Analysis (Days 9-11)

**Deliverables:**
- Local scoring (client-side, FREE)
- Gemini analysis endpoint (1 call per interview, USES 1 OF 50 DAILY)
- Feedback generation
- Dashboard

**Local Scoring** (No API Cost):

```typescript
// lib/localScoring.ts

interface AnswerMetrics {
  confidence: number;
  clarity: number;
  length: number;
  fillerWords: number;
  structure: number;
}

export function analyzeAnswerLocally(
  transcript: string,
  videoFrames: ImageData[],
  answerFramework: string
): AnswerMetrics {
  // 1. Filler Words Detection
  const fillers = ['um', 'uh', 'like', 'you know', 'basically'];
  let fillerCount = 0;
  fillers.forEach(f => {
    const regex = new RegExp(`\\b${f}\\b`, 'gi');
    fillerCount += (transcript.match(regex) || []).length;
  });
  
  // 2. Answer Structure Check
  const hasStructure = checkAnswerStructure(transcript, answerFramework);
  
  // 3. Length Check
  const wordCount = transcript.split(' ').length;
  
  // 4. Facial Analysis (TensorFlow.js)
  const confidence = analyzeFacialExpressions(videoFrames);
  
  // 5. Clarity (word repetition, complexity)
  const clarity = analyzeClarity(transcript);
  
  return {
    confidence,
    clarity,
    length: Math.min(wordCount / 100, 1),
    fillerWords: Math.max(1 - fillerCount / 20, 0),
    structure: hasStructure ? 1 : 0.5
  };
}

function checkAnswerStructure(
  transcript: string,
  framework: string
): boolean {
  const parts = framework.split('→');
  let matchedParts = 0;
  
  // Very basic: check if transcript length suggests each part covered
  if (transcript.length > 200) matchedParts += 2;
  if (transcript.length > 400) matchedParts += 2;
  
  return matchedParts >= 3;
}

function analyzeFacialExpressions(frames: ImageData[]): number {
  // Use face-api.js for smile detection
  // Score based on genuine smile detection
  // Returns 0-1 confidence score
  return 0.7; // Placeholder
}

function analyzeClarity(transcript: string): number {
  const words = transcript.split(' ');
  const uniqueWords = new Set(words).size;
  const clarity = uniqueWords / words.length; // Higher = more varied vocabulary
  return Math.min(clarity * 2, 1);
}
```

**Gemini Cloud Analysis** (CALL THIS ONLY ONCE AT END):

```typescript
// lib/geminiAnalysis.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function analyzeAnswerWithGemini(
  question: string,
  transcript: string,
  answerFramework: string,
  localMetrics: AnswerMetrics
): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  
  const prompt = `
You are an expert interview coach. Analyze this interview answer:

Question: ${question}
Answer Framework: ${answerFramework}
Transcript: ${transcript}

Local Metrics:
- Confidence: ${localMetrics.confidence}
- Clarity: ${localMetrics.clarity}
- Structure: ${localMetrics.structure}
- Filler Words: ${localMetrics.fillerWords}

Provide:
1. Overall score (0-10)
2. Brief feedback (2-3 sentences)
3. Top 3 improvements
4. One encouraging statement

Format:
SCORE: [number]
FEEDBACK: [text]
IMPROVEMENTS:
- [improvement 1]
- [improvement 2]
- [improvement 3]
ENCOURAGEMENT: [text]
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Parse response
  const scoreMatch = response.match(/SCORE: (\d+)/);
  const feedbackMatch = response.match(/FEEDBACK: ([\s\S]*?)IMPROVEMENTS:/);
  const improvementsMatch = response.match(/IMPROVEMENTS:([\s\S]*?)ENCOURAGEMENT:/);
  
  return {
    score: parseInt(scoreMatch?.[1] || '5'),
    feedback: feedbackMatch?.[1]?.trim() || 'Good effort!',
    improvements: extractBulletPoints(improvementsMatch?.[1] || '')
  };
}

function extractBulletPoints(text: string): string[] {
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim());
}
```

**Firebase Backend** (Cloud Function to trigger analysis):

```typescript
// functions/analyzeInterview.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const analyzeInterview = functions.https.onRequest(
  async (req, res) => {
    const { userId, interviewId, transcript, question, framework } = req.body;
    
    try {
      // Call Gemini
      const { score, feedback, improvements } = await analyzeAnswerWithGemini(
        question,
        transcript,
        framework,
        {} // local metrics
      );
      
      // Save to Firestore
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('interviews')
        .doc(interviewId)
        .update({
          analysis: {
            score,
            feedback,
            improvements,
            analyzedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        });
      
      res.json({ success: true, score, feedback, improvements });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

**Cost**: Uses ~1 of 50 daily Gemini calls per interview

---

### PHASE 5: Dashboard + Results + Polish (Days 12-14)

**Deliverables:**
- Results dashboard
- Interview history
- Progress tracking
- Video playback with annotations
- Demo-ready UI

**Results Page Component:**

```typescript
// pages/results/[interviewId].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ResultsPage() {
  const router = useRouter();
  const { interviewId } = router.query;
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!interviewId) return;
    
    fetchResults();
  }, [interviewId]);

  const fetchResults = async () => {
    const response = await fetch(`/api/interviews/${interviewId}`);
    const data = await response.json();
    setInterview(data);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!interview) return <div>Interview not found</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{interview.role}</h1>
        <p className="text-gray-500">
          {new Date(interview.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Score Card */}
      <div className="max-w-3xl mx-auto mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm font-semibold">YOUR SCORE</p>
            <p className="text-5xl font-bold text-blue-600 mt-2">
              {interview.analysis.score}/10
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm font-semibold">IMPROVEMENT</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              +{interview.analysis.score - 5}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4">Feedback</h2>
        <p className="text-gray-700 leading-relaxed">
          {interview.analysis.feedback}
        </p>
      </div>

      {/* Improvements */}
      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4">Areas to Improve</h2>
        <ul className="space-y-3">
          {interview.analysis.improvements.map((item: string, idx: number) => (
            <li key={idx} className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">{idx + 1}.</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Video Replay */}
      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4">Your Answer</h2>
        <video
          controls
          className="w-full rounded-lg bg-black"
          src={interview.videoUrl}
        />
      </div>

      {/* Action Buttons */}
      <div className="max-w-3xl mx-auto mt-8 flex gap-4">
        <button
          onClick={() => router.push('/practice')}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Practice Again
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
        >
          View History
        </button>
      </div>
    </div>
  );
}
```

**Cost**: $0 (all cached/local)

---

## Database Schema (Firestore)

```
users/
  ├── {userId}
  │   ├── email: string
  │   ├── name: string
  │   ├── createdAt: timestamp
  │   ├── preferences: object
  │   │   ├── favoriteRole: string
  │   │   ├── difficulty: string
  │   │   └── language: string
  │   └── interviews/ (subcollection)
  │       ├── {interviewId}
  │       │   ├── question: string
  │       │   ├── role: string
  │       │   ├── transcript: string
  │       │   ├── videoUrl: string (Cloud Storage path)
  │       │   ├── createdAt: timestamp
  │       │   ├── localMetrics: object
  │       │   │   ├── confidence: number
  │       │   │   ├── clarity: number
  │       │   │   ├── fillerWords: number
  │       │   │   └── structure: number
  │       │   └── analysis: object
  │       │       ├── score: number
  │       │       ├── feedback: string
  │       │       ├── improvements: array<string>
  │       │       └── analyzedAt: timestamp

questions/ (Pre-populated)
  ├── {questionId}
  │   ├── role: string
  │   ├── difficulty: string
  │   ├── category: string
  │   ├── question: string
  │   ├── answerFramework: string
  │   ├── redFlags: array<string>
  │   ├── timeLimit: number
  │   └── commonAnswers: array<string>
```

---

## API Endpoints

### 1. POST /api/interviews/start
```
Request:
{
  "userId": "user123",
  "role": "Backend Engineer",
  "difficulty": "Mid"
}

Response:
{
  "interviewId": "int_abc123",
  "questions": [/* 5 questions */],
  "startedAt": "2025-12-09T..."
}
```

### 2. POST /api/interviews/:id/submit
```
Request:
{
  "questionIndex": 0,
  "transcript": "I once built a...",
  "videoBlob": <ArrayBuffer>,
  "duration": 87
}

Response:
{
  "saved": true,
  "nextQuestion": true / false
}
```

### 3. POST /api/interviews/:id/analyze
```
Request:
{
  "userId": "user123"
}

Response:
{
  "score": 7,
  "feedback": "Good structure...",
  "improvements": [...]
}
```

### 4. GET /api/interviews/:id
```
Response: Full interview object with analysis
```

---

## Environment Variables (.env.local)

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step-by-Step Starting Guide

### Step 1: Setup (30 minutes)
```bash
# Create Next.js project
npx create-next-app@latest interview-master --typescript --tailwind

cd interview-master

# Install dependencies
npm install firebase @google/generative-ai next-auth

# Create environment file
cp .env.example .env.local
```

### Step 2: Firebase Setup (30 minutes)
1. Go to Firebase Console (console.firebase.google.com)
2. Create new project "interview-master"
3. Enable Firestore Database (Start in test mode)
4. Enable Authentication (Email/Password + Google)
5. Enable Cloud Storage
6. Copy config to .env.local
7. Create collection "questions" and import questions.json

### Step 3: Google AI Studio Setup (15 minutes)
1. Go to Google AI Studio (ai.google.com/aistudio)
2. Create API key
3. Copy to .env.local as NEXT_PUBLIC_GEMINI_API_KEY

### Step 4: Folder Structure
```
interview-master/
├── components/
│   ├── InterviewRecorder.tsx
│   ├── AIAvatar.tsx
│   ├── QuestionSelector.tsx
│   └── ResultsCard.tsx
├── pages/
│   ├── api/
│   │   ├── interviews/
│   │   │   ├── start.ts
│   │   │   ├── [id]/
│   │   │   │   ├── submit.ts
│   │   │   │   ├── analyze.ts
│   │   │   │   └── index.ts
│   │   └── auth/
│   ├── index.tsx (home)
│   ├── practice.tsx
│   ├── results/[id].tsx
│   └── dashboard.tsx
├── lib/
│   ├── firebase.ts
│   ├── speechRecognition.ts
│   ├── localScoring.ts
│   ├── geminiAnalysis.ts
│   ├── avatarExpressions.ts
│   └── utils.ts
├── styles/
│   └── globals.css
├── public/
│   └── questions.json
└── .env.local
```

### Step 5: Database Initialization
```bash
# Create questions.json in /public
# Contains 500+ interview questions pre-formatted

# Import to Firestore via Console UI
# Firebase Console → Firestore → Start Collection → Import JSON
```

---

## Testing Checklist

### Local Testing
- [ ] Sign up / Login works
- [ ] Question selection works
- [ ] Video recording captures video + audio
- [ ] Speech-to-text transcribes correctly
- [ ] Avatar changes expressions
- [ ] Local scoring calculates (no API calls)
- [ ] Save to Firestore works
- [ ] Results display correctly

### API Testing
- [ ] Gemini analysis returns valid JSON
- [ ] Feedback is meaningful
- [ ] Improvements are actionable
- [ ] Error handling works

### Performance Testing
- [ ] Video upload < 30 seconds
- [ ] Page load < 2 seconds
- [ ] Gemini response < 10 seconds

### Free Tier Testing
- [ ] Monitor Gemini API usage daily
- [ ] Batch requests efficiently
- [ ] Cache results properly

---

## Deployment (Vercel + Firebase)

### Step 1: Deploy Backend (Firebase Functions - NOT needed for free tier)
```bash
# For free tier, use Next.js API routes on Vercel instead
```

### Step 2: Deploy Frontend (Vercel)
```bash
npm install -g vercel

# Login and deploy
vercel

# Set environment variables in Vercel dashboard
# Deploy each push automatically
```

### Step 3: Production Checklist
- [ ] All env vars set in Vercel
- [ ] Firebase rules are secure (read/write authenticated users only)
- [ ] CORS enabled for Gemini API
- [ ] Error logging enabled
- [ ] Analytics enabled
- [ ] Monitoring Gemini quota

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|-----------|------|
| Gemini API | 50 req/day | 50/day (1 per interview) | $0 |
| Firebase Firestore | 50K reads, 20K writes | ~5K reads, 2K writes | $0 |
| Firebase Storage | 1GB | ~500MB (videos) | $0 |
| Vercel | 100GB bandwidth | ~5GB | $0 |
| **TOTAL** | | | **$0** |

**Note**: Free tier easily supports 50 daily active users

---

## Optimization for Cursor (If Google AI Studio API Limit Hit)

### When to use Cursor:
- If Gemini quota exhausted for the day
- For code generation and debugging
- For component creation

### Cursor Commands:
```
@codebase Generate analysis function for interview answers
@codebase Debug Firebase integration issues
@codebase Create API endpoint for saving interviews
@codebase Help optimize Gemini API usage
```

### Key Rules for Cursor:
1. Keep API calls logged in .env
2. Test locally before deployment
3. Cache responses aggressively
4. Batch requests

---

## Next Steps (In Order)

### Week 1:
- [ ] Day 1-2: Setup Firebase + env vars
- [ ] Day 3-5: Build recording + transcription
- [ ] Day 6-7: Test with real users

### Week 2:
- [ ] Day 8-10: Avatar + local scoring
- [ ] Day 11-12: Gemini integration
- [ ] Day 13-14: Dashboard + deploy

### Week 3 (Before Submission):
- [ ] Polish UI (match Dribbble reference)
- [ ] Test all flows end-to-end
- [ ] Make demo video
- [ ] Submit!

---

**You have everything you need. Go build it.** 🚀


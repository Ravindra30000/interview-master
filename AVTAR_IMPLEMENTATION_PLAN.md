# Avatar Implementation Plan
## Based on Modified PRD - Gemini 2.5 Flash + Pre-recorded Videos + Firebase Realtime

**Last Updated:** December 2024  
**Status:** Planning Phase  
**Model:** Gemini 2.5 Flash  
**Deployment:** Google Cloud Run

---

## EXECUTIVE SUMMARY

This plan outlines the implementation of a **real-time AI avatar interview system** using:
- **Gemini 2.5 Flash** for conversation intelligence
- **Pre-recorded avatar videos** with lip-sync
- **Firebase Realtime Database** for state coordination
- **Google Cloud TTS** for speech synthesis
- **Google Cloud Run** for backend deployment

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  AvatarVideoGenerator Component                 │   │
│  │  - Displays pre-recorded avatar video           │   │
│  │  - Syncs lip movements with TTS audio           │   │
│  │  - Manages conversation state                   │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│                         │ Firebase Realtime DB           │
│                         │ (State sync)                   │
│                         ▼                                │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTP/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│          BACKEND (Google Cloud Run)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Avatar Response API                             │   │
│  │  1. Receive user transcript                      │   │
│  │  2. Call Gemini 2.5 Flash                       │   │
│  │  3. Generate TTS with Google Cloud TTS         │   │
│  │  4. Select pre-recorded video based on emotion   │   │
│  │  5. Sync lip movements with audio                │   │
│  │  6. Stream video back to frontend               │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Firebase Realtime Database Service              │   │
│  │  - Tracks conversation state                     │   │
│  │  - Coordinates video generation                  │   │
│  │  - Manages user session                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Gemini     │  │  Google Cloud │  │   Firebase   │ │
│  │  2.5 Flash   │  │     TTS       │  │   Storage    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION PHASES

### PHASE 1: Foundation Setup (Week 1)

#### 1.1 Firebase Realtime Database Setup
**Files to create:**
- `src/lib/realtime.ts` - Firebase Realtime Database client
- `src/types/realtime.ts` - TypeScript types for Realtime DB

**Tasks:**
- [ ] Enable Firebase Realtime Database in Firebase Console
- [ ] Initialize Realtime DB client in Firebase config
- [ ] Create database structure for avatar sessions:
  ```typescript
  {
    sessions: {
      [sessionId]: {
        userId: string;
        status: 'idle' | 'listening' | 'processing' | 'speaking';
        currentQuestion: number;
        conversationHistory: Message[];
        avatarState: {
          emotion: 'neutral' | 'encouraging' | 'thinking' | 'concerned';
          videoUrl: string | null;
          audioUrl: string | null;
        };
        createdAt: timestamp;
        updatedAt: timestamp;
      }
    }
  }
  ```
- [ ] Add security rules for Realtime DB
- [ ] Test read/write operations

**Dependencies:**
- Firebase SDK (already installed)
- Firebase Realtime Database package

---

#### 1.2 Pre-recorded Avatar Video Library
**Files to create:**
- `src/lib/avatarVideos.ts` - Avatar video management
- `public/avatars/` - Directory for pre-recorded videos

**Tasks:**
- [ ] Record base avatar videos (minimum 4 emotions):
  - `neutral.mp4` - Neutral expression, ready to speak
  - `encouraging.mp4` - Smiling, positive expression
  - `thinking.mp4` - Thoughtful, listening expression
  - `concerned.mp4` - Slightly concerned, probing expression
- [ ] Record videos with clear mouth movements for lip-sync
- [ ] Upload videos to Firebase Storage
- [ ] Create video metadata:
  ```typescript
  interface AvatarVideo {
    id: string;
    emotion: 'neutral' | 'encouraging' | 'thinking' | 'concerned';
    storageUrl: string;
    duration: number;
    visemeMap: VisemeFrame[]; // For lip-sync
  }
  ```
- [ ] Build video retrieval system

**Video Requirements:**
- Format: MP4 (H.264)
- Resolution: 720p minimum
- Frame rate: 30fps
- Duration: 5-10 seconds per emotion
- Clear mouth/face visibility
- Professional appearance

---

#### 1.3 Google Cloud TTS Integration
**Files to create:**
- `src/lib/textToSpeech.ts` - Google Cloud TTS client
- `src/app/api/tts/route.ts` - TTS API endpoint

**Tasks:**
- [ ] Enable Google Cloud Text-to-Speech API
- [ ] Create service account with TTS permissions
- [ ] Install `@google-cloud/text-to-speech` package
- [ ] Implement TTS function:
  ```typescript
  async function generateSpeech(
    text: string,
    voiceConfig?: VoiceConfig
  ): Promise<{
    audioBuffer: Buffer;
    audioUrl: string;
    duration: number;
  }>
  ```
- [ ] Configure voice settings:
  - Voice: `en-US-Neural2-D` (professional, neutral)
  - Audio encoding: MP3 or WAV
  - Sample rate: 24000 Hz
- [ ] Test TTS generation latency (< 500ms target)
- [ ] Add caching for common phrases

**Dependencies:**
```bash
npm install @google-cloud/text-to-speech
```

**Environment Variables:**
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

---

### PHASE 2: Gemini 2.5 Flash Integration (Week 1-2)

#### 2.1 Update Gemini Model
**Files to modify:**
- `src/lib/gemini.ts` - Update to use Gemini 2.5 Flash
- `src/app/api/interviews/[id]/analyze/route.ts` - Update model selection

**Tasks:**
- [ ] Change model from current to `gemini-2.5-flash`
- [ ] Update prompt for conversation context
- [ ] Add emotion detection in response:
  ```typescript
  interface GeminiResponse {
    text: string;
    emotion: 'neutral' | 'encouraging' | 'thinking' | 'concerned';
    nextQuestion?: string;
    followUp?: boolean;
  }
  ```
- [ ] Implement conversation history management
- [ ] Test response latency (< 1 second target)
- [ ] Add retry logic for rate limits

**Code Changes:**
```typescript
// src/lib/gemini.ts
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'  // Changed from previous model
});
```

---

#### 2.2 Avatar Conversation Manager
**Files to create:**
- `src/lib/avatarConversation.ts` - Conversation management
- `src/types/conversation.ts` - Conversation types

**Tasks:**
- [ ] Create conversation state manager:
  ```typescript
  class AvatarConversationManager {
    private history: Message[];
    private currentQuestion: number;
    private persona: AvatarPersona;
    
    async processUserInput(
      userTranscript: string
    ): Promise<AvatarResponse>;
    
    async getNextQuestion(): Promise<string>;
    
    getConversationHistory(): Message[];
  }
  ```
- [ ] Implement multi-turn dialogue logic
- [ ] Add context tracking
- [ ] Handle follow-up questions
- [ ] Manage conversation flow (greeting → questions → closing)

**Conversation Flow:**
1. Greeting: "Hello! Let's start your interview..."
2. Question 1: "Tell me about yourself..."
3. Follow-up based on answer
4. Question 2: "Describe a challenging project..."
5. Continue for 5-10 questions
6. Closing: "Thank you! Let me provide feedback..."

---

### PHASE 3: Lip-Sync System (Week 2)

#### 3.1 Viseme Extraction
**Files to create:**
- `src/lib/lipSync.ts` - Lip-sync processing
- `src/lib/visemeMapping.ts` - Viseme to mouth shape mapping

**Tasks:**
- [ ] Research viseme mapping (phonemes → mouth shapes)
- [ ] Create viseme extraction from audio:
  ```typescript
  interface VisemeFrame {
    timestamp: number;
    viseme: VisemeType;
    intensity: number;
  }
  
  async function extractVisemes(
    audioBuffer: Buffer
  ): Promise<VisemeFrame[]>
  ```
- [ ] Map visemes to mouth shapes:
  - A, E, I, O, U → Open mouth shapes
  - M, B, P → Closed mouth
  - F, V → Lower lip on teeth
  - etc.
- [ ] Test accuracy of viseme detection

**Approach Options:**
1. **Simple approach**: Use audio waveform analysis
2. **Advanced approach**: Use phoneme recognition (Google Speech-to-Text)
3. **Hybrid**: Pre-process common phrases, real-time for new text

**Recommendation:** Start with simple approach, upgrade if needed.

---

#### 3.2 Video-Audio Synchronization
**Files to create:**
- `src/lib/videoSync.ts` - Video synchronization
- `src/components/AvatarVideoPlayer.tsx` - Video player with sync

**Tasks:**
- [ ] Create video frame overlay system
- [ ] Sync mouth movements with audio:
  ```typescript
  async function syncVideoWithAudio(
    baseVideo: Buffer,
    audioBuffer: Buffer,
    visemes: VisemeFrame[]
  ): Promise<Buffer>
  ```
- [ ] Implement frame-by-frame mouth replacement
- [ ] Test synchronization accuracy (< 100ms lag)
- [ ] Optimize for real-time playback

**Technical Approach:**
- Use Canvas API or WebGL for video manipulation
- Overlay mouth shapes on base avatar video
- Sync audio playback with video frames
- Stream chunks to frontend

**Alternative (Simpler):**
- Pre-generate video segments for common phrases
- Cache frequently used combinations
- Real-time generation only for unique responses

---

### PHASE 4: Backend API (Week 2-3)

#### 4.1 Avatar Response API Endpoint
**Files to create:**
- `src/app/api/avatar/respond/route.ts` - Main avatar API
- `src/lib/avatarPipeline.ts` - Avatar generation pipeline

**Tasks:**
- [ ] Create API endpoint:
  ```typescript
  POST /api/avatar/respond
  Body: {
    sessionId: string;
    userTranscript: string;
    conversationHistory: Message[];
  }
  
  Response: {
    avatarResponse: {
      text: string;
      emotion: string;
      videoUrl: string;
      audioUrl: string;
      duration: number;
    };
    nextQuestion?: string;
    conversationState: ConversationState;
  }
  ```
- [ ] Implement pipeline:
  1. Receive user input
  2. Call Gemini 2.5 Flash
  3. Extract emotion and response text
  4. Generate TTS audio
  5. Select pre-recorded video
  6. Sync lip movements
  7. Upload to Firebase Storage
  8. Return URLs
- [ ] Add error handling
- [ ] Implement rate limiting
- [ ] Add logging and monitoring

**Pipeline Flow:**
```
User Input
    ↓
Gemini 2.5 Flash (get response + emotion)
    ↓
Google Cloud TTS (generate audio)
    ↓
Select Pre-recorded Video (based on emotion)
    ↓
Extract Visemes from Audio
    ↓
Sync Video Mouth with Audio
    ↓
Upload to Firebase Storage
    ↓
Return Video + Audio URLs
```

---

#### 4.2 Firebase Realtime Sync Service
**Files to create:**
- `src/lib/realtimeSync.ts` - Realtime DB sync service
- `src/app/api/avatar/session/route.ts` - Session management

**Tasks:**
- [ ] Create session management:
  ```typescript
  async function createAvatarSession(
    userId: string
  ): Promise<string> // Returns sessionId
  
  async function updateSessionState(
    sessionId: string,
    state: Partial<SessionState>
  ): Promise<void>
  
  async function getSessionState(
    sessionId: string
  ): Promise<SessionState>
  ```
- [ ] Implement real-time state updates
- [ ] Add session cleanup (expire after 1 hour)
- [ ] Handle concurrent sessions
- [ ] Test real-time synchronization

**State Structure:**
```typescript
interface SessionState {
  userId: string;
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  currentQuestion: number;
  conversationHistory: Message[];
  avatarState: {
    emotion: string;
    videoUrl: string | null;
    audioUrl: string | null;
    isPlaying: boolean;
  };
  createdAt: number;
  updatedAt: number;
}
```

---

### PHASE 5: Frontend Components (Week 3)

#### 5.1 AvatarVideoGenerator Component
**Files to create:**
- `src/components/AvatarVideoGenerator.tsx` - Main avatar component
- `src/components/AvatarVideoPlayer.tsx` - Video player
- `src/hooks/useAvatarSession.ts` - Avatar session hook

**Tasks:**
- [ ] Create avatar video display component:
  ```typescript
  interface AvatarVideoGeneratorProps {
    sessionId: string;
    onResponseComplete?: (response: AvatarResponse) => void;
    onError?: (error: Error) => void;
  }
  ```
- [ ] Implement video playback with audio sync
- [ ] Add loading states
- [ ] Handle video buffering
- [ ] Add error recovery
- [ ] Implement real-time state updates from Firebase

**Component Features:**
- Display avatar video
- Play synchronized audio
- Show loading spinner during processing
- Display conversation transcript
- Handle network errors gracefully

---

#### 5.2 Avatar Interview Mode
**Files to modify:**
- `src/app/practice/page.tsx` - Add avatar mode option
- `src/app/practice/avatar/page.tsx` - New avatar interview page

**Tasks:**
- [ ] Add mode selection in practice setup:
  - "Practice Mode" (existing)
  - "Avatar Interview Mode" (new)
- [ ] Create avatar interview page:
  ```typescript
  // Flow:
  // 1. User selects role + difficulty
  // 2. Avatar appears and greets
  // 3. Avatar asks first question
  // 4. User records answer
  // 5. Avatar responds + asks follow-up
  // 6. Continue for 5-10 questions
  // 7. Show results with avatar reactions
  ```
- [ ] Integrate with existing recording component
- [ ] Add conversation UI
- [ ] Implement question progression
- [ ] Add session management

**UI Layout:**
```
┌─────────────────────────────────────┐
│  Avatar Video (Left)                │
│  ┌─────────────┐                    │
│  │   Avatar    │                    │
│  │   Speaking  │                    │
│  └─────────────┘                    │
│                                     │
│  User Video (Right)                 │
│  ┌─────────────┐                    │
│  │   You       │                    │
│  │  Recording  │                    │
│  └─────────────┘                    │
│                                     │
│  Conversation Transcript            │
│  ────────────────────────────────   │
│  Avatar: "Tell me about yourself"  │
│  You: "I'm a software engineer..."  │
│  Avatar: "That's interesting..."    │
└─────────────────────────────────────┘
```

---

### PHASE 6: Google Cloud Run Deployment (Week 3-4)

#### 6.1 Cloud Run Configuration
**Files to modify:**
- `Dockerfile` - Ensure compatibility
- `cloudbuild.yaml` - Update for Cloud Run
- `.gcloudignore` - Add ignore patterns

**Tasks:**
- [ ] Update Dockerfile for Cloud Run:
  - Ensure Node.js 20
  - Expose port 8080 (Cloud Run default)
  - Add health check endpoint
- [ ] Create Cloud Run service configuration:
  ```yaml
  # cloud-run-service.yaml
  apiVersion: serving.knative.dev/v1
  kind: Service
  metadata:
    name: interview-master-avatar
  spec:
    template:
      spec:
        containers:
        - image: gcr.io/PROJECT_ID/interview-master:latest
          ports:
          - containerPort: 8080
          env:
          - name: PORT
            value: "8080"
          - name: NEXT_PUBLIC_FIREBASE_API_KEY
            valueFrom:
              secretKeyRef:
                name: firebase-api-key
                key: value
          # ... other env vars
  ```
- [ ] Configure environment variables in Cloud Run
- [ ] Set up service account with required permissions
- [ ] Configure scaling (min: 0, max: 10 instances)
- [ ] Set timeout (300 seconds for long requests)
- [ ] Add health check endpoint: `/api/health`

**Deployment Commands:**
```bash
# Build and deploy
gcloud builds submit --config=cloudbuild.yaml

# Deploy to Cloud Run
gcloud run deploy interview-master-avatar \
  --image gcr.io/PROJECT_ID/interview-master:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=..." \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

---

#### 6.2 Environment Variables Setup
**Files to create:**
- `.env.cloudrun` - Cloud Run environment variables template

**Required Environment Variables:**
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini
NEXT_PUBLIC_GEMINI_API_KEY=

# Google Cloud TTS
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR
GOOGLE_CLOUD_PROJECT_ID=

# Firebase Realtime Database
FIREBASE_DATABASE_URL=https://PROJECT_ID-default-rtdb.firebaseio.com/

# Cloud Run
PORT=8080
NODE_ENV=production
```

**Setup Steps:**
1. Create service account in Google Cloud Console
2. Grant permissions:
   - Cloud Text-to-Speech API User
   - Firebase Admin
   - Storage Admin
3. Download service account JSON
4. Store as Cloud Run secret or environment variable
5. Configure in Cloud Run service settings

---

### PHASE 7: Testing & Optimization (Week 4)

#### 7.1 End-to-End Testing
**Test Cases:**
- [ ] User starts avatar interview session
- [ ] Avatar greets user
- [ ] User answers first question
- [ ] Avatar responds with appropriate emotion
- [ ] Lip-sync is accurate (< 100ms lag)
- [ ] Conversation continues for 5+ questions
- [ ] Session state syncs in real-time
- [ ] Results page shows avatar reactions
- [ ] Error handling works (network failures, API errors)
- [ ] Mobile responsiveness

**Performance Targets:**
- Avatar response time: < 2 seconds
- Lip-sync accuracy: > 95%
- Video streaming: Smooth on 4G
- TTS generation: < 500ms
- Gemini response: < 1 second

---

#### 7.2 Optimization
**Areas to optimize:**
- [ ] Cache common TTS phrases
- [ ] Pre-generate video segments for frequent responses
- [ ] Optimize video compression
- [ ] Reduce Firebase Realtime DB reads
- [ ] Batch API calls where possible
- [ ] Implement request queuing
- [ ] Add CDN for video delivery
- [ ] Optimize bundle size

**Cost Optimization:**
- Monitor Gemini API usage (target: < 50 calls/day per user)
- Cache TTS for repeated phrases
- Compress videos before storage
- Use Firebase free tier efficiently
- Monitor Cloud Run costs

---

## FILE STRUCTURE

```
src/
├── app/
│   ├── api/
│   │   ├── avatar/
│   │   │   ├── respond/
│   │   │   │   └── route.ts          # Main avatar API
│   │   │   ├── session/
│   │   │   │   └── route.ts          # Session management
│   │   │   └── health/
│   │   │       └── route.ts          # Health check
│   │   └── tts/
│   │       └── route.ts              # TTS endpoint
│   └── practice/
│       └── avatar/
│           └── page.tsx              # Avatar interview page
├── components/
│   ├── AvatarVideoGenerator.tsx     # Main avatar component
│   ├── AvatarVideoPlayer.tsx         # Video player
│   └── AvatarConversation.tsx       # Conversation UI
├── lib/
│   ├── avatarVideos.ts               # Video management
│   ├── avatarConversation.ts         # Conversation logic
│   ├── textToSpeech.ts              # Google TTS client
│   ├── lipSync.ts                   # Lip-sync processing
│   ├── videoSync.ts                 # Video synchronization
│   ├── realtime.ts                  # Firebase Realtime DB
│   ├── realtimeSync.ts              # Realtime sync service
│   ├── avatarPipeline.ts            # Avatar generation pipeline
│   └── gemini.ts                    # Updated Gemini 2.5 Flash
├── hooks/
│   └── useAvatarSession.ts           # Avatar session hook
└── types/
    ├── avatar.ts                     # Avatar types
    ├── conversation.ts               # Conversation types
    └── realtime.ts                   # Realtime DB types
```

---

## DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "@google-cloud/text-to-speech": "^5.0.0",
    "firebase": "^10.12.2"  // Already installed, ensure Realtime DB support
  }
}
```

**Installation:**
```bash
npm install @google-cloud/text-to-speech
```

---

## COST ESTIMATION

### Monthly Costs (100 active users):
- **Gemini 2.5 Flash**: ~$10-20 (50 calls/user/month)
- **Google Cloud TTS**: ~$5-10 (1M characters/month)
- **Firebase Realtime DB**: $0 (free tier: 1GB storage, 10GB transfer)
- **Firebase Storage**: ~$5 (videos)
- **Cloud Run**: ~$10-30 (2 vCPU, 2GB RAM, minimal usage)
- **Total**: ~$30-70/month

### Scaling to 1000 users:
- **Gemini**: ~$100-200
- **TTS**: ~$50-100
- **Storage**: ~$50
- **Cloud Run**: ~$50-100
- **Total**: ~$250-450/month

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Lip-sync quality poor | Medium | High | Start with simple approach, iterate |
| TTS latency too high | Low | Medium | Cache common phrases, optimize |
| Gemini rate limits | Medium | High | Implement queuing, caching |
| Cloud Run costs high | Low | Medium | Monitor usage, set budgets |
| Video storage costs | Low | Medium | Compress videos, cleanup old files |
| Real-time sync issues | Medium | Medium | Add fallback to polling |

---

## SUCCESS METRICS

- **Avatar response time**: < 2 seconds (target)
- **Lip-sync accuracy**: > 95% (target)
- **User satisfaction**: > 4/5 stars (target)
- **Conversation quality**: Natural, probing follow-ups
- **System reliability**: 99% uptime
- **Cost per interview**: < $0.50

---

## NEXT STEPS

1. **Review this plan** with team
2. **Set up Firebase Realtime Database**
3. **Record pre-recorded avatar videos**
4. **Enable Google Cloud TTS API**
5. **Start with Phase 1 implementation**
6. **Test each phase before moving to next**

---

**Status**: Ready for implementation  
**Estimated Timeline**: 4 weeks  
**Priority**: High (Core feature)

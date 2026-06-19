# InterviewMaster AI - Modified PRD (Avatar-First Edition)
## For Google for Startups Prototype + Imagine Cup Submission

**Last Updated:** December 2025  
**Version:** 2.0 (Avatar-Focused)  
**Status:** Phase-by-phase implementation guide with existing codebase integration

---

## EXECUTIVE SUMMARY

You're converting your **half-built interview practice application** into a **full-stack AI interview platform** with:

✅ **PRACTICE MODE** (Your existing work)
- Video recording from webcam
- Live speech-to-text transcription
- Instant Gemini 3.5 Pro feedback

✅ **NEW: AVATAR MODE** (Next Phase)
- Real-time AI avatar (looks like actual person)
- Perfect lip-sync with AI-generated voice
- Natural eye contact, head movements, gestures
- Uses Gemini 3.5 Pro for real-time conversation
- Dynamically responds to user answers

✅ **COMPANY HIRING WORKFLOW** (Future)
- Companies create custom avatars (their own persona)
- Candidates practice with that avatar
- Filtering, scoring, analytics dashboard

---

## CURRENT STATE → FUTURE STATE

### What You've Built (Current Half-App)
```
✅ User authentication (Firebase)
✅ Interview question database (500+ questions)
✅ Video recording component
✅ Web Speech API transcription
✅ Basic scoring (local client-side)
✅ Gemini integration for feedback (basic)
✅ Results dashboard
✅ Firebase Firestore + Storage
```

### What You're Adding (Avatar MVP)
```
🟨 Real-time avatar video streaming
🟨 Lip-sync generation (video synthesis)
🟨 Live conversation with avatar
🟨 Gesture/expression synchronization
🟨 Multi-turn dialogue management
🟨 Persona customization (companies)
🟨 Advanced Gemini 3.5 Pro prompting
```

---

## PHASE ROADMAP (4 Weeks)

### PHASE 0: Foundation (What You Have) ✅
**Status**: Complete
- Practice recording + feedback
- Basic interview flow
- Firebase backend
- User authentication

### PHASE 1: Avatar Video Generation (Weeks 1-2) 🔴
**Goal**: Create realistic avatar video with lip-sync
- Generate avatar face using AI (HeyGen or custom)
- Create lip-sync system using Gemini speech + ffmpeg
- Build WebSocket for real-time streaming

### PHASE 2: Real-Time Conversation (Weeks 2-3) 🔴
**Goal**: Avatar responds dynamically to user
- Integrate Gemini 3.5 Pro for real-time reasoning
- Multi-turn conversation management
- Gesture generation based on context
- Error handling for network latency

### PHASE 3: Company Persona (Week 4) 🔴
**Goal**: Companies customize their own avatar
- Avatar customization UI
- Instruction set management
- Interview routing (user → company avatar)
- Analytics dashboard for companies

### PHASE 4: Polish + Deployment (Ongoing)
- Mobile optimization
- Video streaming optimization
- Cost reduction (model quantization)
- A/B testing framework

---

## DETAILED REQUIREMENTS

### USE CASE 1: Candidate Practice (Your Existing Use Case)

**Flow:**
```
1. User logs in
2. Selects job role + difficulty
3. OPTION A: "AI Coach" (current - text-based feedback)
4. OPTION B: "Interview with Avatar" (NEW)
   - Avatar asks questions in real-time
   - User answers on camera
   - Avatar reacts and asks follow-ups
   - User gets detailed feedback
5. Results dashboard shows:
   - Score (content + delivery)
   - Video with avatar reaction overlaid
   - Improvements
```

**Avatar Behavior (Real-Time):**
- Avatar listens to user answer
- Processes with Gemini 3.5 Pro (< 1 second latency)
- Generates next question/follow-up
- Synthesizes speech + lip-sync video
- Streams video back in real-time
- Avatar expresses emotions (nods, smiles, concerned look)

### USE CASE 2: Company Hiring (Future)

**Flow:**
```
1. Company signs up
2. Creates custom avatar:
   - Upload persona (name, role, company)
   - Set interview instructions (what to assess)
   - Select 5-10 interview questions
   - Optional: upload company logo/background
3. Avatar trained on company style
4. Candidates take interview with custom avatar
5. Company sees:
   - Candidate video + avatar reaction
   - Scoring (automated)
   - Recommendation (pass/fail)
```

---

## TECHNICAL ARCHITECTURE

### System Architecture (Updated)

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Practice   │  │   Live Chat  │  │   Results    │  │
│  │   Mode       │  │   with Avatar│  │   Dashboard  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                   │         │
│         └──────────────────┼───────────────────┘         │
│                            │                             │
│  WebSocket Connection      │ Firebase REST API          │
│                            │                             │
└────────────┬───────────────┼─────────────────────────────┘
             │               │
             │               ▼
    ┌────────▼────────────────────────────────┐
    │      BACKEND (Node.js / Firebase)       │
    │  ┌─────────────────────────────────┐   │
    │  │  Gemini 3.5 Pro Integration     │   │
    │  │  - Reasoning (conversation)     │   │
    │  │  - Speech synthesis             │   │
    │  │  - Scoring & feedback           │   │
    │  └─────────────────────────────────┘   │
    │  ┌─────────────────────────────────┐   │
    │  │  Video Processing               │   │
    │  │  - Lip-sync generation          │   │
    │  │  - Avatar synthesis             │   │
    │  │  - Real-time streaming          │   │
    │  └─────────────────────────────────┘   │
    │  ┌─────────────────────────────────┐   │
    │  │  Firebase Services              │   │
    │  │  - Firestore (data)             │   │
    │  │  - Storage (videos)             │   │
    │  │  - Auth                         │   │
    │  └─────────────────────────────────┘   │
    └────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │   External Services                 │
    │  ┌──────────────┐ ┌──────────────┐ │
    │  │   Gemini     │ │   Speech     │ │
    │  │   3.5 Pro    │ │   Synthesis  │ │
    │  │              │ │   (Google)   │ │
    │  └──────────────┘ └──────────────┘ │
    │  ┌──────────────┐ ┌──────────────┐ │
    │  │ HeyGen or    │ │   ffmpeg     │ │
    │  │ D-ID Avatar  │ │   (for lip   │ │
    │  │   (if paid)  │ │    sync)     │ │
    │  └──────────────┘ └──────────────┘ │
    └─────────────────────────────────────┘
```

### Avatar Generation Pipeline

```
User Answer (transcript)
        ↓
Gemini 3.5 Pro Analysis
        ↓
Generate Response + Emotion
        ↓
Text-to-Speech (Google API)
        ↓
Generate Mouth Shapes (visemes)
        ↓
Render Avatar Video (Canvas/Three.js)
        ↓
Stream Video + Audio to Client
        ↓
Display to User (Real-time)
```

---

## IMPLEMENTATION LAYERS

### Layer 1: Avatar Component (Frontend)
**File**: `src/components/InterviewAvatar.tsx`

```typescript
export default function InterviewAvatar({
  isLive,
  transcript,
  emotion,
  videoStream
}) {
  // Render streaming video of avatar
  // Overlay user video on side
  // Show real-time transcription
  // Display confidence/emotion metrics
}
```

### Layer 2: Real-Time WebSocket (Backend)
**File**: `src/lib/websocket.ts`

```typescript
const socket = io('wss://your-server.com');

socket.on('user-answer', async (transcript) => {
  // 1. Analyze with Gemini
  const response = await analyzeWithGemini(transcript);
  
  // 2. Generate speech
  const audioStream = await generateSpeech(response);
  
  // 3. Render avatar + lip-sync
  const videoStream = await renderAvatarVideo(audioStream);
  
  // 4. Stream back to client
  socket.emit('avatar-response', videoStream);
});
```

### Layer 3: Gemini Integration (Backend)
**File**: `src/lib/geminiAvatar.ts`

```typescript
export async function interactWithAvatar(
  userTranscript: string,
  conversationHistory: Message[],
  avatarPersona: AvatarPersona
): Promise<{
  response: string;
  emotion: 'encouraging' | 'concerned' | 'thinking' | 'nodding';
  nextQuestion?: string;
  score?: number;
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.5-pro' 
  });
  
  const prompt = buildPrompt(
    userTranscript,
    conversationHistory,
    avatarPersona
  );
  
  const response = await model.generateContent(prompt);
  
  // Parse response for emotion, text, follow-up
  return parseGeminiResponse(response);
}
```

### Layer 4: Video Rendering (Backend)
**File**: `src/lib/avatarRenderer.ts`

```typescript
export async function renderAvatarWithLipSync(
  audioBuffer: Buffer,
  emotion: string
): Promise<VideoStream> {
  // 1. Extract phonemes/visemes from audio
  const visemes = await extractVisemes(audioBuffer);
  
  // 2. Generate mouth shapes
  const mouthShapes = generateMouthShapes(visemes);
  
  // 3. Render avatar frame by frame
  // 4. Composite with audio
  // 5. Return streaming video
}
```

---

## AVATAR CUSTOMIZATION SYSTEM

### Avatar Persona Model

```typescript
interface AvatarPersona {
  id: string;
  type: 'system' | 'company'; // System = default, Company = custom
  
  // Identity
  name: string;
  role: string; // e.g., "Senior Hiring Manager"
  companyName?: string;
  
  // Appearance (for video generation)
  appearance: {
    ethnicity?: string; // Optional: influences appearance
    gender?: 'male' | 'female' | 'neutral';
    ageRange?: 'young' | 'mid' | 'senior';
    style?: 'casual' | 'professional' | 'formal';
  };
  
  // Behavior
  behavior: {
    pace: 'slow' | 'normal' | 'fast'; // Speech rate
    formality: 'casual' | 'professional';
    encouragement: 'supportive' | 'neutral' | 'challenging';
    gestures: boolean; // Show hand movements
    eyeContact: boolean; // Look directly at camera
  };
  
  // Instructions (for Gemini)
  instructions: {
    systemPrompt: string; // How avatar should behave
    evaluationCriteria: string[]; // What to assess
    followUpStrategy: string; // How to probe deeper
  };
  
  // Interview Config
  interviewConfig: {
    duration: number; // minutes
    questionCount: number;
    allowFollowUps: boolean;
    scoringEnabled: boolean;
  };
}
```

### System Avatar (Default)

```
Name: Alex Chen
Role: Senior Hiring Manager
Behavior: Professional + Encouraging
Instructions:
  "You are an expert interviewer. Ask behavioral questions. 
   Listen carefully. Ask follow-ups to understand depth.
   Be encouraging but objective. Assess for: 
   - Problem solving ability
   - Communication clarity
   - Technical depth
   - Culture fit"
```

### Company Avatar (Custom)

```
Name: Sarah (Company-Specific)
Role: Hiring Manager, TechCorp
Company: TechCorp
Behavior: Professional + Supportive
Instructions:
  "You represent TechCorp. We value innovation, teamwork, 
   and customer obsession. Assess candidates on these values.
   Ask 2 technical, 2 behavioral, 1 culture-fit questions.
   Score on: Technical (40%), Communication (30%), 
   Values (30%)."
```

---

## IMPLEMENTATION ROADMAP (DETAILED)

### WEEK 1: Avatar Video Infrastructure

**Day 1-2: Local Avatar Rendering**
```
Goal: Create simple avatar that can be rendered locally
Approach:
1. Use Three.js to render 3D avatar head
2. Or use Canvas to draw 2D animated avatar
3. Lip-sync mouth shapes to pre-recorded audio
4. Test with 10-second sample video

Deliverable:
- src/components/LocalAvatar.tsx
- Avatar looks like professional person
- Lip-sync is synchronized (< 100ms lag)
- Runs at 30fps on desktop + mobile
```

**Day 3: Real-Time Audio Synthesis**
```
Goal: Convert Gemini text to speech in real-time
Approach:
1. Use Google Cloud Text-to-Speech API
2. Stream audio back to frontend
3. Simultaneously start avatar animation
4. Sync audio + video (important!)

Deliverable:
- src/lib/textToSpeech.ts
- Audio generated < 500ms
- Streaming works (no waiting for full response)
- Quality: Natural-sounding voice
```

**Day 4-5: WebSocket Real-Time Communication**
```
Goal: User speaks → Gemini responds → Avatar speaks (real-time)
Approach:
1. Setup Socket.io for bidirectional communication
2. Client sends user transcript in real-time
3. Server processes with Gemini
4. Server streams back avatar response

Deliverable:
- src/api/socketHandlers.ts
- WebSocket server running
- End-to-end latency < 2 seconds
- Handles network reconnection
```

### WEEK 2: Avatar Conversation Intelligence

**Day 1-2: Gemini 3.5 Pro Integration (Deep)**
```
Goal: Avatar has natural, probing conversation
Approach:
1. Build conversation memory system
2. Gemini tracks what was said
3. Avatar asks follow-up questions
4. Avatar detects if answer is weak → probe more

Deliverable:
- src/lib/conversationManager.ts
- Avatar asks 5-10 questions minimum
- Each follow-up based on user response
- Conversation feels natural (not scripted)
- Takes < 1 minute total
```

**Day 3-4: Emotion & Expression Sync**
```
Goal: Avatar expresses emotions matching context
Approach:
1. Gemini outputs emotion tags: 
   "EMOTION: encouraging" or "EMOTION: thinking"
2. Avatar changes expression
3. Avatar can nod, smile, furrow brow
4. Expressions sync with avatar speech

Deliverable:
- src/lib/emotionRenderer.ts
- 5 expressions: neutral, encouraging, thinking, concerned, positive
- Each has 3-5 animation frames
- Smooth transitions (300ms)
- Emotion is contextually appropriate
```

**Day 5: Real-Time Proctoring**
```
Goal: Monitor interview legitimacy
Approach:
1. Detect if user is looking at camera (gaze tracking)
2. Detect if multiple people in frame
3. Detect if user leaves frame
4. Detect if browser window loses focus
5. Flag suspicious behavior (low confidence score)

Deliverable:
- src/lib/proctoring.ts
- Gaze tracking accuracy: 85%+
- Multiple face detection works
- Flags saved to database
- No blocking (just monitoring for now)
```

### WEEK 3: Company Customization & Dashboard

**Day 1-2: Avatar Creator UI**
```
Goal: Companies can upload their own avatar
Approach:
1. Company upload video/photo
2. AI generates avatar from it
3. Company sets persona instructions
4. Company selects interview questions
5. Saves as custom avatar

Deliverable:
- pages/company/avatar/create.tsx
- Upload video/photo works
- Avatar customization form complete
- Can save and preview
- Integration with HeyGen (if paid) or local rendering
```

**Day 3-4: Company Dashboard**
```
Goal: Companies can see candidate results
Approach:
1. Companies see list of candidates
2. Can click each for detailed report:
   - Video of interview
   - Scores on each criterion
   - Recommendation (pass/fail)
   - Transcript of conversation
3. Can compare candidates side-by-side

Deliverable:
- pages/company/dashboard.tsx
- Real-time updates as candidates interview
- Export reports as PDF
- Email invites to candidates
```

**Day 5: Candidate Matching**
```
Goal: Route candidates to correct avatar
Approach:
1. Candidate selects job role
2. System matches to company avatar
3. Candidate practices with that avatar
4. Results sent to company automatically

Deliverable:
- Company routing logic
- Automatic email to company with results
- Candidate can practice multiple times
- Progress tracking
```

### WEEK 4: Polish & Production

**Day 1-2: Performance Optimization**
```
Goal: Make avatar as fast as possible
Approach:
1. Optimize video streaming (adaptive bitrate)
2. Reduce avatar rendering time
3. Cache Gemini prompts
4. Batch API calls
5. Compress video storage

Deliverable:
- Avatar response < 1 second
- Video streams smoothly on 4G
- Mobile works without lag
- Costs < $100/month for 100 users
```

**Day 3: Mobile Responsiveness**
```
Goal: Works perfectly on phone
Approach:
1. Single-column layout on mobile
2. Avatar video full-screen option
3. Touch-friendly controls
4. Optimize bandwidth

Deliverable:
- Mobile works on iOS + Android
- No performance degradation
- Looks professional
```

**Day 4-5: Testing + Deployment**
```
Goal: Production-ready
Approach:
1. Test end-to-end flow 10x
2. Load testing (10 concurrent interviews)
3. Security audit (no data leaks)
4. Deploy to production
5. Monitor and fix bugs

Deliverable:
- Zero console errors
- All features working
- Cost-effective
- Ready for demo
```

---

## KEY TECHNICAL DECISIONS

### 1. Avatar Video Generation: Options

| Option | Pros | Cons | Cost | Timeline |
|--------|------|------|------|----------|
| **HeyGen** | Realistic, fast, API | Expensive | $0.05/min | Immediate |
| **D-ID** | Good quality, cheaper | Slower | $0.01/min | Immediate |
| **Custom 3D (Three.js)** | Free, full control | Looks less real | $0 | 2 weeks |
| **Pre-recorded + Mouth Sync** | Very cheap | Limited variety | $0 | 3 days |

**Recommendation for MVP**: Start with **Pre-recorded + Mouth Sync** (cheapest), then upgrade to **HeyGen** (best quality) for production.

### 2. Real-Time Communication: WebSocket vs REST

| Approach | Latency | Complexity | Cost |
|----------|---------|-----------|------|
| **WebSocket** | 50-200ms | High | $50/mo (server) |
| **REST + Polling** | 1-5 seconds | Low | $0 (Firebase) |
| **Firebase Realtime** | 200-500ms | Medium | $0 (free tier) |

**Recommendation**: Use **Firebase Realtime Database** for MVP (free), upgrade to **WebSocket** for production (sub-second latency).

### 3. Audio Synthesis: Google vs Third-Party

| Provider | Latency | Quality | Cost |
|----------|---------|---------|------|
| **Google Cloud TTS** | 200-500ms | Excellent | $16/1M chars |
| **ElevenLabs** | 100-300ms | Excellent+ | Expensive |
| **AWS Polly** | 300-600ms | Good | $4/1M chars |
| **Local (piper)** | < 50ms | Fair | $0 |

**Recommendation**: Use **Google Cloud TTS** (good balance) or **local piper** (free but lower quality).

---

## COST ANALYSIS (First Year)

### Development Cost
```
Hosting (Vercel):              $0 (free tier) → $20/mo (scale)
Firebase:                      $0 (free tier) → $100/mo (scale)
Gemini API (text):             $0.05/1K tokens
Gemini API (multimodal):       $0.10/image
Google Cloud TTS:              $16/1M chars (~$50/mo)
Video Processing (ffmpeg):     $0 (open source)
Domain:                        $12/year
SSL Certificate:               $0 (Vercel)

TOTAL/MONTH: $50-150
TOTAL/YEAR:  $600-1800
```

### If Using Paid Services (HeyGen)
```
HeyGen Avatar API:             $0.05/minute → $150/mo (3000 min)
Google Cloud TTS:              $50/mo
Hosting:                       $50/mo
Firebase (scaled):             $100/mo

TOTAL/MONTH: $350
TOTAL/YEAR:  $4,200
```

**Action**: Start with free/cheap services, scale as needed.

---

## METRICS TO TRACK

### User Metrics
```
- Interviews started
- Interviews completed
- Average interview duration
- Completion rate
- User retention (weekly/monthly)
- NPS (Net Promoter Score)
```

### Avatar Quality Metrics
```
- Avatar response time (target: < 1 second)
- Lip-sync accuracy (target: > 95%)
- Audio quality (target: MOS > 4.0)
- User satisfaction with avatar (target: > 4/5)
- Emotion detection accuracy (target: > 85%)
```

### Business Metrics
```
- Cost per interview ($0.10 - $0.50)
- Revenue per user
- Monthly Recurring Revenue (MRR)
- Gross margin
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
```

---

## SUCCESS CRITERIA (For Google for Startups)

✅ **For Judges to See:**
1. **Working MVP**: User can do full interview with avatar
2. **Real-time Avatar**: Avatar speaks and responds in < 2 seconds
3. **Gemini Integration**: Uses latest Gemini model for intelligence
4. **Production Quality**: Looks professional, no bugs
5. **Scalable Architecture**: Can handle 1000+ concurrent users
6. **Unique UX**: Avatar feels real (not obviously AI)
7. **Business Model**: Clear path to revenue ($50K+ first year)
8. **Demo Video**: Shows problem → solution → impact (2 min)

---

## CONVERSION STRATEGY (Existing App → Avatar)

### Current Half-App Flow
```
1. User logs in ✅
2. Selects role + difficulty ✅
3. Sees question ✅
4. Records video + audio ✅
5. Submits answer ✅
6. Gets Gemini feedback ✅
7. Sees results dashboard ✅
```

### New Avatar Flow
```
1. User logs in ✅ (SAME)
2. Selects role + difficulty ✅ (SAME)
3. CHOICE: "Practice Mode" vs "Interview Mode"
   - Practice Mode = Your current app ✅
   - Interview Mode = NEW Avatar
4. Interview Mode:
   - Avatar appears on screen
   - Avatar asks first question
   - User answers on camera
   - Avatar listens + responds
   - Conversation continues for 5-10 questions
   - Results show avatar reactions overlaid on video
5. Can switch back to Practice Mode anytime
```

### Implementation (No Breaking Changes)
```typescript
// pages/interview-setup.tsx - ADD CHOICE

export default function InterviewSetup() {
  const [mode, setMode] = useState<'practice' | 'avatar'>('practice');
  
  return (
    <>
      <RadioGroup value={mode} onChange={setMode}>
        <Radio value="practice">
          Practice Mode (Get instant feedback)
        </Radio>
        <Radio value="avatar">
          Interview Mode (Talk with AI avatar) ← NEW
        </Radio>
      </RadioGroup>
      
      {mode === 'practice' && <PracticeFlow />}  {/* Existing */}
      {mode === 'avatar' && <AvatarInterviewFlow />}  {/* NEW */}
    </>
  );
}
```

### No Rework Needed For:
- ✅ Authentication
- ✅ Question database
- ✅ Basic video recording
- ✅ Results dashboard
- ✅ User profiles
- ✅ Firebase setup

### Only Add New:
- 🆕 Avatar rendering component
- 🆕 WebSocket real-time communication
- 🆕 Gemini deep conversation API
- 🆕 Audio synthesis pipeline
- 🆕 Lip-sync rendering
- 🆕 Company avatar customization

---

## GOOGLE FOR STARTUPS SUBMISSION

### What to Submit

1. **GitHub Repo** (public)
   - Clean code
   - Good README
   - Setup instructions
   - Demo branch

2. **Live Demo** (Vercel URL)
   - Fully working
   - Can sign up and interview
   - Avatar responds in real-time

3. **Demo Video** (2-3 minutes)
   - Problem: Job interview anxiety
   - Solution: AI avatar coach
   - Proof: Show avatar working
   - Impact: Before/after metrics

4. **Pitch Deck** (5-10 slides)
   - Team
   - Problem
   - Solution
   - Market
   - Business model
   - Traction
   - Ask

5. **Application Form**
   - Company name: InterviewMaster
   - 1-liner: "AI avatar interview coach powered by Gemini"
   - Why Google for Startups: "Uses Gemini + Cloud APIs"
   - Technical complexity: "Real-time video streaming + AI"

---

## NEXT IMMEDIATE STEPS (This Week)

### Day 1: Architecture Review
```
- [ ] Understand your current codebase
- [ ] Map what exists vs what's needed
- [ ] Plan integration points for avatar
- [ ] Decide on avatar generation approach (HeyGen vs local)
```

### Day 2: Avatar POC (Proof of Concept)
```
- [ ] Build simple avatar that renders
- [ ] Connect to Gemini API
- [ ] Test response latency
- [ ] Record proof video
```

### Day 3-5: WebSocket + Real-Time
```
- [ ] Setup WebSocket server
- [ ] Client can send transcript
- [ ] Server responds with avatar video
- [ ] End-to-end test with sample questions
```

### Week 2-4: Full Implementation
```
Follow the phase roadmap above
```

---

## CRITICAL SUCCESS FACTORS

1. **Avatar Realism** - Must not look obviously AI
2. **Low Latency** - Response must be < 2 seconds
3. **Conversation Quality** - Probing follow-ups are key
4. **Lip-Sync** - Must be perfectly synced (or it fails)
5. **Mobile Support** - 60% of users on mobile
6. **Cost Efficiency** - Must stay under free tier limits
7. **Production Quality** - No crashes, smooth performance

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Avatar video too slow | High | Critical | Start with local rendering, upgrade later |
| Gemini API quota hit | Medium | High | Cache responses, batch requests |
| WebSocket latency | Medium | High | Use Firebase Realtime as fallback |
| Audio synthesis cost | Medium | Medium | Use free TTS initially, upgrade if revenue comes |
| Lip-sync quality bad | Low | High | Start simple (mouth animation), improve later |
| Firebase free tier limit | Low | High | Monitor daily, upgrade if needed |

---

## QUESTIONS TO ANSWER BEFORE BUILDING

1. **Avatar Appearance**: Who should avatar look like?
   - Real person (hire actor/use stock photo)
   - 3D avatar (synthesized)
   - Cartoon (stylized)
   → **Recommendation**: Real person (most credible)

2. **Interview Length**: How long should interview be?
   - 5 minutes (quick)
   - 15 minutes (realistic)
   - 30 minutes (deep)
   → **Recommendation**: 10-15 minutes (balances depth + UX)

3. **Multiple Avatars**: Should there be multiple avatars?
   - 1 universal avatar (simple)
   - Multiple (one per role)
   - Customizable by company (advanced)
   → **Recommendation**: Start with 1, add multiple in phase 2

4. **Persona Customization**: Can companies customize?
   - Yes (full feature)
   - No (later)
   → **Recommendation**: Yes (key differentiator)

5. **Real-Time or Batch?**
   - Real-time conversation (hard, < 2s)
   - Batch feedback (easy, 10s)
   → **Recommendation**: Real-time (better UX)

---

## APPENDIX: TECHNICAL RESOURCES

### Libraries to Use
```
Frontend:
- Next.js 14+ (already using)
- React 18+ (already using)
- Socket.io (for WebSocket)
- Three.js (for 3D avatar if local rendering)
- TailwindCSS (already using)

Backend:
- Node.js + Express
- Socket.io-server
- Firebase Admin SDK
- Gemini SDK (@google/generative-ai)
- ffmpeg (video processing)

DevOps:
- Vercel (hosting)
- Firebase (backend)
- GitHub Actions (CI/CD)
```

### Recommended Free Tier Services
```
HeyGen:    50 free minutes/month
D-ID:      Free tier available
Google TTS: $16/1M chars (affordable)
Vercel:    Unlimited free (hosting)
Firebase:  50K reads/day (plenty)
```

### Learning Resources
```
- Gemini API docs: https://ai.google.dev
- Socket.io guide: https://socket.io/docs
- Three.js fundamentals: https://threejsfundamentals.org
- WebRTC guide: https://webrtc.org/getting-started
```

---

## CONCLUSION

You have a solid half-built application. With 4 weeks of focused work, you can add **real-time avatar conversation** and create a **compelling Google for Startups + Imagine Cup submission**.

The key is:
1. Reuse existing infrastructure (auth, questions, video recording)
2. Add avatar layer on top (don't rebuild)
3. Use Gemini 3.5 Pro for intelligence
4. Focus on **low latency** (< 2 seconds response)
5. Make avatar look real (biggest UX impact)

**Go build it.** 🚀

---

**Document Version**: 2.0  
**Last Updated**: December 2025  
**Status**: Ready for implementation  
**Next Review**: After Week 1 (Avatar POC)
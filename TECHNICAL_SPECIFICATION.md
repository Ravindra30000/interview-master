# InterviewMaster - Technical Specification

## Architecture Overview

InterviewMaster is built as a full-stack Next.js application deployed on Google Cloud Run, leveraging Firebase for backend services and Google Gemini for AI-powered analysis.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Next.js    │  │   React      │  │   WebRTC     │    │
│  │   Frontend   │  │   Components │  │   Recording  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Cloud Run (Next.js API)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   API Routes │  │   Gemini API │  │   Cloud TTS  │    │
│  │   /api/*     │  │   Client     │  │   Client     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Firebase    │  │  Firebase    │  │  Firebase    │
│  Firestore   │  │  Storage     │  │  Realtime DB │
└──────────────┘  └──────────────┘  └──────────────┘
```

## System Components

### Frontend (Next.js 14)

**Framework**: Next.js 14 with App Router

- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React hooks, Firebase Realtime Database (for Avatar mode)

**Key Pages**:

- `/` - Home page with features and stats
- `/practice` - Practice setup (role/difficulty selection)
- `/practice/session` - Classic practice mode
- `/practice/avatar` - Avatar interview mode
- `/dashboard` - User dashboard with analytics
- `/results/[id]` - Detailed interview results
- `/profile` - User profile and preferences

### Backend (Next.js API Routes)

**API Endpoints**:

1. **`/api/interviews/[id]/analyze`** (POST)

   - Analyzes interview video and transcript
   - Uses Gemini 2.5 Flash/Pro for multimodal analysis
   - Returns detailed metrics and feedback
   - Handles video sampling for cost optimization

2. **`/api/avatar/respond`** (POST)

   - Generates AI response using Gemini 2.5 Flash
   - Synthesizes speech using Google Cloud TTS
   - Returns response text and audio data URL
   - Updates Firebase Realtime Database state

3. **`/api/tts`** (POST)
   - Text-to-speech synthesis
   - Uses Google Cloud TTS API
   - Returns base64 audio data URL

### Database Schema

#### Firestore Collections

**`users/{userId}/interviews/{interviewId}`**

```typescript
{
  id: string;
  userId: string;
  role: string;
  difficulty: string;
  question: string;
  transcript: string;
  videoUrl?: string;
  createdAt: Timestamp;
  localMetrics?: {
    confidence: number;
    clarity: number;
    fillerWords: number;
    structure: number;
    length: number;
  };
  analysis?: {
    score: number;
    feedback: string;
    improvements: string[];
    analyzedAt: Timestamp;
  };
  multimodalAnalysis?: {
    overall_score: number;
    emotions: { score, notes, suggestions };
    confidence: { score, notes, suggestions };
    body_language: { score, notes, suggestions };
    delivery: { score, notes, suggestions };
    voice: { score, notes, suggestions };
    timing: { score, notes, suggestions };
    lip_sync: { score, notes, suggestions };
    eye_contact?: { score, percentage_at_camera, frequency_looking_away, notes, suggestions };
    body_language_patterns?: { gesture_frequency, posture_consistency, movement_level, notes, suggestions };
    professional_presentation?: { score, environment_quality, appearance, notes, suggestions };
    top_improvements: string[];
  };
  questions?: Array<{
    question: string;
    transcript: string;
    videoUrl?: string;
  }>;
}
```

**`questions`**

```typescript
{
  id: string;
  role: string;
  difficulty: string;
  category: string;
  question: string;
  answerFramework?: string;
  createdAt: Timestamp;
}
```

#### Firebase Realtime Database

**`avatarSessions/{sessionId}`**

```typescript
{
  status: "idle" | "listening" | "speaking" | "processing";
  currentQuestion?: string;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
  lastUpdated: number;
}
```

### AI/ML Models

#### Google Gemini 2.5 Flash

- **Primary Use**: Avatar conversation, quick analysis
- **Features**: Multimodal understanding, natural conversation
- **Cost Optimization**: Video sampling, reduced retries

#### Google Gemini 2.5 Pro / 1.5 Pro

- **Primary Use**: Detailed multimodal analysis
- **Features**: Advanced video analysis, comprehensive feedback
- **Fallback**: Used when Flash analysis is insufficient

#### Google Cloud Text-to-Speech

- **Voice**: en-US-Neural2-D (Male)
- **Format**: MP3, base64 encoded
- **Use Case**: Avatar interview mode speech synthesis

### Integration Details

#### Firebase Services

1. **Firestore**

   - User data storage
   - Interview records
   - Question database
   - User preferences

2. **Firebase Storage**

   - Video recordings
   - Avatar video assets
   - Compressed video files

3. **Firebase Auth**

   - User authentication
   - Email/password login
   - Session management

4. **Firebase Realtime Database**
   - Avatar session state
   - Real-time conversation sync
   - Status updates

#### Google Cloud Services

1. **Cloud Run**

   - Containerized Next.js application
   - Auto-scaling
   - HTTPS endpoints
   - Environment variable management

2. **Cloud Build**

   - Docker image building
   - CI/CD pipeline
   - Automated deployments

3. **Cloud TTS**
   - Speech synthesis
   - Service account authentication
   - Multiple voice options

## Performance Metrics

### API Response Times

- **Gemini Analysis**: 2-5 seconds (depending on video length)
- **TTS Generation**: < 500ms
- **Avatar Response**: 1-2 seconds
- **Database Queries**: < 100ms

### Cost Optimization Strategies

1. **Video Sampling**: Analyze 2 videos max per interview
2. **Retry Reduction**: Max 2 retries for API calls
3. **Client-Side Merging**: Merge analysis results on client
4. **Model Prioritization**: Use Flash for most operations, Pro for detailed analysis

### Scalability Design

1. **Horizontal Scaling**: Cloud Run auto-scales based on traffic
2. **Database**: Firestore scales automatically
3. **Storage**: Firebase Storage handles large files efficiently
4. **CDN**: Static assets served via Next.js CDN
5. **Caching**: Client-side caching for questions and user data

## Security Considerations

1. **Authentication**: Firebase Auth for user management
2. **API Keys**: Environment variables, never committed
3. **Data Privacy**: User data isolated by userId
4. **Video Storage**: Private Firebase Storage buckets
5. **HTTPS**: All communications encrypted
6. **Input Validation**: Server-side validation for all inputs
7. **Rate Limiting**: Cloud Run rate limits applied

## Development Workflow

1. **Local Development**

   ```bash
   npm install
   npm run dev
   ```

2. **Build**

   ```bash
   npm run build
   ```

3. **Deployment**

   ```bash
   ./deploy-cloud-run.sh
   ```

4. **Environment Variables**: See `.env.example`

## API Reference

### POST `/api/interviews/[id]/analyze`

Analyzes interview video and transcript.

**Request Body**:

```json
{
  "videoUrls": ["https://..."],
  "transcript": "User's answer transcript"
}
```

**Response**:

```json
{
  "success": true,
  "analysis": {
    "overall_score": 8.5,
    "confidence": { "score": 9, "notes": "...", "suggestions": [...] },
    ...
  }
}
```

### POST `/api/avatar/respond`

Generates avatar response.

**Request Body**:

```json
{
  "message": "User's message",
  "sessionId": "session-id",
  "conversationHistory": [...]
}
```

**Response**:

```json
{
  "response": "AI response text",
  "audioDataUrl": "data:audio/mp3;base64,...",
  "emotion": "neutral"
}
```

## Database Indexes

**Firestore Indexes Required**:

- `users/{userId}/interviews`: `createdAt` (descending)
- `questions`: `role`, `difficulty` (composite)

## Monitoring and Logging

- **Cloud Run Logs**: Application logs via console.log
- **Firebase Console**: Database and storage monitoring
- **Error Tracking**: Client-side error boundaries
- **Performance**: Cloud Run metrics dashboard

## Future Technical Improvements

See [FUTURE_SCOPE.md](FUTURE_SCOPE.md) for planned technical enhancements.

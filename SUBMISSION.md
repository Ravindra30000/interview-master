# Hackathon Submission: InterviewMaster

## Project Overview
InterviewMaster is an AI-powered interview coaching platform that uses Google Gemini 3 Pro to provide comprehensive feedback on interview performance, including both content analysis and multimodal video analysis.

## How We Use Gemini 3 Pro

### 1. Transcript Analysis
- Analyzes interview answers for quality, structure, and clarity
- Provides scoring (0-10) and actionable feedback
- Suggests specific improvements based on content

### 2. Multimodal Video Analysis
Using Gemini 3 Pro's multimodal capabilities, we analyze:
- **Speaking Style:** Pace, pauses, filler words, articulation
- **Voice Clarity:** Volume, tone, pronunciation
- **Confidence:** Posture, gaze, body language
- **Timing:** Response length, pacing
- **Body Language:** Professional presence and engagement

### 3. Comprehensive Feedback
- Overall score combining content and delivery
- Sub-scores for each aspect (delivery, voice, confidence, timing, body language)
- Top 3 improvement suggestions
- Detailed notes for each category

## Key Features
- ✅ **595+ Interview Questions** across 10 roles and 3 difficulty levels
- ✅ **Real-time Video Recording** with quality options (Low/Medium/High)
- ✅ **AI-Powered Analysis** using Gemini 3 Pro (with fallback to Gemini 2.5 Flash)
- ✅ **Progress Tracking** with charts and analytics dashboard
- ✅ **Export Results** as PDF or CSV
- ✅ **User Preferences** for video quality, favorite roles, and difficulty
- ✅ **Transcript Editing** before submission
- ✅ **Multimodal Analysis** with detailed sub-scores and suggestions

## Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Firebase Firestore
- **Storage:** Firebase Cloud Storage
- **Authentication:** Firebase Auth
- **AI:** Google Gemini 3 Pro API (with fallback to Gemini 2.5 Flash)
- **Deployment:** Vercel / Google Cloud Run

## Gemini 3 Pro Integration Details

### Model Usage
- **Primary Model:** `gemini-3-pro` for all analysis tasks
- **Fallback:** `gemini-2.5-flash` if Gemini 3 Pro is unavailable
- **Automatic Fallback:** Code detects model availability and switches automatically

### Analysis Flow
1. User records video answer to interview question
2. Video is uploaded to Firebase Storage
3. Transcript is generated using Web Speech API
4. Transcript and video URLs are sent to Gemini 3 Pro API
5. Gemini analyzes both content (transcript) and delivery (video)
6. Returns comprehensive feedback with scores and suggestions

### API Endpoints
- `/api/interviews/[id]/analyze` - Main analysis endpoint using Gemini 3 Pro

## Demo
[Your demo video link - 2-5 minutes showing key features]

## Deployment
[Your deployed URL]

## GitHub Repository
[Your GitHub URL]

## Screenshots
[Add screenshots of key features]

## Future Enhancements
- Real-time multimodal analysis during recording
- Advanced body language detection
- Comparison with previous sessions
- AI-powered question recommendations
- Integration with job boards

---

**Built for Google DeepMind - Vibe Code with Gemini 3 Pro in AI Studio Hackathon**


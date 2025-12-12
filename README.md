# InterviewMaster - AI-Powered Interview Coaching Platform

**Built for Google DeepMind - Vibe Code with Gemini 3 Pro in AI Studio Hackathon**

An AI-powered interview practice platform that helps job seekers improve their interview skills using Google Gemini 3 Pro for real-time feedback and multimodal video analysis.

## 🎯 Features

- **595+ Interview Questions** - Organized by 10 roles, 3 difficulty levels
- **AI-Powered Feedback** - Gemini 3 Pro analyzes transcripts and video
- **Multimodal Analysis** - Video-based analysis of speaking style, confidence, body language
- **Real-time Recording** - Practice with video and audio recording
- **Speech-to-Text** - Automatic transcription of your answers
- **Progress Tracking** - Dashboard with charts and analytics
- **Video Playback** - Review your practice sessions
- **Export Results** - Download results as PDF or CSV
- **User Preferences** - Customize video quality, favorite roles, difficulty

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Firebase Firestore
- **Storage:** Firebase Cloud Storage
- **Authentication:** Firebase Auth
- **AI:** Google Gemini 3 Pro API (with fallback to Gemini 2.5 Flash)
- **Deployment:** Vercel / Google Cloud Run

## 🚀 How Gemini 3 Pro is Used

### 1. Transcript Analysis
- Analyzes interview answers for content quality, structure, and clarity
- Provides scoring (0-10) and actionable feedback
- Suggests specific improvements

### 2. Multimodal Video Analysis (Gemini 3 Pro)
- **Speaking Style:** Pace, pauses, filler words, articulation
- **Voice Clarity:** Volume, tone, pronunciation
- **Confidence:** Posture, gaze, body language
- **Timing:** Response length, pacing
- **Body Language:** Professional presence

### 3. Comprehensive Feedback
- Overall score combining content and delivery
- Sub-scores for each aspect (delivery, voice, confidence, timing, body language)
- Top 3 improvement suggestions
- Detailed notes for each category

## 📋 Prerequisites

- Node.js 18+ and npm
- Google account (for Firebase and Gemini API)
- Webcam and microphone (for testing)
- Gemini 3 Pro API access (or Gemini 2.5 Flash as fallback)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd interview-master
npm install
```

### 2. Configure Environment Variables

1. **Setup Firebase:**
   - Create project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore, Authentication, and Storage
   - Get config values from Project Settings

2. **Setup Gemini API:**
   - Get API key from [Google AI Studio](https://ai.google.com/aistudio)

3. **Create `.env.local`** (copy from `.env.example`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

**📖 See [CONFIGURATION_STEPS.md](./CONFIGURATION_STEPS.md) for detailed setup instructions**

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
interview-master/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   └── interviews/    # Interview analysis endpoints
│   │   ├── practice/           # Interview practice pages
│   │   ├── results/            # Results pages
│   │   ├── dashboard/          # Dashboard
│   │   └── profile/            # User profile/settings
│   ├── components/             # React components
│   ├── lib/                    # Utilities & services
│   └── types/                  # TypeScript types
├── public/
│   └── questions.json          # Interview questions database
└── .env.local                  # Environment variables (not committed)
```

## 🏆 Hackathon Submission

This project was built for the **Google DeepMind - Vibe Code with Gemini 3 Pro in AI Studio** hackathon.

**Live Demo:** [Your deployed URL]  
**GitHub Repository:** [Your GitHub URL]  
**Demo Video:** [Your video link]

### Key Highlights
- ✅ Full multimodal video analysis using Gemini 3 Pro
- ✅ 595+ interview questions across 10 roles
- ✅ Comprehensive feedback system with sub-scores
- ✅ Progress tracking with analytics dashboard
- ✅ Export functionality (PDF/CSV)
- ✅ User preferences and customization

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Firebase security rules will be configured for production
- API keys are client-side (use server-side for production)

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Initial setup instructions
- [Configuration Steps](./CONFIGURATION_STEPS.md) - Detailed Firebase & Gemini setup
- [Technical Spec](./technical-spec.md) - Complete technical documentation
- [UI/UX Design](./ui-ux-design.md) - Design system and components
- [Workflow Guide](./cursor-google-workflow.md) - Building instructions

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Google Cloud Run

See deployment documentation for Docker setup.

## 📊 Free Tier Limits

- **Gemini API:** 50 requests/day
- **Firestore:** 50K reads/day, 20K writes/day
- **Storage:** 1GB
- **Vercel:** 100GB bandwidth/month

## 🤝 Contributing

This is a competition project. Contributions welcome after submission!

## 📝 License

MIT

## 👤 Author

[Your Name]

---

**Built with ❤️ using Next.js, Firebase, and Google Gemini 3 Pro**





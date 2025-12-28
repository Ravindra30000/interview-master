# InterviewMaster

AI-powered interview preparation platform that leverages Google Gemini's multimodal capabilities to provide comprehensive, real-time feedback on interview performance.

## Features

- 🎥 **Real-time Video Recording** - High-quality video capture with automatic compression
- 🎤 **Speech-to-Text Transcription** - Automatic conversion using Web Speech API
- 🤖 **Multimodal AI Analysis** - Simultaneous video and transcript evaluation using Gemini 2.5 Flash/Pro
- 📊 **Comprehensive Feedback** - Detailed scores, suggestions, and actionable improvements
- 📈 **Progress Tracking** - Dashboard with analytics, score trends, and performance metrics
- 📚 **Comprehensive Question Bank** - 4,000+ questions across 73 roles and 12+ career domains
- 👤 **Avatar Interview Mode** - Practice with AI interview coach using pre-recorded avatar videos
- 🎯 **Domain Coverage** - Engineering, Business, Data & Analytics, Design, Finance, Marketing & Sales, Cybersecurity, Healthcare, and more
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Lucide React
- **Backend:** Next.js API Routes, Google Gemini 2.5 Flash/Pro, Google Cloud Text-to-Speech
- **Database:** Firebase Firestore, Firebase Realtime Database
- **Storage:** Firebase Storage
- **Authentication:** Firebase Auth
- **Deployment:** Google Cloud Run (Docker)
- **AI/ML:** Google Gemini API (multimodal analysis), Google Cloud TTS

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Firebase project with Firestore, Storage, and Authentication enabled
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Ravindra30000/interview-master.git
cd interview-master
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file (see `.env.example` for template):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Realtime Database (for Avatar mode)
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/

# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Google Cloud TTS (for Avatar mode - optional for local dev)
# Set GOOGLE_APPLICATION_CREDENTIALS to service account JSON path
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Google Cloud Run

1. Build the Docker image:

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_FIREBASE_API_KEY="...",_FIREBASE_AUTH_DOMAIN="...",...
```

2. Deploy to Cloud Run:

```bash
gcloud run deploy interview-master \
  --image gcr.io/PROJECT_ID/interview-master:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Project Structure

```
interview-master/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes (analyze, avatar, tts)
│   │   ├── practice/            # Practice session pages
│   │   │   ├── avatar/         # Avatar interview mode
│   │   │   └── session/        # Classic practice mode
│   │   ├── dashboard/           # User dashboard
│   │   ├── results/             # Interview results pages
│   │   └── ...
│   ├── components/              # React components
│   ├── lib/                     # Utility functions and API clients
│   │   ├── gemini.ts            # Gemini API integration
│   │   ├── interviews.ts        # Firestore operations
│   │   ├── avatarConversation.ts # Avatar conversation logic
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # TypeScript type definitions
├── public/                      # Static assets
│   ├── comprehensive-questions.json  # Question database
│   └── questions.json           # Legacy questions
├── scripts/                      # Utility scripts
│   ├── generate-comprehensive-questions.js
│   └── ...
├── docs/                        # Documentation (see docs/README.md)
├── Dockerfile                   # Docker configuration
├── cloudbuild.yaml              # Google Cloud Build config
└── package.json                 # Dependencies
```

## Key Features in Detail

### Dual Interview Modes

1. **Classic Practice Mode**

   - Record video responses to interview questions
   - Automatic transcription
   - AI-powered analysis with detailed feedback
   - Multimodal analysis (video + transcript)

2. **Avatar Interview Mode**
   - Interactive AI interview coach
   - Pre-recorded avatar videos with lip-sync
   - Real-time conversation using Gemini 2.5 Flash
   - Natural voice synthesis with Google Cloud TTS

### Comprehensive Question Database

- **4,000+ questions** across multiple categories
- **73 roles** covering diverse career paths
- **12+ domains**: Engineering, Business, Data & Analytics, Design, Finance, Marketing & Sales, Cybersecurity, Healthcare & Biotech, Operations & Supply Chain, Consulting, Human Resources, Education & Training
- **Difficulty levels**: Junior, Mid, Senior
- **Question types**: Behavioral, Technical, System Design

### Advanced Analytics

- **Multimodal Analysis**: Analyzes both video and transcript simultaneously
- **Detailed Metrics**: Confidence, eye contact, body language, emotions, professional presentation
- **Score Breakdown**: Overall score with category-specific feedback
- **Progress Tracking**: Historical performance trends and analytics

## Documentation

- [Project Summary](PROJECT_SUMMARY.md) - Overview and key features
- [Technical Specification](TECHNICAL_SPECIFICATION.md) - Architecture and technical details
- [Deployment Guide](DEPLOYMENT_READY.md) - Quick deployment instructions
- [Submission Checklist](SUBMISSION_CHECKLIST.md) - Pre-submission checklist
- [Future Scope](FUTURE_SCOPE.md) - Planned features and roadmap

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

MIT

## Live Demo

[Try InterviewMaster](https://interview-master-921696971578.us-central1.run.app)

## Support

For issues, questions, or contributions, please open an issue on GitHub or contact the maintainers.

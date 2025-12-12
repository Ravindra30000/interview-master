# InterviewMaster

AI-powered interview preparation platform that leverages Google Gemini's multimodal capabilities to provide comprehensive, real-time feedback on interview performance.

## Features

- 🎥 **Real-time Video Recording** - High-quality video capture with adjustable bitrate
- 🎤 **Speech-to-Text Transcription** - Automatic conversion using Web Speech API
- 🤖 **Multimodal AI Analysis** - Simultaneous video and transcript evaluation using Gemini
- 📊 **Comprehensive Feedback** - Scores, suggestions, and detailed breakdowns
- 📈 **Progress Tracking** - Dashboard with analytics and score trends
- 📚 **Question Bank** - 595+ questions across 10 roles and multiple difficulty levels

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Google Gemini 2.5 Flash
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Authentication:** Firebase Auth
- **Deployment:** Google Cloud Run

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

3. Create `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
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
│   ├── app/              # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions and API clients
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── scripts/              # Utility scripts
├── Dockerfile            # Docker configuration
├── cloudbuild.yaml       # Google Cloud Build config
└── package.json          # Dependencies
```

## License

MIT

## Live Demo

[Try InterviewMaster](https://interview-master-921696971578.us-central1.run.app)

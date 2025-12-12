# InterviewMaster - UI/UX Design System & Component Guide
## Clean, Minimalist Design for Production

---

## Design Philosophy

**Keep it Simple, Keep it Professional**
- No flashy AI animations (feels fake)
- Minimal colors (blue + white + gray)
- Focus on content, not design
- Similar to: LinkedIn, Notion, Slack

**Color Palette:**
```
Primary: #0066FF (Professional Blue)
Secondary: #F5F5F5 (Soft Gray)
Accent: #00CC88 (Success Green)
Text Dark: #1A1A1A (Almost Black)
Text Light: #666666 (Gray)
Border: #E0E0E0 (Light Gray)
```

---

## Key Pages & Components

### 1. HOME PAGE
```
┌─────────────────────────────────────────┐
│  InterviewMaster                    [Login]
├─────────────────────────────────────────┤
│                                         │
│  Master Your Interview Skills           │
│  Practice with AI-Powered Feedback      │
│                                         │
│  [Get Started]    [View Results]        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  50K+ Questions  |  Real-time Coaching │
│  AI Feedback     |  Video Analysis      │
│                                         │
└─────────────────────────────────────────┘
```

**CSS (Tailwind):**
```css
/* Homepage hero */
.hero {
  @apply min-h-screen bg-gradient-to-br from-slate-50 to-white;
}

.hero-text {
  @apply text-4xl md:text-5xl font-bold text-gray-900 leading-tight;
}

.hero-subtext {
  @apply text-xl text-gray-600 mt-4;
}

.cta-button {
  @apply bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition;
}
```

---

### 2. INTERVIEW SETUP PAGE
```
┌──────────────────────────────────┐
│  Start New Interview             │
├──────────────────────────────────┤
│                                  │
│  1. Select Job Role              │
│  [Dropdown: Backend/Frontend...] │
│                                  │
│  2. Select Difficulty            │
│  [Radio: Junior / Mid / Senior]  │
│                                  │
│  3. Preferred Topic              │
│  [Tag selection]                 │
│                                  │
│  [Cancel]  [Start Practice]      │
│                                  │
└──────────────────────────────────┘
```

**Component Code:**
```typescript
// components/InterviewSetup.tsx
export default function InterviewSetup({ onStart }) {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('Mid');
  const [topics, setTopics] = useState<string[]>([]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Start New Interview</h1>

      {/* Role Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-3 text-gray-900">
          1. Job Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a role...</option>
          <option value="backend">Backend Engineer</option>
          <option value="frontend">Frontend Engineer</option>
          <option value="pm">Product Manager</option>
          <option value="design">Product Designer</option>
          <option value="data">Data Scientist</option>
        </select>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-3 text-gray-900">
          2. Difficulty Level
        </label>
        <div className="flex gap-3">
          {['Junior', 'Mid', 'Senior'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                difficulty === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={() => onStart({ role, difficulty, topics })}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
}
```

---

### 3. INTERVIEW PAGE (Main Experience)
```
┌─────────────────────────────────────────────┐
│ Interview: Backend Engineer - Q1/5          │
├─────────────────────────────────────────────┤
│                                             │
│ [Avatar]              [Your Video]          │
│                                             │
│ ┌─────────┐            ┌──────────┐        │
│ │  AI     │            │  You     │        │
│ │         │ "Tell me  │          │        │
│ │ Smiling │  about... │ Recording│        │
│ │         │            │          │        │
│ └─────────┘            └──────────┘        │
│                                             │
│ Answer Framework:                           │
│ Problem → Your Role → Solution              │
│                                             │
│ [0:00 / 2:00]                               │
│                                             │
│ [Stop Recording] [Next Question]            │
│                                             │
└─────────────────────────────────────────────┘
```

**Layout Code:**
```typescript
// pages/practice/[interviewId].tsx
export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">
            Backend Engineer - Question 1 of 5
          </h1>
          <button className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Avatar Column */}
          <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
            <AIAvatar />
          </div>

          {/* User Video Column */}
          <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center relative">
            <video
              id="userVideo"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              REC
            </div>
          </div>
        </div>

        {/* Answer Framework */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-2">ANSWER FRAMEWORK</p>
          <p className="text-gray-900 font-semibold">
            Problem → Your Role → Solution
          </p>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-600">
            0:00 / 2:00
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
              Stop Recording
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Next Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. RESULTS PAGE
```
┌──────────────────────────────────┐
│  Interview Results               │
├──────────────────────────────────┤
│                                  │
│  Backend Engineer Interview      │
│  Dec 9, 2025                     │
│                                  │
│  ┌────────────────┐              │
│  │ YOUR SCORE     │              │
│  │                │              │
│  │      7/10      │  +2 POINTS   │
│  │                │              │
│  └────────────────┘              │
│                                  │
│  Feedback:                       │
│  "Great structure and clear      │
│   explanations. Work on adding..." │
│                                  │
│  Areas to Improve:               │
│  1. Provide specific numbers     │
│  2. Reduce filler words          │
│  3. Add more detail to solution  │
│                                  │
│  [Watch Video] [Practice Again]  │
│                                  │
└──────────────────────────────────┘
```

**Results Component Code:**
```typescript
// components/ResultsCard.tsx
interface InterviewResult {
  score: number;
  feedback: string;
  improvements: string[];
  videoUrl: string;
}

export default function ResultsCard({ result }: { result: InterviewResult }) {
  const previousScore = 5; // Placeholder

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score Display */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              Your Score
            </p>
            <p className="text-6xl font-bold text-blue-600 mt-2">
              {result.score}
            </p>
            <p className="text-gray-600 text-sm mt-2">/10</p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              Improvement
            </p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              +{result.score - previousScore}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-gray-900">Feedback</h2>
        <p className="text-gray-700 leading-relaxed">{result.feedback}</p>
      </div>

      {/* Improvements */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Areas to Improve</h2>
        <div className="space-y-3">
          {result.improvements.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <p className="text-gray-700 pt-0.5">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Playback */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-gray-900">Watch Your Answer</h2>
        <video
          controls
          className="w-full rounded-lg bg-gray-900"
          src={result.videoUrl}
        />
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          Practice Again
        </button>
        <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50">
          View History
        </button>
      </div>
    </div>
  );
}
```

---

### 5. DASHBOARD PAGE
```
┌─────────────────────────────────────┐
│  Your Progress                      │
├─────────────────────────────────────┤
│                                     │
│  Interviews Completed: 12           │
│  Average Score: 7.2/10              │
│  Improvement: +2.1                  │
│                                     │
│  Recent Interviews:                 │
│  ┌─────────────────────────────┐    │
│  │ Backend Engineer │ 8/10 ✓   │    │
│  │ Dec 9, 2025                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Frontend Engineer │ 6/10 ⚠   │    │
│  │ Dec 8, 2025                 │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Dashboard Code:**
```typescript
// pages/dashboard.tsx
export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    fetchUserInterviews();
  }, []);

  const fetchUserInterviews = async () => {
    // Fetch from Firebase
    const data = await getUserInterviews();
    setInterviews(data);
  };

  const avgScore = interviews.length > 0
    ? (interviews.reduce((sum, i) => sum + i.analysis.score, 0) / interviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Progress</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Card 1: Interviews */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Interviews
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {interviews.length}
            </p>
          </div>

          {/* Card 2: Avg Score */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Avg Score
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{avgScore}</p>
          </div>

          {/* Card 3: Improvement */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Improvement
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">+2.1</p>
          </div>
        </div>

        {/* Recent Interviews */}
        <h2 className="text-xl font-bold mb-4">Recent Interviews</h2>
        <div className="space-y-3">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center hover:shadow-md transition cursor-pointer"
            >
              <div>
                <p className="font-semibold text-gray-900">{interview.role}</p>
                <p className="text-sm text-gray-600">
                  {new Date(interview.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-blue-600">
                  {interview.analysis.score}/10
                </p>
                <span className="text-lg">
                  {interview.analysis.score >= 7 ? '✓' : '⚠'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Responsive Design Rules

### Mobile (< 768px)
```
- Single column layout
- Full-width buttons
- Larger touch targets (48px min)
- Stack avatar + video vertically
```

### Tablet (768px - 1024px)
```
- Two column layout when possible
- Optimize spacing
- Readable text
```

### Desktop (> 1024px)
```
- Full two-column interview layout
- Sidebar dashboard
- Optimal spacing
```

---

## Animation Guidelines

**Keep animations minimal:**
- Avatar expression changes: 300ms ease
- Button hover: 150ms ease
- Modal fade-in: 200ms ease
- No unnecessary animations (feels cheap)

```css
/* Smooth transitions */
.transition-smooth {
  @apply transition-all duration-300 ease-out;
}

/* Avatar expression change */
@keyframes expressionChange {
  from { opacity: 0.9; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
```

---

## Accessibility Checklist

- [ ] Color contrast 4.5:1 for text
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Video has captions
- [ ] Error messages are clear
- [ ] Loading states visible

---

## Reference Design Inspiration

Look at these for design inspiration (NOT to copy, just inspiration):
- **Pramp.com** - Interview platform UI
- **Coursera** - Clean learning interface
- **Notion** - Minimalist design
- **Cal.com** - Calendar interview booking (simple design)

---

**Use this as your design guide. Keep everything clean, minimal, and professional.** ✨


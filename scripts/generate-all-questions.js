/**
 * Generate expanded questions.json with 450 total questions
 * This script creates all questions manually without using Gemini API
 */

const fs = require('fs');
const path = require('path');

// Read existing questions
const existingPath = path.join(__dirname, '..', 'public', 'questions.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
let allQuestions = [...existing.questions];
let qId = allQuestions.length + 1;

// Helper to create a question
function createQuestion(role, difficulty, category, question, framework, redFlags, timeLimit) {
  return {
    id: `q${qId++}`,
    role,
    difficulty,
    category,
    question,
    answerFramework: framework,
    redFlags,
    timeLimit
  };
}

console.log('Generating 350 additional questions...\n');

// ===== BACKEND ENGINEER - Add 25 questions (currently 20, need 45) =====
const backendQuestions = [
  // Junior - Behavioral (4 more)
  createQuestion("Backend Engineer", "Junior", "Behavioral", "Describe a time when you had to learn a new technology quickly for a project.", "Situation → Challenge → Learning approach → Outcome", ["No learning method", "Gave up easily", "No outcome"], 90),
  createQuestion("Backend Engineer", "Junior", "Behavioral", "Tell me about a time you helped a teammate solve a technical problem.", "Context → Problem → Your help → Result", ["No collaboration", "Took all credit", "No result"], 90),
  createQuestion("Backend Engineer", "Junior", "Behavioral", "How do you handle feedback on your code during code reviews?", "Approach → Examples → Learning → Improvement", ["Defensive", "No learning", "Ignores feedback"], 90),
  createQuestion("Backend Engineer", "Junior", "Behavioral", "Describe a situation where you had to ask for help.", "Context → What you tried → Who you asked → Outcome", ["Never asks for help", "No learning", "No outcome"], 90),
  
  // Junior - Technical (7 more)
  createQuestion("Backend Engineer", "Junior", "Technical", "What is the difference between GET and POST HTTP methods?", "Purpose → Use cases → Idempotency → Examples", ["Incorrect definitions", "No examples", "Confuses methods"], 90),
  createQuestion("Backend Engineer", "Junior", "Technical", "Explain what a database transaction is.", "Definition → ACID → Example → When to use", ["No ACID", "No example", "Incorrect definition"], 90),
  createQuestion("Backend Engineer", "Junior", "Technical", "What is an API endpoint and how does it work?", "Definition → Components → Request/Response → Example", ["Vague definition", "No example", "Missing components"], 90),
  createQuestion("Backend Engineer", "Junior", "Technical", "Explain the difference between synchronous and asynchronous operations.", "Definitions → Use cases → Trade-offs → Examples", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Backend Engineer", "Junior", "Technical", "What is a primary key in a database?", "Definition → Purpose → Constraints → Example", ["Incorrect definition", "No example", "No constraints"], 90),
  createQuestion("Backend Engineer", "Junior", "Technical", "Explain what JSON is and when you would use it.", "Definition → Structure → Use cases → Alternatives", ["Incorrect definition", "No use cases", "No alternatives"], 90),
  createQuestion("Backend Engineer", "Junior", "Technical", "What is a REST API?", "Definition → Principles → HTTP methods → Example", ["Incorrect definition", "No principles", "No example"], 90),
  
  // Junior - System Design (3 more)
  createQuestion("Backend Engineer", "Junior", "System Design", "How would you design a simple user authentication system?", "Requirements → Database → Password handling → Session management", ["No password security", "No session management", "No database design"], 120),
  createQuestion("Backend Engineer", "Junior", "System Design", "Design a basic file upload service.", "Requirements → Storage → Validation → Error handling", ["No validation", "No error handling", "No storage consideration"], 120),
  createQuestion("Backend Engineer", "Junior", "System Design", "How would you design a simple logging system?", "Requirements → Storage → Format → Retrieval", ["No storage plan", "No format", "No retrieval"], 120),
  
  // Mid - Behavioral (7 more)
  createQuestion("Backend Engineer", "Mid", "Behavioral", "Describe a time you had to refactor legacy code.", "Context → Challenges → Approach → Testing → Outcome", ["No testing", "Broke functionality", "No outcome"], 120),
  createQuestion("Backend Engineer", "Mid", "Behavioral", "Tell me about a time you had to make a technical decision under uncertainty.", "Situation → Options → Decision → Rationale → Result", ["No rationale", "No alternatives", "Bad outcome"], 120),
  createQuestion("Backend Engineer", "Mid", "Behavioral", "Describe a time you had to work with a difficult team member.", "Context → Challenges → Approach → Resolution → Learning", ["No resolution", "Blames others", "No learning"], 120),
  createQuestion("Backend Engineer", "Mid", "Behavioral", "Tell me about a time you had to balance speed vs quality.", "Situation → Trade-offs → Decision → Outcome → Reflection", ["No trade-offs", "No reflection", "Poor outcome"], 120),
  createQuestion("Backend Engineer", "Mid", "Behavioral", "Describe a time you had to learn from a mistake.", "Context → Mistake → Impact → Learning → Prevention", ["No learning", "Blames others", "No prevention"], 120),
  createQuestion("Backend Engineer", "Mid", "Behavioral", "Tell me about a time you had to explain a complex technical concept to a non-technical person.", "Context → Concept → Approach → Outcome → Learning", ["Too technical", "No outcome", "No learning"], 120),
  createQuestion("Backend Engineer", "Mid", "Behavioral", "Describe a time you had to prioritize multiple urgent tasks.", "Context → Tasks → Prioritization → Execution → Outcome", ["No prioritization", "No outcome", "Poor execution"], 120),
  
  // Mid - Technical (11 more)
  createQuestion("Backend Engineer", "Mid", "Technical", "How do you handle database connection pooling?", "What → Why → Implementation → Configuration → Monitoring", ["No monitoring", "Ignores limits", "No configuration"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "Explain microservices vs monolithic architecture.", "Definitions → Trade-offs → When to use each → Examples", ["No trade-offs", "No examples", "Incorrect definitions"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "How do you implement rate limiting in an API?", "Approach → Algorithms → Storage → Edge cases → Monitoring", ["No algorithm", "No edge cases", "No monitoring"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "Explain database normalization and denormalization.", "Definitions → Normal forms → Trade-offs → When to use", ["Incorrect definitions", "No trade-offs", "No use cases"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "How do you handle database migrations safely?", "Planning → Backward compatibility → Rollback → Testing → Monitoring", ["No rollback", "No testing", "No monitoring"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "Explain the difference between horizontal and vertical scaling.", "Definitions → Use cases → Trade-offs → Examples", ["Confuses concepts", "No examples", "No trade-offs"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "How do you implement caching strategies?", "Types → Use cases → Invalidation → Monitoring → Trade-offs", ["No invalidation", "No monitoring", "No trade-offs"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "Explain message queues and when to use them.", "Definition → Use cases → Patterns → Trade-offs → Examples", ["No use cases", "No patterns", "No examples"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "How do you handle distributed transactions?", "Challenges → Patterns → Two-phase commit → Saga → Trade-offs", ["No patterns", "No trade-offs", "Ignores challenges"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "Explain load balancing strategies.", "Types → Algorithms → Health checks → Failover → Monitoring", ["No algorithms", "No failover", "No monitoring"], 120),
  createQuestion("Backend Engineer", "Mid", "Technical", "How do you implement API versioning?", "Approaches → URL vs headers → Backward compatibility → Deprecation", ["No compatibility", "No deprecation", "No approach"], 120),
  
  // Mid - System Design (4 more)
  createQuestion("Backend Engineer", "Mid", "System Design", "Design a URL shortener service.", "Requirements → Storage → Algorithm → Scaling → Edge cases", ["No algorithm", "No scaling", "No edge cases"], 180),
  createQuestion("Backend Engineer", "Mid", "System Design", "How would you design a real-time chat system?", "Requirements → Architecture → Message delivery → Presence → Scaling", ["No message delivery", "No presence", "No scaling"], 180),
  createQuestion("Backend Engineer", "Mid", "System Design", "Design a search system for an e-commerce platform.", "Requirements → Indexing → Ranking → Caching → Scaling", ["No indexing", "No ranking", "No scaling"], 180),
  createQuestion("Backend Engineer", "Mid", "System Design", "How would you design a payment processing system?", "Requirements → Security → Transactions → Idempotency → Monitoring", ["No security", "No idempotency", "No monitoring"], 180),
  
  // Senior - Behavioral (2 more)
  createQuestion("Backend Engineer", "Senior", "Behavioral", "Tell me about a time you had to make an architectural decision that affected the entire team.", "Context → Options → Decision → Communication → Outcome", ["No communication", "Poor decision", "No outcome"], 150),
  createQuestion("Backend Engineer", "Senior", "Behavioral", "Describe a time you had to mentor a junior engineer on a complex problem.", "Context → Problem → Teaching approach → Outcome → Learning", ["No teaching", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5 more)
  createQuestion("Backend Engineer", "Senior", "Technical", "How do you design for high availability in distributed systems?", "Requirements → Redundancy → Failover → Monitoring → Testing", ["No redundancy", "No failover", "No testing"], 180),
  createQuestion("Backend Engineer", "Senior", "Technical", "Explain consensus algorithms in distributed systems.", "Problem → Raft → Paxos → Use cases → Trade-offs", ["No algorithms", "No use cases", "No trade-offs"], 180),
  createQuestion("Backend Engineer", "Senior", "Technical", "How do you implement distributed locking?", "Requirements → Approaches → Redis → ZooKeeper → Trade-offs", ["No approaches", "No trade-offs", "Ignores challenges"], 180),
  createQuestion("Backend Engineer", "Senior", "Technical", "Explain database sharding strategies.", "Approaches → Key selection → Rebalancing → Challenges → Trade-offs", ["No approaches", "No rebalancing", "No trade-offs"], 180),
  createQuestion("Backend Engineer", "Senior", "Technical", "How do you design for eventual consistency?", "Requirements → Patterns → Conflict resolution → Monitoring → Trade-offs", ["No patterns", "No conflict resolution", "No trade-offs"], 180),
  
  // Senior - System Design (2 more)
  createQuestion("Backend Engineer", "Senior", "System Design", "Design a distributed cache system.", "Requirements → Architecture → Consistency → Eviction → Scaling", ["No consistency model", "No eviction", "No scaling"], 300),
  createQuestion("Backend Engineer", "Senior", "System Design", "How would you design a message queue system?", "Requirements → Architecture → Durability → Ordering → Scaling", ["No durability", "No ordering", "No scaling plan"], 300)
];

allQuestions.push(...backendQuestions);
console.log(`Added ${backendQuestions.length} Backend Engineer questions`);

// ===== FRONTEND ENGINEER - Add 27 questions (currently 18, need 45) =====
const frontendQuestions = [
  // Junior - Behavioral (4)
  createQuestion("Frontend Engineer", "Junior", "Behavioral", "Tell me about a time you had to fix a bug that was affecting users.", "Context → Impact → Debugging → Fix → Validation", ["No validation", "No impact", "No learning"], 90),
  createQuestion("Frontend Engineer", "Junior", "Behavioral", "Describe a time you had to work with a design you didn't agree with.", "Context → Concerns → Approach → Outcome → Learning", ["No approach", "No outcome", "No learning"], 90),
  createQuestion("Frontend Engineer", "Junior", "Behavioral", "How do you stay updated with frontend technologies?", "Approach → Resources → Practice → Application", ["No resources", "No practice", "No application"], 90),
  createQuestion("Frontend Engineer", "Junior", "Behavioral", "Tell me about a time you had to work on a tight deadline.", "Context → Challenges → Approach → Outcome", ["No approach", "Poor quality", "No outcome"], 90),
  
  // Junior - Technical (7)
  createQuestion("Frontend Engineer", "Junior", "Technical", "What is the Document Object Model (DOM)?", "Definition → Structure → Manipulation → Examples", ["Incorrect definition", "No examples", "No manipulation"], 90),
  createQuestion("Frontend Engineer", "Junior", "Technical", "Explain the difference between == and === in JavaScript.", "Definitions → Type coercion → Examples → Best practices", ["Confuses operators", "No examples", "No best practices"], 90),
  createQuestion("Frontend Engineer", "Junior", "Technical", "What are CSS selectors and how do they work?", "Definition → Types → Specificity → Examples", ["Incorrect definition", "No types", "No examples"], 90),
  createQuestion("Frontend Engineer", "Junior", "Technical", "Explain what closures are in JavaScript.", "Definition → How they work → Use cases → Examples", ["Incorrect definition", "No use cases", "No examples"], 90),
  createQuestion("Frontend Engineer", "Junior", "Technical", "What is the difference between null and undefined?", "Definitions → When each occurs → Examples → Best practices", ["Confuses concepts", "No examples", "No best practices"], 90),
  createQuestion("Frontend Engineer", "Junior", "Technical", "Explain what promises are in JavaScript.", "Definition → Problem they solve → Syntax → Examples", ["Incorrect definition", "No problem", "No examples"], 90),
  createQuestion("Frontend Engineer", "Junior", "Technical", "What is CSS flexbox and when would you use it?", "Definition → Properties → Use cases → Examples", ["Incorrect definition", "No use cases", "No examples"], 90),
  
  // Junior - System Design (3)
  createQuestion("Frontend Engineer", "Junior", "System Design", "How would you design a simple todo list application?", "Requirements → Components → State management → Styling", ["No state management", "No components", "No styling"], 120),
  createQuestion("Frontend Engineer", "Junior", "System Design", "Design a simple form with validation.", "Requirements → Fields → Validation → Error handling → UX", ["No validation", "No error handling", "Poor UX"], 120),
  createQuestion("Frontend Engineer", "Junior", "System Design", "How would you structure a simple single-page application?", "Requirements → Routing → Components → State → Styling", ["No routing", "No structure", "No state"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("Frontend Engineer", "Mid", "Behavioral", "Describe a time you had to optimize a slow-loading page.", "Context → Problem → Analysis → Solution → Results", ["No analysis", "No results", "No solution"], 120),
  createQuestion("Frontend Engineer", "Mid", "Behavioral", "Tell me about a time you had to work with a complex state management problem.", "Context → Complexity → Approach → Solution → Learning", ["No approach", "No solution", "No learning"], 120),
  createQuestion("Frontend Engineer", "Mid", "Behavioral", "Describe a time you had to implement a feature you thought was unnecessary.", "Context → Concerns → Approach → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  createQuestion("Frontend Engineer", "Mid", "Behavioral", "Tell me about a time you had to debug a complex frontend issue.", "Context → Problem → Debugging process → Solution → Prevention", ["No process", "No solution", "No prevention"], 120),
  createQuestion("Frontend Engineer", "Mid", "Behavioral", "Describe a time you had to learn a new framework quickly.", "Context → Timeline → Learning approach → Implementation → Outcome", ["No approach", "No implementation", "No outcome"], 120),
  createQuestion("Frontend Engineer", "Mid", "Behavioral", "Tell me about a time you had to work with legacy frontend code.", "Context → Challenges → Approach → Refactoring → Outcome", ["No approach", "No refactoring", "No outcome"], 120),
  createQuestion("Frontend Engineer", "Mid", "Behavioral", "Describe a time you had to balance user experience with technical constraints.", "Context → Constraints → Trade-offs → Solution → Outcome", ["No trade-offs", "No solution", "No outcome"], 120),
  
  // Mid - Technical (11)
  createQuestion("Frontend Engineer", "Mid", "Technical", "How do you optimize React component re-renders?", "Identify → Memoization → useMemo/useCallback → Profiling → Results", ["No profiling", "No results", "No memoization"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "Explain server-side rendering vs client-side rendering.", "Definitions → Trade-offs → Use cases → Examples", ["No trade-offs", "No examples", "Incorrect definitions"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "How do you handle state management in a large React application?", "Approaches → Context → Redux → Zustand → Trade-offs", ["No approaches", "No trade-offs", "Ignores complexity"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "Explain CSS Grid vs Flexbox.", "Definitions → Use cases → When to use each → Examples", ["Confuses concepts", "No examples", "No use cases"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "How do you implement code splitting in a React app?", "Approach → Dynamic imports → Route-based → Component-based → Benefits", ["No approach", "No benefits", "No implementation"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "Explain the virtual DOM and how it works.", "Definition → How it works → Benefits → Trade-offs → Examples", ["Incorrect definition", "No benefits", "No examples"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "How do you handle forms in React?", "Controlled vs uncontrolled → Validation → Error handling → Submission", ["No validation", "No error handling", "Confuses concepts"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "Explain TypeScript and its benefits for frontend development.", "Definition → Benefits → Type safety → Examples → Trade-offs", ["No benefits", "No examples", "No trade-offs"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "How do you implement responsive design?", "Approach → Breakpoints → Media queries → Flexible units → Testing", ["No breakpoints", "No testing", "No approach"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "Explain Webpack and its role in frontend builds.", "Definition → Purpose → Configuration → Plugins → Alternatives", ["No purpose", "No configuration", "No alternatives"], 120),
  createQuestion("Frontend Engineer", "Mid", "Technical", "How do you handle API calls in a React application?", "Approaches → Fetch → Axios → React Query → Error handling → Loading states", ["No error handling", "No loading states", "No approaches"], 120),
  
  // Mid - System Design (4)
  createQuestion("Frontend Engineer", "Mid", "System Design", "Design a component library architecture.", "Requirements → Components → Styling → Documentation → Versioning", ["No documentation", "No versioning", "No architecture"], 180),
  createQuestion("Frontend Engineer", "Mid", "System Design", "How would you design a real-time dashboard with multiple data sources?", "Requirements → Data fetching → State → Updates → Performance", ["No performance", "No updates", "No state"], 180),
  createQuestion("Frontend Engineer", "Mid", "System Design", "Design a multi-step form with progress tracking.", "Requirements → Steps → State → Validation → UX → Error handling", ["No validation", "No error handling", "Poor UX"], 180),
  createQuestion("Frontend Engineer", "Mid", "System Design", "How would you design a search interface with autocomplete?", "Requirements → API → Debouncing → Caching → UX → Error handling", ["No debouncing", "No caching", "No error handling"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("Frontend Engineer", "Senior", "Behavioral", "Tell me about a time you had to make a technical decision that affected the entire frontend team.", "Context → Options → Decision → Communication → Outcome", ["No communication", "Poor decision", "No outcome"], 150),
  createQuestion("Frontend Engineer", "Senior", "Behavioral", "Describe a time you had to mentor a junior developer on frontend best practices.", "Context → Practices → Teaching approach → Outcome → Learning", ["No teaching", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("Frontend Engineer", "Senior", "Technical", "How do you architect a large-scale frontend application?", "Structure → Patterns → State → Routing → Testing → Performance", ["No patterns", "No testing", "No performance"], 180),
  createQuestion("Frontend Engineer", "Senior", "Technical", "Explain micro-frontends architecture.", "Definition → Approaches → Communication → Deployment → Trade-offs", ["No approaches", "No trade-offs", "Incorrect definition"], 180),
  createQuestion("Frontend Engineer", "Senior", "Technical", "How do you implement progressive web app features?", "Requirements → Service workers → Caching → Offline → Push notifications", ["No service workers", "No caching", "No offline"], 180),
  createQuestion("Frontend Engineer", "Senior", "Technical", "Explain frontend performance optimization strategies.", "Metrics → Bundle size → Code splitting → Lazy loading → Caching → Monitoring", ["No metrics", "No monitoring", "No strategies"], 180),
  createQuestion("Frontend Engineer", "Senior", "Technical", "How do you ensure accessibility in a complex frontend application?", "Standards → Testing → Tools → Implementation → Validation", ["No standards", "No testing", "No validation"], 180),
  
  // Senior - System Design (2)
  createQuestion("Frontend Engineer", "Senior", "System Design", "Design a real-time collaborative editing interface.", "Requirements → Architecture → Conflict resolution → Sync → UX", ["No conflict resolution", "No sync", "Poor UX"], 300),
  createQuestion("Frontend Engineer", "Senior", "System Design", "How would you design a frontend architecture for a multi-tenant SaaS application?", "Requirements → Isolation → Theming → Configuration → Performance", ["No isolation", "No theming", "No performance"], 300)
];

allQuestions.push(...frontendQuestions);
console.log(`Added ${frontendQuestions.length} Frontend Engineer questions`);

// ===== PRODUCT MANAGER - Add 28 questions (currently 17, need 45) =====
const pmQuestions = [
  // Junior - Behavioral (4)
  createQuestion("Product Manager", "Junior", "Behavioral", "Tell me about a time you had to gather requirements from multiple stakeholders.", "Context → Stakeholders → Approach → Challenges → Outcome", ["No approach", "No challenges", "No outcome"], 90),
  createQuestion("Product Manager", "Junior", "Behavioral", "Describe a time you had to say no to a feature request.", "Context → Request → Reasoning → Communication → Outcome", ["No reasoning", "Poor communication", "No outcome"], 90),
  createQuestion("Product Manager", "Junior", "Behavioral", "Tell me about a time you had to work with a difficult stakeholder.", "Context → Challenges → Approach → Resolution → Learning", ["No resolution", "No approach", "No learning"], 90),
  createQuestion("Product Manager", "Junior", "Behavioral", "How do you handle conflicting priorities from different teams?", "Context → Conflicts → Prioritization → Communication → Outcome", ["No prioritization", "No communication", "No outcome"], 90),
  
  // Junior - Technical/Execution (7)
  createQuestion("Product Manager", "Junior", "Execution", "How do you write a good product requirement document?", "Structure → User stories → Acceptance criteria → Edge cases → Success metrics", ["No acceptance criteria", "No metrics", "No structure"], 90),
  createQuestion("Product Manager", "Junior", "Execution", "Explain the difference between a feature and a product.", "Definitions → Scope → Examples → Trade-offs", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Product Manager", "Junior", "Execution", "How do you conduct user interviews?", "Planning → Questions → Execution → Analysis → Insights", ["No planning", "No analysis", "No insights"], 90),
  createQuestion("Product Manager", "Junior", "Execution", "What is a minimum viable product (MVP)?", "Definition → Purpose → Scope → Examples → Trade-offs", ["Incorrect definition", "No examples", "No trade-offs"], 90),
  createQuestion("Product Manager", "Junior", "Execution", "How do you prioritize features in a backlog?", "Framework → Criteria → Stakeholders → Examples → Trade-offs", ["No framework", "No criteria", "No examples"], 90),
  createQuestion("Product Manager", "Junior", "Execution", "Explain what A/B testing is and when to use it.", "Definition → Purpose → Setup → Analysis → Examples", ["Incorrect definition", "No examples", "No analysis"], 90),
  createQuestion("Product Manager", "Junior", "Execution", "How do you measure product success?", "Metrics → KPIs → Tracking → Analysis → Action", ["No metrics", "No tracking", "No action"], 90),
  
  // Junior - System Design/Strategy (3)
  createQuestion("Product Manager", "Junior", "Strategy", "How would you launch a new feature?", "Planning → Communication → Rollout → Monitoring → Iteration", ["No planning", "No monitoring", "No iteration"], 120),
  createQuestion("Product Manager", "Junior", "Strategy", "Design a product roadmap for a new feature.", "Timeline → Dependencies → Milestones → Risks → Communication", ["No dependencies", "No risks", "No communication"], 120),
  createQuestion("Product Manager", "Junior", "Strategy", "How would you validate a product idea before building?", "Hypothesis → Research → Experiments → Metrics → Decision", ["No hypothesis", "No experiments", "No metrics"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("Product Manager", "Mid", "Behavioral", "Tell me about a failed product launch and what you learned.", "Context → Goal → What failed → Why → Learning → Prevention", ["No why", "No learning", "No prevention"], 120),
  createQuestion("Product Manager", "Mid", "Behavioral", "Describe a time you had to make a difficult product decision with incomplete data.", "Context → Data available → Decision process → Outcome → Reflection", ["No process", "No outcome", "No reflection"], 120),
  createQuestion("Product Manager", "Mid", "Behavioral", "Tell me about a time you had to pivot a product strategy.", "Context → Original plan → Why pivot → New direction → Outcome", ["No why", "No direction", "No outcome"], 120),
  createQuestion("Product Manager", "Mid", "Behavioral", "Describe a time you had to balance user needs with business goals.", "Context → User needs → Business goals → Trade-offs → Solution → Outcome", ["No trade-offs", "No solution", "No outcome"], 120),
  createQuestion("Product Manager", "Mid", "Behavioral", "Tell me about a time you influenced a technical decision as a PM.", "Context → Decision → Your input → Reasoning → Outcome", ["No input", "No reasoning", "No outcome"], 120),
  createQuestion("Product Manager", "Mid", "Behavioral", "Describe a time you had to manage scope creep.", "Context → Scope changes → Impact → Management → Outcome", ["No management", "No outcome", "No impact"], 120),
  createQuestion("Product Manager", "Mid", "Behavioral", "Tell me about a time you had to work with an underperforming team member.", "Context → Performance issues → Approach → Resolution → Outcome", ["No approach", "No resolution", "No outcome"], 120),
  
  // Mid - Technical/Execution (11)
  createQuestion("Product Manager", "Mid", "Execution", "How do you run effective sprint planning sessions?", "Preparation → Goals → Prioritization → Estimation → Risks → Alignment", ["No preparation", "No risks", "No alignment"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "Explain how you measure product-market fit.", "Definition → Metrics → Indicators → Analysis → Action", ["No definition", "No metrics", "No action"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "How do you create a go-to-market strategy?", "Target audience → Channels → Messaging → Timeline → Metrics", ["No audience", "No channels", "No metrics"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "Explain the difference between leading and lagging indicators.", "Definitions → Examples → Use cases → Trade-offs", ["Confuses concepts", "No examples", "No trade-offs"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "How do you conduct competitive analysis?", "Approach → Competitors → Features → Positioning → Insights", ["No approach", "No insights", "No positioning"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "Explain how you use data to make product decisions.", "Data sources → Analysis → Insights → Decisions → Validation", ["No sources", "No analysis", "No validation"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "How do you manage technical debt as a PM?", "Understanding → Prioritization → Communication → Planning → Execution", ["No understanding", "No prioritization", "No execution"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "Explain how you work with engineering teams on estimation.", "Approach → Techniques → Communication → Risks → Adjustments", ["No approach", "No techniques", "No adjustments"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "How do you handle feature requests from customers?", "Process → Evaluation → Prioritization → Communication → Feedback", ["No process", "No prioritization", "No feedback"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "Explain how you measure user engagement.", "Metrics → Tracking → Analysis → Insights → Action", ["No metrics", "No analysis", "No action"], 120),
  createQuestion("Product Manager", "Mid", "Execution", "How do you create and maintain a product backlog?", "Structure → Prioritization → Refinement → Communication → Updates", ["No structure", "No prioritization", "No updates"], 120),
  
  // Mid - System Design/Strategy (4)
  createQuestion("Product Manager", "Mid", "Strategy", "How would you design a product strategy for a new market?", "Research → Target → Positioning → Go-to-market → Metrics → Risks", ["No research", "No metrics", "No risks"], 180),
  createQuestion("Product Manager", "Mid", "Strategy", "Design a pricing strategy for a SaaS product.", "Research → Models → Value proposition → Testing → Iteration", ["No research", "No testing", "No iteration"], 180),
  createQuestion("Product Manager", "Mid", "Strategy", "How would you approach building a platform vs point solutions?", "Analysis → Trade-offs → Decision → Execution → Validation", ["No analysis", "No trade-offs", "No validation"], 180),
  createQuestion("Product Manager", "Mid", "Strategy", "Design a product strategy for international expansion.", "Research → Markets → Localization → Go-to-market → Risks → Metrics", ["No research", "No risks", "No metrics"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("Product Manager", "Senior", "Behavioral", "Tell me about a time you had to make a strategic decision that affected the entire company.", "Context → Options → Analysis → Decision → Communication → Outcome", ["No analysis", "No communication", "No outcome"], 150),
  createQuestion("Product Manager", "Senior", "Behavioral", "Describe a time you had to build consensus across multiple teams for a product vision.", "Context → Vision → Stakeholders → Approach → Outcome → Learning", ["No approach", "No outcome", "No learning"], 150),
  
  // Senior - Technical/Execution (5)
  createQuestion("Product Manager", "Senior", "Strategy", "How do you set and measure product strategy?", "Vision → Goals → Metrics → Tracking → Review → Iteration", ["No vision", "No metrics", "No iteration"], 180),
  createQuestion("Product Manager", "Senior", "Strategy", "Explain how you balance innovation with execution.", "Approach → Allocation → Risk → Metrics → Trade-offs", ["No approach", "No metrics", "No trade-offs"], 180),
  createQuestion("Product Manager", "Senior", "Strategy", "How do you design a product organization structure?", "Roles → Responsibilities → Communication → Decision-making → Scaling", ["No roles", "No communication", "No scaling"], 180),
  createQuestion("Product Manager", "Senior", "Strategy", "Explain how you approach product portfolio management.", "Portfolio → Prioritization → Resources → Metrics → Optimization", ["No prioritization", "No metrics", "No optimization"], 180),
  createQuestion("Product Manager", "Senior", "Strategy", "How do you design a product strategy for a mature product?", "Analysis → Opportunities → Innovation → Execution → Metrics", ["No analysis", "No innovation", "No metrics"], 180),
  
  // Senior - System Design (2)
  createQuestion("Product Manager", "Senior", "Strategy", "Design a product strategy for entering a competitive market.", "Research → Differentiation → Go-to-market → Execution → Metrics → Risks", ["No research", "No differentiation", "No risks"], 300),
  createQuestion("Product Manager", "Senior", "Strategy", "How would you design a product strategy for a platform business?", "Platform model → Network effects → Ecosystem → Monetization → Metrics → Risks", ["No network effects", "No monetization", "No risks"], 300)
];

allQuestions.push(...pmQuestions);
console.log(`Added ${pmQuestions.length} Product Manager questions`);

// ===== DATA SCIENTIST - Add 29 questions (currently 16, need 45) =====
const dataScientistQuestions = [
  // Junior - Behavioral (4)
  createQuestion("Data Scientist", "Junior", "Behavioral", "Tell me about a time you had to explain a complex data analysis to a non-technical audience.", "Context → Analysis → Simplification → Communication → Outcome", ["Too technical", "No outcome", "No communication"], 90),
  createQuestion("Data Scientist", "Junior", "Behavioral", "Describe a time you had to work with messy or incomplete data.", "Context → Data quality → Challenges → Approach → Outcome", ["No approach", "No challenges", "No outcome"], 90),
  createQuestion("Data Scientist", "Junior", "Behavioral", "Tell me about a time you had to learn a new machine learning technique.", "Context → Technique → Learning approach → Application → Outcome", ["No approach", "No application", "No outcome"], 90),
  createQuestion("Data Scientist", "Junior", "Behavioral", "How do you handle uncertainty in your data analysis?", "Approach → Validation → Communication → Examples → Learning", ["No validation", "No communication", "No learning"], 90),
  
  // Junior - Technical (7)
  createQuestion("Data Scientist", "Junior", "Technical", "What is overfitting and how do you prevent it?", "Definition → Causes → Prevention → Examples → Validation", ["Incorrect definition", "No examples", "No validation"], 90),
  createQuestion("Data Scientist", "Junior", "Technical", "Explain the difference between supervised and unsupervised learning.", "Definitions → Examples → Use cases → Trade-offs", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Data Scientist", "Junior", "Technical", "What is a confusion matrix and what does it tell you?", "Definition → Components → Metrics → Interpretation → Examples", ["Incorrect definition", "No interpretation", "No examples"], 90),
  createQuestion("Data Scientist", "Junior", "Technical", "Explain what feature engineering is.", "Definition → Purpose → Techniques → Examples → Impact", ["No definition", "No techniques", "No examples"], 90),
  createQuestion("Data Scientist", "Junior", "Technical", "What is cross-validation and why is it important?", "Definition → Types → Purpose → Examples → When to use", ["Incorrect definition", "No examples", "No purpose"], 90),
  createQuestion("Data Scientist", "Junior", "Technical", "Explain the difference between classification and regression.", "Definitions → Use cases → Algorithms → Examples → Trade-offs", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Data Scientist", "Junior", "Technical", "What is feature scaling and when is it needed?", "Definition → Methods → When to use → Examples → Impact", ["No definition", "No methods", "No examples"], 90),
  
  // Junior - System Design (3)
  createQuestion("Data Scientist", "Junior", "System Design", "How would you design a simple recommendation system?", "Requirements → Data → Algorithm → Evaluation → Deployment", ["No algorithm", "No evaluation", "No deployment"], 120),
  createQuestion("Data Scientist", "Junior", "System Design", "Design a basic A/B testing framework.", "Requirements → Randomization → Metrics → Analysis → Decision", ["No randomization", "No metrics", "No analysis"], 120),
  createQuestion("Data Scientist", "Junior", "System Design", "How would you design a data pipeline for model training?", "Requirements → Data sources → Processing → Storage → Training", ["No processing", "No storage", "No training"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("Data Scientist", "Mid", "Behavioral", "Tell me about a time a model you built didn't perform as expected.", "Context → Expectations → Analysis → Root cause → Fix → Learning", ["No analysis", "No fix", "No learning"], 120),
  createQuestion("Data Scientist", "Mid", "Behavioral", "Describe a time you had to work with stakeholders who didn't understand data science.", "Context → Challenges → Communication → Approach → Outcome → Learning", ["No communication", "No approach", "No learning"], 120),
  createQuestion("Data Scientist", "Mid", "Behavioral", "Tell me about a time you had to make a decision with limited data.", "Context → Data available → Approach → Decision → Validation → Outcome", ["No approach", "No validation", "No outcome"], 120),
  createQuestion("Data Scientist", "Mid", "Behavioral", "Describe a time you had to balance model accuracy with interpretability.", "Context → Requirements → Trade-offs → Decision → Outcome → Learning", ["No trade-offs", "No decision", "No learning"], 120),
  createQuestion("Data Scientist", "Mid", "Behavioral", "Tell me about a time you had to explain a statistical concept to a non-statistician.", "Context → Concept → Simplification → Communication → Outcome → Learning", ["Too technical", "No outcome", "No learning"], 120),
  createQuestion("Data Scientist", "Mid", "Behavioral", "Describe a time you had to work with a large dataset that didn't fit in memory.", "Context → Challenge → Approach → Solution → Outcome → Learning", ["No approach", "No solution", "No learning"], 120),
  createQuestion("Data Scientist", "Mid", "Behavioral", "Tell me about a time you had to validate a model's performance in production.", "Context → Validation approach → Metrics → Challenges → Outcome → Learning", ["No approach", "No metrics", "No learning"], 120),
  
  // Mid - Technical (11)
  createQuestion("Data Scientist", "Mid", "Technical", "How do you handle missing data in a dataset?", "Types → Analysis → Methods → Trade-offs → Examples", ["No methods", "No trade-offs", "No examples"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "Explain ensemble methods and when to use them.", "Definition → Types → Benefits → Use cases → Examples", ["Incorrect definition", "No use cases", "No examples"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "How do you select features for a machine learning model?", "Approaches → Importance → Correlation → Selection → Validation", ["No approaches", "No validation", "No selection"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "Explain gradient descent and how it works.", "Definition → How it works → Variants → Use cases → Examples", ["Incorrect definition", "No use cases", "No examples"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "How do you evaluate a classification model?", "Metrics → Confusion matrix → ROC-AUC → Precision-recall → Use cases", ["No metrics", "No use cases", "Incomplete evaluation"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "Explain the bias-variance tradeoff in detail.", "Definitions → Relationship → Examples → Mitigation → Trade-offs", ["Incorrect definitions", "No examples", "No mitigation"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "How do you handle imbalanced datasets?", "Problem → Methods → Metrics → Validation → Examples", ["No methods", "No metrics", "No examples"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "Explain deep learning and when to use it.", "Definition → Architecture → Use cases → Trade-offs → Examples", ["Incorrect definition", "No use cases", "No trade-offs"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "How do you prevent data leakage in machine learning?", "Definition → Types → Detection → Prevention → Examples", ["No definition", "No prevention", "No examples"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "Explain time series forecasting methods.", "Approaches → ARIMA → LSTM → Evaluation → Use cases", ["No approaches", "No evaluation", "No use cases"], 120),
  createQuestion("Data Scientist", "Mid", "Technical", "How do you interpret a machine learning model?", "Methods → SHAP → LIME → Feature importance → Use cases", ["No methods", "No use cases", "Incomplete interpretation"], 120),
  
  // Mid - System Design (4)
  createQuestion("Data Scientist", "Mid", "System Design", "Design a machine learning pipeline from data to production.", "Data → Preprocessing → Training → Validation → Deployment → Monitoring", ["No preprocessing", "No monitoring", "No deployment"], 180),
  createQuestion("Data Scientist", "Mid", "System Design", "How would you design a real-time recommendation system?", "Requirements → Architecture → Model serving → Latency → Evaluation", ["No architecture", "No latency", "No evaluation"], 180),
  createQuestion("Data Scientist", "Mid", "System Design", "Design a system for detecting anomalies in streaming data.", "Requirements → Approach → Detection → Alerts → Evaluation → Monitoring", ["No approach", "No alerts", "No monitoring"], 180),
  createQuestion("Data Scientist", "Mid", "System Design", "How would you design a model retraining pipeline?", "Requirements → Triggers → Data → Training → Validation → Deployment → Monitoring", ["No triggers", "No validation", "No monitoring"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("Data Scientist", "Senior", "Behavioral", "Tell me about a time you had to make a strategic decision about model architecture.", "Context → Options → Analysis → Decision → Impact → Learning", ["No analysis", "No impact", "No learning"], 150),
  createQuestion("Data Scientist", "Senior", "Behavioral", "Describe a time you had to build a data science team.", "Context → Requirements → Hiring → Onboarding → Outcome → Learning", ["No requirements", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("Data Scientist", "Senior", "Technical", "How do you design a machine learning system for production?", "Requirements → Architecture → Serving → Monitoring → Retraining → Scaling", ["No architecture", "No monitoring", "No scaling"], 180),
  createQuestion("Data Scientist", "Senior", "Technical", "Explain how you handle model drift in production.", "Definition → Detection → Causes → Mitigation → Monitoring → Retraining", ["No definition", "No mitigation", "No monitoring"], 180),
  createQuestion("Data Scientist", "Senior", "Technical", "How do you ensure fairness and bias mitigation in ML models?", "Bias types → Detection → Mitigation → Evaluation → Monitoring", ["No detection", "No mitigation", "No monitoring"], 180),
  createQuestion("Data Scientist", "Senior", "Technical", "Explain how you optimize model performance vs inference latency.", "Trade-offs → Optimization → Quantization → Hardware → Examples", ["No trade-offs", "No optimization", "No examples"], 180),
  createQuestion("Data Scientist", "Senior", "Technical", "How do you design experiments for causal inference?", "Requirements → Design → Randomization → Analysis → Validation", ["No design", "No randomization", "No validation"], 180),
  
  // Senior - System Design (2)
  createQuestion("Data Scientist", "Senior", "System Design", "Design an end-to-end ML platform for multiple teams.", "Requirements → Architecture → Data → Training → Serving → Monitoring → Governance", ["No architecture", "No monitoring", "No governance"], 300),
  createQuestion("Data Scientist", "Senior", "System Design", "How would you design a system for online learning and model updates?", "Requirements → Architecture → Data flow → Model updates → Evaluation → Monitoring", ["No architecture", "No evaluation", "No monitoring"], 300)
];

allQuestions.push(...dataScientistQuestions);
console.log(`Added ${dataScientistQuestions.length} Data Scientist questions`);

// ===== PRODUCT DESIGNER - Add 30 questions (currently 15, need 45) =====
const designerQuestions = [
  // Junior - Behavioral (4)
  createQuestion("Product Designer", "Junior", "Behavioral", "Tell me about a time you received critical feedback on a design.", "Context → Feedback → Response → Changes → Outcome → Learning", ["Defensive", "No changes", "No learning"], 90),
  createQuestion("Product Designer", "Junior", "Behavioral", "Describe a time you had to work with a design constraint.", "Context → Constraint → Approach → Solution → Outcome", ["No approach", "No solution", "No outcome"], 90),
  createQuestion("Product Designer", "Junior", "Behavioral", "Tell me about a time you had to learn a new design tool quickly.", "Context → Tool → Learning approach → Application → Outcome", ["No approach", "No application", "No outcome"], 90),
  createQuestion("Product Designer", "Junior", "Behavioral", "How do you handle conflicting feedback from stakeholders?", "Approach → Analysis → Prioritization → Communication → Resolution", ["No prioritization", "No communication", "No resolution"], 90),
  
  // Junior - Technical (7)
  createQuestion("Product Designer", "Junior", "Technical", "What is user-centered design?", "Definition → Principles → Process → Examples → Benefits", ["Incorrect definition", "No examples", "No benefits"], 90),
  createQuestion("Product Designer", "Junior", "Technical", "Explain the difference between UX and UI design.", "Definitions → Focus areas → Relationship → Examples → Collaboration", ["Confuses concepts", "No examples", "No collaboration"], 90),
  createQuestion("Product Designer", "Junior", "Technical", "What are wireframes and when do you use them?", "Definition → Purpose → Types → Process → Examples", ["No definition", "No purpose", "No examples"], 90),
  createQuestion("Product Designer", "Junior", "Technical", "Explain what a design system is.", "Definition → Components → Benefits → Examples → Implementation", ["No definition", "No benefits", "No examples"], 90),
  createQuestion("Product Designer", "Junior", "Technical", "What is information architecture?", "Definition → Purpose → Methods → Examples → Benefits", ["Incorrect definition", "No examples", "No benefits"], 90),
  createQuestion("Product Designer", "Junior", "Technical", "Explain the difference between low-fidelity and high-fidelity prototypes.", "Definitions → Use cases → Tools → Process → Examples", ["Confuses concepts", "No examples", "No use cases"], 90),
  createQuestion("Product Designer", "Junior", "Technical", "What is usability testing?", "Definition → Purpose → Methods → Process → Examples", ["Incorrect definition", "No methods", "No examples"], 90),
  
  // Junior - System Design/Process (3)
  createQuestion("Product Designer", "Junior", "Process", "How would you design a mobile app onboarding flow?", "Requirements → Steps → Content → Interactions → Testing", ["No steps", "No testing", "No interactions"], 120),
  createQuestion("Product Designer", "Junior", "Process", "Design a checkout process for an e-commerce site.", "Requirements → Steps → Fields → Validation → Error handling → UX", ["No validation", "No error handling", "Poor UX"], 120),
  createQuestion("Product Designer", "Junior", "Process", "How would you approach redesigning a navigation menu?", "Research → Current state → Problems → Solutions → Testing → Implementation", ["No research", "No testing", "No solutions"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("Product Designer", "Mid", "Behavioral", "Tell me about a time you had to defend a design decision.", "Context → Decision → Reasoning → Communication → Outcome → Learning", ["No reasoning", "No communication", "No learning"], 120),
  createQuestion("Product Designer", "Mid", "Behavioral", "Describe a time you had to work with limited user research data.", "Context → Data available → Approach → Assumptions → Validation → Outcome", ["No approach", "No validation", "No outcome"], 120),
  createQuestion("Product Designer", "Mid", "Behavioral", "Tell me about a time you had to balance user needs with business constraints.", "Context → Needs → Constraints → Trade-offs → Solution → Outcome", ["No trade-offs", "No solution", "No outcome"], 120),
  createQuestion("Product Designer", "Mid", "Behavioral", "Describe a time you had to iterate on a design based on user feedback.", "Context → Feedback → Analysis → Iteration → Testing → Outcome", ["No analysis", "No testing", "No outcome"], 120),
  createQuestion("Product Designer", "Mid", "Behavioral", "Tell me about a time you had to work with a tight deadline on a design project.", "Context → Timeline → Approach → Prioritization → Outcome → Learning", ["No approach", "No prioritization", "No learning"], 120),
  createQuestion("Product Designer", "Mid", "Behavioral", "Describe a time you had to collaborate with engineers on a complex design.", "Context → Complexity → Collaboration → Challenges → Solution → Outcome", ["No collaboration", "No solution", "No outcome"], 120),
  createQuestion("Product Designer", "Mid", "Behavioral", "Tell me about a time you had to learn from a design failure.", "Context → Design → Failure → Analysis → Learning → Prevention", ["No analysis", "No learning", "No prevention"], 120),
  
  // Mid - Technical (11)
  createQuestion("Product Designer", "Mid", "Technical", "How do you conduct user research?", "Methods → Planning → Execution → Analysis → Insights → Application", ["No methods", "No analysis", "No application"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "Explain how you create user personas.", "Purpose → Research → Creation → Application → Validation → Updates", ["No research", "No validation", "No application"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "How do you design for accessibility?", "Standards → Guidelines → Implementation → Testing → Validation", ["No standards", "No testing", "No validation"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "Explain how you create and use design prototypes.", "Types → Tools → Fidelity → Testing → Iteration → Handoff", ["No types", "No testing", "No iteration"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "How do you measure design success?", "Metrics → User testing → Analytics → Feedback → Iteration", ["No metrics", "No testing", "No iteration"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "Explain how you create a design system.", "Planning → Components → Tokens → Documentation → Implementation → Maintenance", ["No planning", "No documentation", "No maintenance"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "How do you handle responsive design across devices?", "Approach → Breakpoints → Layout → Components → Testing → Optimization", ["No approach", "No testing", "No optimization"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "Explain how you design for different user types.", "User types → Needs → Personas → Design → Testing → Validation", ["No user types", "No testing", "No validation"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "How do you create effective user flows?", "Research → Mapping → Steps → Interactions → Testing → Optimization", ["No research", "No testing", "No optimization"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "Explain how you use data to inform design decisions.", "Data sources → Analysis → Insights → Design → Testing → Validation", ["No sources", "No analysis", "No validation"], 120),
  createQuestion("Product Designer", "Mid", "Technical", "How do you design for mobile vs desktop experiences?", "Differences → Constraints → Approaches → Testing → Optimization", ["No differences", "No testing", "No optimization"], 120),
  
  // Mid - System Design/Process (4)
  createQuestion("Product Designer", "Mid", "Process", "Design a user onboarding experience for a SaaS product.", "Requirements → Steps → Content → Interactions → Testing → Iteration", ["No steps", "No testing", "No iteration"], 180),
  createQuestion("Product Designer", "Mid", "Process", "How would you design a dashboard for data visualization?", "Requirements → Users → Data → Layout → Interactions → Testing", ["No users", "No testing", "No interactions"], 180),
  createQuestion("Product Designer", "Mid", "Process", "Design a search and filter interface for an e-commerce site.", "Requirements → Search → Filters → Results → UX → Testing", ["No search", "No testing", "Poor UX"], 180),
  createQuestion("Product Designer", "Mid", "Process", "How would you approach designing a mobile-first application?", "Research → Constraints → Approach → Design → Testing → Optimization", ["No research", "No testing", "No optimization"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("Product Designer", "Senior", "Behavioral", "Tell me about a time you had to establish design processes for a team.", "Context → Processes → Implementation → Challenges → Outcome → Learning", ["No processes", "No outcome", "No learning"], 150),
  createQuestion("Product Designer", "Senior", "Behavioral", "Describe a time you had to influence product strategy through design.", "Context → Strategy → Design input → Communication → Outcome → Learning", ["No input", "No communication", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("Product Designer", "Senior", "Technical", "How do you establish design principles for a product?", "Research → Principles → Documentation → Application → Validation → Evolution", ["No research", "No validation", "No application"], 180),
  createQuestion("Product Designer", "Senior", "Technical", "Explain how you design for scale across multiple products.", "Approach → Systems → Consistency → Governance → Maintenance → Evolution", ["No systems", "No governance", "No maintenance"], 180),
  createQuestion("Product Designer", "Senior", "Technical", "How do you measure the impact of design changes?", "Metrics → Methods → Analysis → Insights → Action → Validation", ["No metrics", "No analysis", "No validation"], 180),
  createQuestion("Product Designer", "Senior", "Technical", "Explain how you design for international audiences.", "Research → Localization → Cultural considerations → Testing → Validation → Iteration", ["No research", "No testing", "No validation"], 180),
  createQuestion("Product Designer", "Senior", "Technical", "How do you design for different user skill levels?", "User types → Needs → Approaches → Testing → Validation → Iteration", ["No user types", "No testing", "No validation"], 180),
  
  // Senior - System Design/Strategy (2)
  createQuestion("Product Designer", "Senior", "Strategy", "Design a comprehensive design system for a large organization.", "Requirements → Architecture → Components → Documentation → Governance → Evolution", ["No architecture", "No governance", "No evolution"], 300),
  createQuestion("Product Designer", "Senior", "Strategy", "How would you design a product strategy that prioritizes user experience?", "Research → Strategy → Design → Implementation → Measurement → Iteration", ["No research", "No measurement", "No iteration"], 300)
];

allQuestions.push(...designerQuestions);
console.log(`Added ${designerQuestions.length} Product Designer questions`);

// ===== DATA ENGINEER - Add 31 questions (currently 14, need 45) =====
const dataEngineerQuestions = [
  // Junior - Behavioral (4)
  createQuestion("Data Engineer", "Junior", "Behavioral", "Tell me about a time you had to work with a large dataset.", "Context → Size → Challenges → Approach → Solution → Outcome", ["No approach", "No solution", "No outcome"], 90),
  createQuestion("Data Engineer", "Junior", "Behavioral", "Describe a time you had to learn a new data tool or technology.", "Context → Tool → Learning approach → Application → Outcome → Learning", ["No approach", "No application", "No learning"], 90),
  createQuestion("Data Engineer", "Junior", "Behavioral", "Tell me about a time you had to debug a data pipeline issue.", "Context → Problem → Debugging → Solution → Prevention → Learning", ["No debugging", "No solution", "No learning"], 90),
  createQuestion("Data Engineer", "Junior", "Behavioral", "How do you handle working with incomplete or messy data?", "Approach → Validation → Cleaning → Documentation → Examples → Learning", ["No validation", "No cleaning", "No learning"], 90),
  
  // Junior - Technical (7)
  createQuestion("Data Engineer", "Junior", "Technical", "What is ETL and how does it work?", "Definition → Extract → Transform → Load → Examples → Use cases", ["Incorrect definition", "No examples", "No use cases"], 90),
  createQuestion("Data Engineer", "Junior", "Technical", "Explain the difference between a data warehouse and a data lake.", "Definitions → Use cases → Trade-offs → Examples → When to use", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Data Engineer", "Junior", "Technical", "What is SQL and when would you use it?", "Definition → Purpose → Use cases → Examples → Alternatives", ["Incorrect definition", "No use cases", "No examples"], 90),
  createQuestion("Data Engineer", "Junior", "Technical", "Explain what a database index is.", "Definition → Purpose → Types → Trade-offs → Examples", ["Incorrect definition", "No trade-offs", "No examples"], 90),
  createQuestion("Data Engineer", "Junior", "Technical", "What is data normalization?", "Definition → Purpose → Normal forms → Examples → Trade-offs", ["Incorrect definition", "No examples", "No trade-offs"], 90),
  createQuestion("Data Engineer", "Junior", "Technical", "Explain the difference between OLTP and OLAP.", "Definitions → Use cases → Trade-offs → Examples → When to use", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Data Engineer", "Junior", "Technical", "What is a data pipeline?", "Definition → Components → Purpose → Examples → Monitoring", ["Incorrect definition", "No examples", "No monitoring"], 90),
  
  // Junior - System Design (3)
  createQuestion("Data Engineer", "Junior", "System Design", "How would you design a simple data pipeline?", "Requirements → Sources → Processing → Storage → Monitoring", ["No processing", "No storage", "No monitoring"], 120),
  createQuestion("Data Engineer", "Junior", "System Design", "Design a basic data warehouse structure.", "Requirements → Schema → Tables → Relationships → Queries", ["No schema", "No relationships", "No queries"], 120),
  createQuestion("Data Engineer", "Junior", "System Design", "How would you design a simple ETL process?", "Requirements → Extract → Transform → Load → Error handling → Monitoring", ["No error handling", "No monitoring", "Incomplete process"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("Data Engineer", "Mid", "Behavioral", "Tell me about a time you had to optimize a slow-running data pipeline.", "Context → Performance issue → Analysis → Optimization → Results → Learning", ["No analysis", "No results", "No learning"], 120),
  createQuestion("Data Engineer", "Mid", "Behavioral", "Describe a time you had to handle a data quality issue in production.", "Context → Issue → Impact → Resolution → Prevention → Learning", ["No resolution", "No prevention", "No learning"], 120),
  createQuestion("Data Engineer", "Mid", "Behavioral", "Tell me about a time you had to work with stakeholders to understand data requirements.", "Context → Stakeholders → Requirements → Communication → Solution → Outcome", ["No communication", "No solution", "No outcome"], 120),
  createQuestion("Data Engineer", "Mid", "Behavioral", "Describe a time you had to migrate data from one system to another.", "Context → Source → Destination → Challenges → Approach → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  createQuestion("Data Engineer", "Mid", "Behavioral", "Tell me about a time you had to design a data solution under time constraints.", "Context → Constraints → Approach → Trade-offs → Solution → Outcome", ["No approach", "No trade-offs", "No outcome"], 120),
  createQuestion("Data Engineer", "Mid", "Behavioral", "Describe a time you had to troubleshoot a complex data pipeline failure.", "Context → Failure → Investigation → Root cause → Fix → Prevention → Learning", ["No investigation", "No fix", "No learning"], 120),
  createQuestion("Data Engineer", "Mid", "Behavioral", "Tell me about a time you had to balance data quality with processing speed.", "Context → Requirements → Trade-offs → Decision → Implementation → Outcome", ["No trade-offs", "No decision", "No outcome"], 120),
  
  // Mid - Technical (11)
  createQuestion("Data Engineer", "Mid", "Technical", "How do you design a data model for a data warehouse?", "Approach → Dimensional modeling → Facts → Dimensions → Schema → Optimization", ["No approach", "No schema", "No optimization"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "Explain how you implement data quality checks.", "Types → Implementation → Monitoring → Alerts → Remediation → Documentation", ["No types", "No monitoring", "No remediation"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "How do you handle schema evolution in data pipelines?", "Approach → Versioning → Backward compatibility → Migration → Validation → Monitoring", ["No versioning", "No validation", "No monitoring"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "Explain how you optimize query performance in a data warehouse.", "Approach → Indexing → Partitioning → Query optimization → Monitoring → Tuning", ["No approach", "No monitoring", "No optimization"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "How do you implement incremental data loading?", "Approach → Change detection → Timestamps → CDC → Validation → Monitoring", ["No approach", "No validation", "No monitoring"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "Explain how you handle data lineage and metadata management.", "Approach → Lineage tracking → Metadata → Catalog → Documentation → Governance", ["No approach", "No documentation", "No governance"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "How do you design for data security and privacy?", "Requirements → Encryption → Access control → Compliance → Monitoring → Auditing", ["No encryption", "No access control", "No compliance"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "Explain how you implement data partitioning strategies.", "Approach → Partition types → Key selection → Benefits → Trade-offs → Examples", ["No approach", "No trade-offs", "No examples"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "How do you handle data deduplication?", "Approach → Methods → Keys → Performance → Validation → Monitoring", ["No approach", "No validation", "No monitoring"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "Explain how you implement data versioning.", "Approach → Strategies → Storage → Retrieval → Trade-offs → Examples", ["No approach", "No trade-offs", "No examples"], 120),
  createQuestion("Data Engineer", "Mid", "Technical", "How do you design for data scalability?", "Approach → Horizontal scaling → Vertical scaling → Partitioning → Caching → Monitoring", ["No approach", "No monitoring", "No scaling"], 120),
  
  // Mid - System Design (4)
  createQuestion("Data Engineer", "Mid", "System Design", "Design a real-time data streaming pipeline.", "Requirements → Architecture → Processing → Storage → Latency → Monitoring", ["No architecture", "No latency", "No monitoring"], 180),
  createQuestion("Data Engineer", "Mid", "System Design", "How would you design a data lake architecture?", "Requirements → Storage → Formats → Catalog → Processing → Governance", ["No storage", "No governance", "No catalog"], 180),
  createQuestion("Data Engineer", "Mid", "System Design", "Design a data pipeline for handling multiple data sources.", "Requirements → Sources → Integration → Processing → Storage → Monitoring", ["No integration", "No processing", "No monitoring"], 180),
  createQuestion("Data Engineer", "Mid", "System Design", "How would you design a data quality monitoring system?", "Requirements → Checks → Alerts → Dashboards → Remediation → Reporting", ["No checks", "No alerts", "No remediation"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("Data Engineer", "Senior", "Behavioral", "Tell me about a time you had to design a data architecture for a large organization.", "Context → Requirements → Architecture → Implementation → Challenges → Outcome → Learning", ["No architecture", "No outcome", "No learning"], 150),
  createQuestion("Data Engineer", "Senior", "Behavioral", "Describe a time you had to lead a data engineering project.", "Context → Project → Leadership → Challenges → Outcome → Learning", ["No leadership", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("Data Engineer", "Senior", "Technical", "How do you design a data platform for multiple teams?", "Requirements → Architecture → Isolation → Governance → Self-service → Monitoring", ["No architecture", "No governance", "No monitoring"], 180),
  createQuestion("Data Engineer", "Senior", "Technical", "Explain how you implement data governance at scale.", "Approach → Policies → Enforcement → Monitoring → Compliance → Evolution", ["No approach", "No enforcement", "No compliance"], 180),
  createQuestion("Data Engineer", "Senior", "Technical", "How do you design for multi-region data replication?", "Requirements → Architecture → Consistency → Latency → Failover → Monitoring", ["No architecture", "No failover", "No monitoring"], 180),
  createQuestion("Data Engineer", "Senior", "Technical", "Explain how you optimize data platform costs.", "Analysis → Strategies → Right-sizing → Caching → Lifecycle → Monitoring", ["No analysis", "No strategies", "No monitoring"], 180),
  createQuestion("Data Engineer", "Senior", "Technical", "How do you design for data disaster recovery?", "Requirements → Backup → Replication → RTO → RPO → Testing → Documentation", ["No backup", "No testing", "No documentation"], 180),
  
  // Senior - System Design (2)
  createQuestion("Data Engineer", "Senior", "System Design", "Design a comprehensive data platform for analytics and ML.", "Requirements → Architecture → Storage → Processing → Serving → Governance → Monitoring", ["No architecture", "No governance", "No monitoring"], 300),
  createQuestion("Data Engineer", "Senior", "System Design", "How would you design a data mesh architecture?", "Requirements → Principles → Domain ownership → Infrastructure → Governance → Evolution", ["No principles", "No governance", "No evolution"], 300)
];

allQuestions.push(...dataEngineerQuestions);
console.log(`Added ${dataEngineerQuestions.length} Data Engineer questions`);

// ===== DEVOPS ENGINEER - Add 45 questions (new role) =====
const devopsQuestions = [
  // Junior - Behavioral (4)
  createQuestion("DevOps Engineer", "Junior", "Behavioral", "Tell me about a time you had to learn a new DevOps tool quickly.", "Context → Tool → Learning approach → Application → Outcome → Learning", ["No approach", "No application", "No learning"], 90),
  createQuestion("DevOps Engineer", "Junior", "Behavioral", "Describe a time you had to work with a production incident.", "Context → Incident → Response → Resolution → Prevention → Learning", ["No response", "No resolution", "No learning"], 90),
  createQuestion("DevOps Engineer", "Junior", "Behavioral", "Tell me about a time you had to automate a manual process.", "Context → Process → Automation → Benefits → Outcome → Learning", ["No automation", "No benefits", "No learning"], 90),
  createQuestion("DevOps Engineer", "Junior", "Behavioral", "How do you handle working under pressure during a production outage?", "Approach → Process → Communication → Resolution → Post-mortem → Learning", ["No process", "No communication", "No learning"], 90),
  
  // Junior - Technical (7)
  createQuestion("DevOps Engineer", "Junior", "Technical", "What is CI/CD and why is it important?", "Definition → Continuous Integration → Continuous Deployment → Benefits → Examples", ["Incorrect definition", "No benefits", "No examples"], 90),
  createQuestion("DevOps Engineer", "Junior", "Technical", "Explain what Docker is and how it works.", "Definition → Containers → Images → Benefits → Use cases → Examples", ["Incorrect definition", "No use cases", "No examples"], 90),
  createQuestion("DevOps Engineer", "Junior", "Technical", "What is version control and why is it important?", "Definition → Purpose → Benefits → Examples → Best practices", ["Incorrect definition", "No benefits", "No examples"], 90),
  createQuestion("DevOps Engineer", "Junior", "Technical", "Explain what infrastructure as code means.", "Definition → Benefits → Tools → Examples → Best practices", ["Incorrect definition", "No benefits", "No examples"], 90),
  createQuestion("DevOps Engineer", "Junior", "Technical", "What is a load balancer and when would you use it?", "Definition → Purpose → Types → Use cases → Examples → Benefits", ["Incorrect definition", "No use cases", "No examples"], 90),
  createQuestion("DevOps Engineer", "Junior", "Technical", "Explain what monitoring and logging are.", "Definitions → Purpose → Tools → Examples → Benefits → Best practices", ["Incorrect definitions", "No examples", "No benefits"], 90),
  createQuestion("DevOps Engineer", "Junior", "Technical", "What is cloud computing and what are its benefits?", "Definition → Models → Benefits → Use cases → Examples → Trade-offs", ["Incorrect definition", "No benefits", "No examples"], 90),
  
  // Junior - System Design (3)
  createQuestion("DevOps Engineer", "Junior", "System Design", "How would you design a simple CI/CD pipeline?", "Requirements → Stages → Tools → Testing → Deployment → Monitoring", ["No stages", "No testing", "No monitoring"], 120),
  createQuestion("DevOps Engineer", "Junior", "System Design", "Design a basic containerized application deployment.", "Requirements → Containers → Orchestration → Networking → Storage → Monitoring", ["No containers", "No monitoring", "No orchestration"], 120),
  createQuestion("DevOps Engineer", "Junior", "System Design", "How would you set up basic monitoring for an application?", "Requirements → Metrics → Logs → Alerts → Dashboards → Response", ["No metrics", "No alerts", "No response"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("DevOps Engineer", "Mid", "Behavioral", "Tell me about a time you had to troubleshoot a complex production issue.", "Context → Problem → Investigation → Root cause → Resolution → Prevention → Learning", ["No investigation", "No resolution", "No learning"], 120),
  createQuestion("DevOps Engineer", "Mid", "Behavioral", "Describe a time you had to implement a zero-downtime deployment.", "Context → Requirements → Approach → Challenges → Solution → Outcome → Learning", ["No approach", "No solution", "No learning"], 120),
  createQuestion("DevOps Engineer", "Mid", "Behavioral", "Tell me about a time you had to optimize infrastructure costs.", "Context → Current costs → Analysis → Optimization → Results → Learning", ["No analysis", "No results", "No learning"], 120),
  createQuestion("DevOps Engineer", "Mid", "Behavioral", "Describe a time you had to work with a security vulnerability.", "Context → Vulnerability → Impact → Response → Fix → Prevention → Learning", ["No response", "No fix", "No learning"], 120),
  createQuestion("DevOps Engineer", "Mid", "Behavioral", "Tell me about a time you had to scale infrastructure quickly.", "Context → Demand → Challenges → Approach → Scaling → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  createQuestion("DevOps Engineer", "Mid", "Behavioral", "Describe a time you had to migrate infrastructure to a new platform.", "Context → Source → Destination → Challenges → Approach → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  createQuestion("DevOps Engineer", "Mid", "Behavioral", "Tell me about a time you had to balance security with developer productivity.", "Context → Requirements → Trade-offs → Solution → Outcome → Learning", ["No trade-offs", "No solution", "No learning"], 120),
  
  // Mid - Technical (11)
  createQuestion("DevOps Engineer", "Mid", "Technical", "How do you implement infrastructure as code?", "Approach → Tools → Templates → Versioning → Testing → Deployment", ["No approach", "No testing", "No deployment"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "Explain how you design a CI/CD pipeline.", "Stages → Build → Test → Deploy → Monitoring → Rollback → Best practices", ["No stages", "No monitoring", "No rollback"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "How do you implement container orchestration?", "Approach → Kubernetes → Docker Swarm → Services → Scaling → Monitoring", ["No approach", "No scaling", "No monitoring"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "Explain how you implement monitoring and alerting.", "Metrics → Logs → APM → Alerts → Dashboards → Response → Best practices", ["No metrics", "No alerts", "No response"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "How do you implement secrets management?", "Approach → Tools → Storage → Access control → Rotation → Auditing", ["No approach", "No rotation", "No auditing"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "Explain how you implement disaster recovery.", "Requirements → Backup → Replication → RTO → RPO → Testing → Documentation", ["No backup", "No testing", "No documentation"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "How do you implement blue-green deployments?", "Approach → Architecture → Switchover → Rollback → Testing → Monitoring", ["No approach", "No rollback", "No monitoring"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "Explain how you implement auto-scaling.", "Approach → Metrics → Policies → Scaling → Cooldown → Monitoring → Optimization", ["No approach", "No monitoring", "No optimization"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "How do you implement network security?", "Approach → Firewalls → VPCs → Security groups → Encryption → Monitoring", ["No approach", "No encryption", "No monitoring"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "Explain how you implement configuration management.", "Approach → Tools → Templates → Versioning → Testing → Deployment → Best practices", ["No approach", "No testing", "No deployment"], 120),
  createQuestion("DevOps Engineer", "Mid", "Technical", "How do you implement log aggregation and analysis?", "Approach → Collection → Storage → Analysis → Search → Alerts → Retention", ["No approach", "No alerts", "No retention"], 120),
  
  // Mid - System Design (4)
  createQuestion("DevOps Engineer", "Mid", "System Design", "Design a multi-region deployment strategy.", "Requirements → Architecture → Replication → Failover → Latency → Monitoring", ["No architecture", "No failover", "No monitoring"], 180),
  createQuestion("DevOps Engineer", "Mid", "System Design", "How would you design a container orchestration platform?", "Requirements → Architecture → Scheduling → Networking → Storage → Monitoring", ["No architecture", "No scheduling", "No monitoring"], 180),
  createQuestion("DevOps Engineer", "Mid", "System Design", "Design a CI/CD platform for multiple teams.", "Requirements → Architecture → Isolation → Security → Scalability → Monitoring", ["No architecture", "No security", "No monitoring"], 180),
  createQuestion("DevOps Engineer", "Mid", "System Design", "How would you design a monitoring and observability platform?", "Requirements → Metrics → Logs → Traces → Dashboards → Alerts → Analysis", ["No metrics", "No alerts", "No analysis"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("DevOps Engineer", "Senior", "Behavioral", "Tell me about a time you had to design a DevOps strategy for a large organization.", "Context → Requirements → Strategy → Implementation → Challenges → Outcome → Learning", ["No strategy", "No outcome", "No learning"], 150),
  createQuestion("DevOps Engineer", "Senior", "Behavioral", "Describe a time you had to lead a major infrastructure migration.", "Context → Migration → Leadership → Challenges → Outcome → Learning", ["No leadership", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("DevOps Engineer", "Senior", "Technical", "How do you design a cloud-native architecture?", "Requirements → Architecture → Services → Networking → Security → Scalability → Monitoring", ["No architecture", "No security", "No monitoring"], 180),
  createQuestion("DevOps Engineer", "Senior", "Technical", "Explain how you implement GitOps practices.", "Approach → Principles → Tools → Workflow → Benefits → Best practices → Challenges", ["No approach", "No benefits", "No challenges"], 180),
  createQuestion("DevOps Engineer", "Senior", "Technical", "How do you design for high availability?", "Requirements → Architecture → Redundancy → Failover → Testing → Monitoring → Documentation", ["No architecture", "No testing", "No monitoring"], 180),
  createQuestion("DevOps Engineer", "Senior", "Technical", "Explain how you implement service mesh architecture.", "Approach → Components → Benefits → Use cases → Trade-offs → Implementation", ["No approach", "No trade-offs", "No implementation"], 180),
  createQuestion("DevOps Engineer", "Senior", "Technical", "How do you design for cost optimization in the cloud?", "Analysis → Strategies → Right-sizing → Reserved instances → Monitoring → Optimization", ["No analysis", "No strategies", "No monitoring"], 180),
  
  // Senior - System Design (2)
  createQuestion("DevOps Engineer", "Senior", "System Design", "Design a comprehensive DevOps platform for an enterprise.", "Requirements → Architecture → CI/CD → Infrastructure → Security → Monitoring → Governance", ["No architecture", "No governance", "No monitoring"], 300),
  createQuestion("DevOps Engineer", "Senior", "System Design", "How would you design a multi-cloud infrastructure strategy?", "Requirements → Architecture → Providers → Networking → Security → Cost → Governance", ["No architecture", "No governance", "No security"], 300)
];

allQuestions.push(...devopsQuestions);
console.log(`Added ${devopsQuestions.length} DevOps Engineer questions`);

// ===== FULL STACK ENGINEER - Add 45 questions (new role) =====
const fullStackQuestions = [
  // Junior - Behavioral (4)
  createQuestion("Full Stack Engineer", "Junior", "Behavioral", "Tell me about a time you had to work on both frontend and backend for a feature.", "Context → Feature → Frontend work → Backend work → Integration → Outcome", ["No integration", "No outcome", "No learning"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Behavioral", "Describe a time you had to learn a new full-stack framework.", "Context → Framework → Learning approach → Application → Outcome → Learning", ["No approach", "No application", "No learning"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Behavioral", "Tell me about a time you had to debug an issue that spanned frontend and backend.", "Context → Problem → Investigation → Root cause → Fix → Prevention → Learning", ["No investigation", "No fix", "No learning"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Behavioral", "How do you balance working on frontend vs backend tasks?", "Approach → Prioritization → Skills → Examples → Learning", ["No prioritization", "No examples", "No learning"], 90),
  
  // Junior - Technical (7)
  createQuestion("Full Stack Engineer", "Junior", "Technical", "Explain the difference between frontend and backend development.", "Definitions → Responsibilities → Technologies → Examples → Collaboration", ["Confuses concepts", "No examples", "No collaboration"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Technical", "What is an API and how does it connect frontend and backend?", "Definition → Purpose → How it works → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Technical", "Explain what RESTful APIs are.", "Definition → Principles → HTTP methods → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Technical", "What is the difference between client-side and server-side rendering?", "Definitions → Use cases → Trade-offs → Examples → When to use", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Technical", "Explain what authentication and authorization are.", "Definitions → Differences → Implementation → Examples → Security", ["Confuses concepts", "No examples", "No security"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Technical", "What is a database and how does it work with applications?", "Definition → Types → How it works → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("Full Stack Engineer", "Junior", "Technical", "Explain what session management is.", "Definition → Purpose → Implementation → Security → Examples", ["Incorrect definition", "No security", "No examples"], 90),
  
  // Junior - System Design (3)
  createQuestion("Full Stack Engineer", "Junior", "System Design", "How would you design a simple full-stack application?", "Requirements → Frontend → Backend → Database → API → Deployment", ["No API", "No deployment", "No database"], 120),
  createQuestion("Full Stack Engineer", "Junior", "System Design", "Design a basic user authentication system.", "Requirements → Frontend → Backend → Database → Security → Session management", ["No security", "No session management", "Incomplete design"], 120),
  createQuestion("Full Stack Engineer", "Junior", "System Design", "How would you structure a full-stack project?", "Structure → Frontend → Backend → Shared → Configuration → Best practices", ["No structure", "No best practices", "No configuration"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("Full Stack Engineer", "Mid", "Behavioral", "Tell me about a time you had to optimize a full-stack application for performance.", "Context → Performance issues → Analysis → Frontend optimization → Backend optimization → Results → Learning", ["No analysis", "No results", "No learning"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Behavioral", "Describe a time you had to implement a feature that required changes across the stack.", "Context → Feature → Frontend changes → Backend changes → Integration → Testing → Outcome", ["No integration", "No testing", "No outcome"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Behavioral", "Tell me about a time you had to work with a team where you were the only full-stack developer.", "Context → Challenges → Approach → Collaboration → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Behavioral", "Describe a time you had to choose between frontend and backend solutions for a problem.", "Context → Problem → Options → Decision → Rationale → Outcome → Learning", ["No options", "No rationale", "No learning"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Behavioral", "Tell me about a time you had to refactor code across the full stack.", "Context → Code → Refactoring approach → Frontend → Backend → Testing → Outcome", ["No approach", "No testing", "No outcome"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Behavioral", "Describe a time you had to debug a complex issue involving multiple layers.", "Context → Issue → Investigation → Frontend → Backend → Database → Resolution → Learning", ["No investigation", "No resolution", "No learning"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Behavioral", "Tell me about a time you had to learn a new technology stack quickly.", "Context → Stack → Learning approach → Application → Challenges → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  
  // Mid - Technical (11)
  createQuestion("Full Stack Engineer", "Mid", "Technical", "How do you design API contracts between frontend and backend?", "Approach → Design → Documentation → Versioning → Testing → Best practices", ["No approach", "No testing", "No documentation"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "Explain how you implement state management in a full-stack application.", "Approach → Frontend state → Backend state → Synchronization → Examples → Best practices", ["No approach", "No examples", "No synchronization"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "How do you handle errors across the full stack?", "Approach → Frontend errors → Backend errors → API errors → Logging → User experience", ["No approach", "No logging", "Poor UX"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "Explain how you implement real-time features in a full-stack app.", "Approach → WebSockets → Server-sent events → Polling → Trade-offs → Examples", ["No approach", "No trade-offs", "No examples"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "How do you optimize database queries in a full-stack application?", "Approach → Indexing → Query optimization → Caching → Monitoring → Best practices", ["No approach", "No monitoring", "No optimization"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "Explain how you implement caching strategies across the stack.", "Approach → Frontend caching → Backend caching → Database caching → Invalidation → Examples", ["No approach", "No invalidation", "No examples"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "How do you implement security in a full-stack application?", "Approach → Frontend security → Backend security → API security → Authentication → Authorization → Best practices", ["No approach", "No authentication", "No best practices"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "Explain how you implement testing across the full stack.", "Approach → Frontend testing → Backend testing → Integration testing → E2E testing → Best practices", ["No approach", "No integration", "No best practices"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "How do you handle file uploads in a full-stack application?", "Approach → Frontend → Backend → Storage → Validation → Security → Examples", ["No approach", "No security", "No examples"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "Explain how you implement search functionality.", "Approach → Frontend → Backend → Database → Indexing → Ranking → Examples", ["No approach", "No indexing", "No examples"], 120),
  createQuestion("Full Stack Engineer", "Mid", "Technical", "How do you implement pagination in a full-stack application?", "Approach → Frontend → Backend → Database → Performance → UX → Examples", ["No approach", "No performance", "No examples"], 120),
  
  // Mid - System Design (4)
  createQuestion("Full Stack Engineer", "Mid", "System Design", "Design a full-stack e-commerce application.", "Requirements → Frontend → Backend → Database → Payment → Security → Scalability", ["No security", "No scalability", "Incomplete design"], 180),
  createQuestion("Full Stack Engineer", "Mid", "System Design", "How would you design a real-time chat application?", "Requirements → Frontend → Backend → Real-time → Storage → Scalability → Security", ["No real-time", "No scalability", "No security"], 180),
  createQuestion("Full Stack Engineer", "Mid", "System Design", "Design a full-stack social media application.", "Requirements → Frontend → Backend → Database → Features → Scalability → Security", ["No scalability", "No security", "Incomplete design"], 180),
  createQuestion("Full Stack Engineer", "Mid", "System Design", "How would you design a full-stack content management system?", "Requirements → Frontend → Backend → Database → Admin → Security → Performance", ["No security", "No performance", "Incomplete design"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("Full Stack Engineer", "Senior", "Behavioral", "Tell me about a time you had to architect a full-stack solution for a complex problem.", "Context → Problem → Architecture → Frontend → Backend → Integration → Outcome → Learning", ["No architecture", "No outcome", "No learning"], 150),
  createQuestion("Full Stack Engineer", "Senior", "Behavioral", "Describe a time you had to mentor junior developers on full-stack development.", "Context → Mentoring → Topics → Approach → Outcome → Learning", ["No approach", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("Full Stack Engineer", "Senior", "Technical", "How do you design a scalable full-stack architecture?", "Requirements → Architecture → Frontend → Backend → Database → Caching → Load balancing → Monitoring", ["No architecture", "No monitoring", "No scalability"], 180),
  createQuestion("Full Stack Engineer", "Senior", "Technical", "Explain how you implement microservices in a full-stack application.", "Approach → Architecture → Services → Communication → Frontend → Challenges → Trade-offs", ["No approach", "No trade-offs", "No challenges"], 180),
  createQuestion("Full Stack Engineer", "Senior", "Technical", "How do you implement GraphQL in a full-stack application?", "Approach → Schema → Frontend → Backend → Resolvers → Benefits → Trade-offs → Examples", ["No approach", "No trade-offs", "No examples"], 180),
  createQuestion("Full Stack Engineer", "Senior", "Technical", "Explain how you implement serverless architecture in a full-stack app.", "Approach → Architecture → Functions → Frontend → Database → Benefits → Trade-offs → Examples", ["No approach", "No trade-offs", "No examples"], 180),
  createQuestion("Full Stack Engineer", "Senior", "Technical", "How do you design for performance across the full stack?", "Approach → Frontend optimization → Backend optimization → Database optimization → Caching → Monitoring → Best practices", ["No approach", "No monitoring", "No optimization"], 180),
  
  // Senior - System Design (2)
  createQuestion("Full Stack Engineer", "Senior", "System Design", "Design a full-stack platform for multiple tenants.", "Requirements → Architecture → Frontend → Backend → Multi-tenancy → Security → Scalability → Isolation", ["No architecture", "No security", "No isolation"], 300),
  createQuestion("Full Stack Engineer", "Senior", "System Design", "How would you design a full-stack application for millions of users?", "Requirements → Architecture → Frontend → Backend → Database → Caching → CDN → Scaling → Monitoring", ["No architecture", "No scaling", "No monitoring"], 300)
];

allQuestions.push(...fullStackQuestions);
console.log(`Added ${fullStackQuestions.length} Full Stack Engineer questions`);

// ===== MOBILE ENGINEER - Add 45 questions (new role) =====
const mobileQuestions = [
  // Junior - Behavioral (4)
  createQuestion("Mobile Engineer", "Junior", "Behavioral", "Tell me about a time you had to learn a new mobile framework.", "Context → Framework → Learning approach → Application → Outcome → Learning", ["No approach", "No application", "No learning"], 90),
  createQuestion("Mobile Engineer", "Junior", "Behavioral", "Describe a time you had to fix a critical mobile app bug.", "Context → Bug → Impact → Debugging → Fix → Testing → Outcome", ["No debugging", "No testing", "No outcome"], 90),
  createQuestion("Mobile Engineer", "Junior", "Behavioral", "Tell me about a time you had to work with limited device resources.", "Context → Constraints → Approach → Optimization → Outcome → Learning", ["No approach", "No outcome", "No learning"], 90),
  createQuestion("Mobile Engineer", "Junior", "Behavioral", "How do you handle user feedback on mobile app performance?", "Approach → Collection → Analysis → Prioritization → Implementation → Validation", ["No analysis", "No prioritization", "No validation"], 90),
  
  // Junior - Technical (7)
  createQuestion("Mobile Engineer", "Junior", "Technical", "What is the difference between native and cross-platform mobile development?", "Definitions → Approaches → Trade-offs → Examples → When to use", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Mobile Engineer", "Junior", "Technical", "Explain what React Native is and how it works.", "Definition → How it works → Benefits → Use cases → Examples → Trade-offs", ["Incorrect definition", "No use cases", "No examples"], 90),
  createQuestion("Mobile Engineer", "Junior", "Technical", "What is the mobile app lifecycle?", "Definition → States → Methods → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("Mobile Engineer", "Junior", "Technical", "Explain what mobile app state management is.", "Definition → Purpose → Approaches → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("Mobile Engineer", "Junior", "Technical", "What is the difference between iOS and Android development?", "Platforms → Languages → Frameworks → Trade-offs → Examples → When to use", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("Mobile Engineer", "Junior", "Technical", "Explain what mobile app navigation is.", "Definition → Patterns → Implementation → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("Mobile Engineer", "Junior", "Technical", "What is mobile app performance optimization?", "Definition → Areas → Techniques → Examples → Best practices", ["Incorrect definition", "No techniques", "No examples"], 90),
  
  // Junior - System Design (3)
  createQuestion("Mobile Engineer", "Junior", "System Design", "How would you design a simple mobile app architecture?", "Requirements → Structure → Components → State → Navigation → Best practices", ["No structure", "No best practices", "Incomplete design"], 120),
  createQuestion("Mobile Engineer", "Junior", "System Design", "Design a basic mobile app with user authentication.", "Requirements → Screens → Authentication → API → Storage → Security", ["No security", "No API", "Incomplete design"], 120),
  createQuestion("Mobile Engineer", "Junior", "System Design", "How would you structure a mobile app project?", "Structure → Folders → Components → Services → Configuration → Best practices", ["No structure", "No best practices", "No configuration"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("Mobile Engineer", "Mid", "Behavioral", "Tell me about a time you had to optimize a slow mobile app.", "Context → Performance issues → Analysis → Optimization → Testing → Results → Learning", ["No analysis", "No results", "No learning"], 120),
  createQuestion("Mobile Engineer", "Mid", "Behavioral", "Describe a time you had to implement a feature for both iOS and Android.", "Context → Feature → Platform differences → Approach → Implementation → Testing → Outcome", ["No approach", "No testing", "No outcome"], 120),
  createQuestion("Mobile Engineer", "Mid", "Behavioral", "Tell me about a time you had to handle offline functionality in a mobile app.", "Context → Requirements → Approach → Implementation → Testing → Outcome → Learning", ["No approach", "No testing", "No learning"], 120),
  createQuestion("Mobile Engineer", "Mid", "Behavioral", "Describe a time you had to work with push notifications.", "Context → Requirements → Implementation → Testing → Challenges → Outcome → Learning", ["No implementation", "No testing", "No learning"], 120),
  createQuestion("Mobile Engineer", "Mid", "Behavioral", "Tell me about a time you had to handle different screen sizes and orientations.", "Context → Challenges → Approach → Implementation → Testing → Outcome → Learning", ["No approach", "No testing", "No learning"], 120),
  createQuestion("Mobile Engineer", "Mid", "Behavioral", "Describe a time you had to work with device-specific features.", "Context → Features → Platform differences → Implementation → Testing → Outcome → Learning", ["No implementation", "No testing", "No learning"], 120),
  createQuestion("Mobile Engineer", "Mid", "Behavioral", "Tell me about a time you had to debug a mobile app crash.", "Context → Crash → Investigation → Root cause → Fix → Testing → Prevention → Learning", ["No investigation", "No fix", "No learning"], 120),
  
  // Mid - Technical (11)
  createQuestion("Mobile Engineer", "Mid", "Technical", "How do you implement state management in a mobile app?", "Approach → Patterns → Tools → Examples → Best practices → Trade-offs", ["No approach", "No examples", "No trade-offs"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "Explain how you implement mobile app navigation.", "Approach → Patterns → Stack → Tab → Drawer → Examples → Best practices", ["No approach", "No examples", "No best practices"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "How do you handle API calls in a mobile application?", "Approach → HTTP → Error handling → Caching → Offline → Examples → Best practices", ["No error handling", "No examples", "No best practices"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "Explain how you implement local storage in mobile apps.", "Approach → Options → AsyncStorage → SQLite → Keychain → Examples → Best practices", ["No approach", "No examples", "No best practices"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "How do you implement push notifications?", "Approach → Setup → Registration → Handling → Testing → Examples → Best practices", ["No approach", "No testing", "No examples"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "Explain how you handle mobile app security.", "Approach → Authentication → Encryption → Keychain → Certificate pinning → Best practices", ["No approach", "No encryption", "No best practices"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "How do you optimize mobile app performance?", "Approach → Rendering → Memory → Network → Battery → Profiling → Best practices", ["No approach", "No profiling", "No best practices"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "Explain how you implement offline functionality.", "Approach → Data sync → Conflict resolution → Storage → UI states → Examples → Best practices", ["No approach", "No conflict resolution", "No examples"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "How do you handle different screen sizes and orientations?", "Approach → Responsive design → Layouts → Testing → Examples → Best practices", ["No approach", "No testing", "No examples"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "Explain how you implement deep linking in mobile apps.", "Approach → URL schemes → Universal links → Handling → Examples → Best practices", ["No approach", "No examples", "No best practices"], 120),
  createQuestion("Mobile Engineer", "Mid", "Technical", "How do you test mobile applications?", "Approach → Unit testing → Integration testing → UI testing → Device testing → Best practices", ["No approach", "No device testing", "No best practices"], 120),
  
  // Mid - System Design (4)
  createQuestion("Mobile Engineer", "Mid", "System Design", "Design a mobile app architecture for a social media application.", "Requirements → Architecture → Components → State → API → Offline → Performance", ["No architecture", "No performance", "Incomplete design"], 180),
  createQuestion("Mobile Engineer", "Mid", "System Design", "How would you design a mobile e-commerce application?", "Requirements → Architecture → Features → Payment → Offline → Performance → Security", ["No security", "No performance", "Incomplete design"], 180),
  createQuestion("Mobile Engineer", "Mid", "System Design", "Design a mobile app with real-time features.", "Requirements → Architecture → Real-time → State → Performance → Battery → Examples", ["No architecture", "No performance", "No examples"], 180),
  createQuestion("Mobile Engineer", "Mid", "System Design", "How would you design a cross-platform mobile application?", "Requirements → Framework → Architecture → Platform differences → Code sharing → Testing → Deployment", ["No framework", "No testing", "No deployment"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("Mobile Engineer", "Senior", "Behavioral", "Tell me about a time you had to architect a mobile app for scale.", "Context → Requirements → Architecture → Challenges → Solution → Outcome → Learning", ["No architecture", "No outcome", "No learning"], 150),
  createQuestion("Mobile Engineer", "Senior", "Behavioral", "Describe a time you had to lead a mobile app development project.", "Context → Project → Leadership → Challenges → Outcome → Learning", ["No leadership", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("Mobile Engineer", "Senior", "Technical", "How do you design a scalable mobile app architecture?", "Requirements → Architecture → Patterns → State → API → Caching → Performance → Monitoring", ["No architecture", "No monitoring", "No performance"], 180),
  createQuestion("Mobile Engineer", "Senior", "Technical", "Explain how you implement advanced mobile app features.", "Approach → Features → Implementation → Testing → Performance → Best practices → Examples", ["No approach", "No testing", "No examples"], 180),
  createQuestion("Mobile Engineer", "Senior", "Technical", "How do you design for mobile app performance at scale?", "Approach → Optimization → Profiling → Monitoring → Caching → Best practices → Examples", ["No approach", "No monitoring", "No examples"], 180),
  createQuestion("Mobile Engineer", "Senior", "Technical", "Explain how you implement mobile app analytics and monitoring.", "Approach → Analytics → Crash reporting → Performance → User behavior → Best practices → Examples", ["No approach", "No best practices", "No examples"], 180),
  createQuestion("Mobile Engineer", "Senior", "Technical", "How do you design for mobile app security at scale?", "Approach → Authentication → Encryption → Key management → Certificate pinning → Best practices → Examples", ["No approach", "No encryption", "No examples"], 180),
  
  // Senior - System Design (2)
  createQuestion("Mobile Engineer", "Senior", "System Design", "Design a mobile app platform for multiple apps.", "Requirements → Architecture → Shared components → Platform → Deployment → Monitoring → Governance", ["No architecture", "No governance", "No monitoring"], 300),
  createQuestion("Mobile Engineer", "Senior", "System Design", "How would you design a mobile app for millions of users?", "Requirements → Architecture → Scalability → Performance → Offline → Security → Monitoring", ["No architecture", "No monitoring", "No scalability"], 300)
];

allQuestions.push(...mobileQuestions);
console.log(`Added ${mobileQuestions.length} Mobile Engineer questions`);

// ===== QA ENGINEER - Add 45 questions (new role) =====
const qaQuestions = [
  // Junior - Behavioral (4)
  createQuestion("QA Engineer", "Junior", "Behavioral", "Tell me about a time you found a critical bug before release.", "Context → Bug → Discovery → Reporting → Fix → Validation → Learning", ["No reporting", "No validation", "No learning"], 90),
  createQuestion("QA Engineer", "Junior", "Behavioral", "Describe a time you had to test a feature with incomplete requirements.", "Context → Situation → Approach → Testing → Communication → Outcome → Learning", ["No approach", "No communication", "No learning"], 90),
  createQuestion("QA Engineer", "Junior", "Behavioral", "Tell me about a time you had to learn a new testing tool.", "Context → Tool → Learning approach → Application → Outcome → Learning", ["No approach", "No application", "No learning"], 90),
  createQuestion("QA Engineer", "Junior", "Behavioral", "How do you handle working with developers who disagree with your bug reports?", "Approach → Communication → Evidence → Resolution → Learning → Examples", ["No communication", "No evidence", "No learning"], 90),
  
  // Junior - Technical (7)
  createQuestion("QA Engineer", "Junior", "Technical", "What is software testing and why is it important?", "Definition → Purpose → Types → Benefits → Examples → Best practices", ["Incorrect definition", "No benefits", "No examples"], 90),
  createQuestion("QA Engineer", "Junior", "Technical", "Explain the difference between manual and automated testing.", "Definitions → Use cases → Trade-offs → Examples → When to use", ["Confuses concepts", "No examples", "No trade-offs"], 90),
  createQuestion("QA Engineer", "Junior", "Technical", "What is a test case and how do you write one?", "Definition → Structure → Components → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("QA Engineer", "Junior", "Technical", "Explain what bug tracking is.", "Definition → Purpose → Tools → Process → Examples → Best practices", ["Incorrect definition", "No tools", "No examples"], 90),
  createQuestion("QA Engineer", "Junior", "Technical", "What is regression testing?", "Definition → Purpose → When to do → Examples → Best practices", ["Incorrect definition", "No examples", "No best practices"], 90),
  createQuestion("QA Engineer", "Junior", "Technical", "Explain what black box testing is.", "Definition → Approach → Use cases → Examples → Benefits → Trade-offs", ["Incorrect definition", "No examples", "No use cases"], 90),
  createQuestion("QA Engineer", "Junior", "Technical", "What is the difference between functional and non-functional testing?", "Definitions → Types → Examples → When to use → Best practices", ["Confuses concepts", "No examples", "No best practices"], 90),
  
  // Junior - System Design (3)
  createQuestion("QA Engineer", "Junior", "System Design", "How would you design a test plan for a new feature?", "Requirements → Test cases → Test data → Environment → Execution → Reporting", ["No test cases", "No reporting", "No execution"], 120),
  createQuestion("QA Engineer", "Junior", "System Design", "Design a basic test automation framework.", "Requirements → Structure → Tools → Tests → Reporting → Maintenance", ["No structure", "No reporting", "No maintenance"], 120),
  createQuestion("QA Engineer", "Junior", "System Design", "How would you approach testing a web application?", "Requirements → Test types → Test cases → Tools → Execution → Reporting", ["No test types", "No execution", "No reporting"], 120),
  
  // Mid - Behavioral (7)
  createQuestion("QA Engineer", "Mid", "Behavioral", "Tell me about a time you had to test a complex feature with many edge cases.", "Context → Feature → Complexity → Approach → Edge cases → Testing → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  createQuestion("QA Engineer", "Mid", "Behavioral", "Describe a time you had to prioritize testing efforts with limited time.", "Context → Constraints → Prioritization → Approach → Execution → Outcome → Learning", ["No prioritization", "No outcome", "No learning"], 120),
  createQuestion("QA Engineer", "Mid", "Behavioral", "Tell me about a time you had to work with a bug that was hard to reproduce.", "Context → Bug → Challenges → Investigation → Reproduction → Reporting → Outcome → Learning", ["No investigation", "No reporting", "No learning"], 120),
  createQuestion("QA Engineer", "Mid", "Behavioral", "Describe a time you had to test a feature that was released with known issues.", "Context → Situation → Approach → Testing → Communication → Outcome → Learning", ["No approach", "No communication", "No learning"], 120),
  createQuestion("QA Engineer", "Mid", "Behavioral", "Tell me about a time you had to automate a manual testing process.", "Context → Process → Automation approach → Implementation → Benefits → Outcome → Learning", ["No approach", "No benefits", "No learning"], 120),
  createQuestion("QA Engineer", "Mid", "Behavioral", "Describe a time you had to work with developers to improve code quality.", "Context → Situation → Collaboration → Approach → Outcome → Learning", ["No collaboration", "No outcome", "No learning"], 120),
  createQuestion("QA Engineer", "Mid", "Behavioral", "Tell me about a time you had to test a feature across multiple platforms.", "Context → Feature → Platforms → Challenges → Approach → Testing → Outcome → Learning", ["No approach", "No outcome", "No learning"], 120),
  
  // Mid - Technical (11)
  createQuestion("QA Engineer", "Mid", "Technical", "How do you design test automation strategies?", "Approach → Test pyramid → Unit → Integration → E2E → Tools → Best practices", ["No approach", "No tools", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "Explain how you implement API testing.", "Approach → Tools → Test cases → Validation → Automation → Examples → Best practices", ["No approach", "No examples", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "How do you test for performance?", "Approach → Metrics → Tools → Load testing → Stress testing → Analysis → Best practices", ["No approach", "No analysis", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "Explain how you test for security vulnerabilities.", "Approach → Types → Tools → Testing → Reporting → Best practices → Examples", ["No approach", "No tools", "No examples"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "How do you implement continuous testing in CI/CD?", "Approach → Integration → Test execution → Reporting → Failures → Best practices", ["No approach", "No reporting", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "Explain how you test mobile applications.", "Approach → Platforms → Tools → Test types → Automation → Examples → Best practices", ["No approach", "No examples", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "How do you design test data management strategies?", "Approach → Data types → Generation → Management → Privacy → Best practices → Examples", ["No approach", "No privacy", "No examples"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "Explain how you implement cross-browser testing.", "Approach → Browsers → Tools → Test cases → Automation → Reporting → Best practices", ["No approach", "No automation", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "How do you test for accessibility?", "Approach → Standards → Tools → Testing → Validation → Reporting → Best practices", ["No approach", "No standards", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "Explain how you implement test reporting and metrics.", "Approach → Metrics → Dashboards → Reporting → Analysis → Action → Best practices", ["No approach", "No analysis", "No best practices"], 120),
  createQuestion("QA Engineer", "Mid", "Technical", "How do you handle flaky tests?", "Approach → Identification → Root causes → Fixes → Prevention → Monitoring → Best practices", ["No approach", "No prevention", "No best practices"], 120),
  
  // Mid - System Design (4)
  createQuestion("QA Engineer", "Mid", "System Design", "Design a comprehensive test automation framework.", "Requirements → Architecture → Tools → Test types → Reporting → Maintenance → Best practices", ["No architecture", "No maintenance", "No best practices"], 180),
  createQuestion("QA Engineer", "Mid", "System Design", "How would you design a testing strategy for a microservices architecture?", "Requirements → Approach → Test types → Integration → Tools → Reporting → Best practices", ["No approach", "No reporting", "No best practices"], 180),
  createQuestion("QA Engineer", "Mid", "System Design", "Design a performance testing strategy for a high-traffic application.", "Requirements → Approach → Load testing → Stress testing → Tools → Analysis → Optimization", ["No approach", "No analysis", "No optimization"], 180),
  createQuestion("QA Engineer", "Mid", "System Design", "How would you design a test data management system?", "Requirements → Approach → Generation → Storage → Privacy → Management → Best practices", ["No approach", "No privacy", "No best practices"], 180),
  
  // Senior - Behavioral (2)
  createQuestion("QA Engineer", "Senior", "Behavioral", "Tell me about a time you had to establish testing processes for a team.", "Context → Processes → Implementation → Challenges → Outcome → Learning", ["No processes", "No outcome", "No learning"], 150),
  createQuestion("QA Engineer", "Senior", "Behavioral", "Describe a time you had to influence product quality through testing.", "Context → Situation → Influence → Approach → Outcome → Learning", ["No approach", "No outcome", "No learning"], 150),
  
  // Senior - Technical (5)
  createQuestion("QA Engineer", "Senior", "Technical", "How do you design a comprehensive quality assurance strategy?", "Approach → Test strategy → Automation → Manual → Metrics → Reporting → Best practices", ["No approach", "No metrics", "No best practices"], 180),
  createQuestion("QA Engineer", "Senior", "Technical", "Explain how you implement shift-left testing practices.", "Approach → Principles → Implementation → Benefits → Challenges → Best practices → Examples", ["No approach", "No benefits", "No examples"], 180),
  createQuestion("QA Engineer", "Senior", "Technical", "How do you design for testability in software architecture?", "Approach → Principles → Design patterns → Implementation → Benefits → Best practices → Examples", ["No approach", "No benefits", "No examples"], 180),
  createQuestion("QA Engineer", "Senior", "Technical", "Explain how you measure and improve test effectiveness.", "Approach → Metrics → Analysis → Improvement → Validation → Best practices → Examples", ["No approach", "No analysis", "No examples"], 180),
  createQuestion("QA Engineer", "Senior", "Technical", "How do you design a quality metrics and reporting system?", "Approach → Metrics → Dashboards → Reporting → Analysis → Action → Best practices → Examples", ["No approach", "No analysis", "No examples"], 180),
  
  // Senior - System Design (2)
  createQuestion("QA Engineer", "Senior", "System Design", "Design a comprehensive quality assurance platform for an organization.", "Requirements → Architecture → Test management → Automation → Reporting → Analytics → Governance", ["No architecture", "No governance", "No analytics"], 300),
  createQuestion("QA Engineer", "Senior", "System Design", "How would you design a testing strategy for a large-scale distributed system?", "Requirements → Approach → Test types → Integration → Performance → Security → Monitoring → Best practices", ["No approach", "No monitoring", "No best practices"], 300)
];

allQuestions.push(...qaQuestions);
console.log(`Added ${qaQuestions.length} QA Engineer questions`);

// Write the complete file
const output = {
  questions: allQuestions
};

const outputPath = path.join(__dirname, '..', 'public', 'questions.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✓ Generated ${allQuestions.length} total questions`);
console.log(`✓ Saved to ${outputPath}`);

// Print summary
const roleCounts = {};
allQuestions.forEach(q => {
  roleCounts[q.role] = (roleCounts[q.role] || 0) + 1;
});

console.log('\nSummary by Role:');
Object.entries(roleCounts).sort((a, b) => b[1] - a[1]).forEach(([role, count]) => {
  console.log(`  ${role}: ${count} questions`);
});


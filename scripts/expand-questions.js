/**
 * Script to expand questions.json from 100 to 450 questions
 * Generates questions manually without using Gemini API
 */

const fs = require('fs');
const path = require('path');

// Read existing questions
const existingPath = path.join(__dirname, '..', 'public', 'questions.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
const existingQuestions = existing.questions;

console.log(`Starting with ${existingQuestions.length} existing questions`);

// Question templates for each role
const questionTemplates = {
  'Backend Engineer': {
    'Junior-Behavioral': [
      { q: "Describe a time when you had to learn a new technology quickly for a project.", f: "Situation → Challenge → Learning approach → Outcome", rf: ["No learning method", "Gave up easily", "No outcome"] },
      { q: "Tell me about a time you helped a teammate solve a technical problem.", f: "Context → Problem → Your help → Result", rf: ["No collaboration", "Took all credit", "No result"] },
      { q: "How do you handle feedback on your code during code reviews?", f: "Approach → Examples → Learning → Improvement", rf: ["Defensive", "No learning", "Ignores feedback"] }
    ],
    'Junior-Technical': [
      { q: "What is the difference between GET and POST HTTP methods?", f: "Purpose → Use cases → Idempotency → Examples", rf: ["Incorrect definitions", "No examples", "Confuses methods"] },
      { q: "Explain what a database transaction is.", f: "Definition → ACID → Example → When to use", rf: ["No ACID", "No example", "Incorrect definition"] },
      { q: "What is an API endpoint and how does it work?", f: "Definition → Components → Request/Response → Example", rf: ["Vague definition", "No example", "Missing components"] }
    ],
    'Mid-Behavioral': [
      { q: "Describe a time you had to refactor legacy code.", f: "Context → Challenges → Approach → Testing → Outcome", rf: ["No testing", "Broke functionality", "No outcome"] },
      { q: "Tell me about a time you had to make a technical decision under uncertainty.", f: "Situation → Options → Decision → Rationale → Result", rf: ["No rationale", "No alternatives", "Bad outcome"] }
    ],
    'Mid-Technical': [
      { q: "How do you handle database connection pooling?", f: "What → Why → Implementation → Configuration → Monitoring", rf: ["No monitoring", "Ignores limits", "No configuration"] },
      { q: "Explain microservices vs monolithic architecture.", f: "Definitions → Trade-offs → When to use each → Examples", rf: ["No trade-offs", "No examples", "Incorrect definitions"] }
    ],
    'Senior-System Design': [
      { q: "Design a distributed cache system.", f: "Requirements → Architecture → Consistency → Eviction → Scaling", rf: ["No consistency model", "No eviction", "No scaling"] },
      { q: "How would you design a message queue system?", f: "Requirements → Architecture → Durability → Ordering → Scaling", rf: ["No durability", "No ordering", "No scaling plan"] }
    ]
  }
  // ... more templates would go here
};

// Generate questions for each role
let newQuestions = [];
let currentId = existingQuestions.length + 1;

const roles = {
  'Backend Engineer': { existing: 20, needed: 25 },
  'Frontend Engineer': { existing: 18, needed: 27 },
  'Product Manager': { existing: 17, needed: 28 },
  'Data Scientist': { existing: 16, needed: 29 },
  'Product Designer': { existing: 15, needed: 30 },
  'Data Engineer': { existing: 14, needed: 31 },
  'DevOps Engineer': { existing: 0, needed: 45 },
  'Full Stack Engineer': { existing: 0, needed: 45 },
  'Mobile Engineer': { existing: 0, needed: 45 },
  'QA Engineer': { existing: 0, needed: 45 }
};

// This is a simplified version - the actual implementation would have comprehensive templates
// For now, I'll create the expanded file directly with all questions

console.log('Question generation would happen here...');
console.log(`Need to generate ${Object.values(roles).reduce((sum, r) => sum + r.needed, 0)} new questions`);





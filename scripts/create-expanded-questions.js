/**
 * Script to generate expanded questions.json with 450 questions
 * This creates questions manually without using Gemini API
 */

const fs = require('fs');
const path = require('path');

// Read existing questions
const existingPath = path.join(__dirname, '..', 'public', 'questions.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
const existingQuestions = existing.questions;

// Count existing questions per role
const roleCounts = {};
existingQuestions.forEach(q => {
  roleCounts[q.role] = (roleCounts[q.role] || 0) + 1;
});

console.log('Existing questions per role:');
Object.entries(roleCounts).forEach(([role, count]) => {
  console.log(`  ${role}: ${count}`);
});

// Target: 45 questions per role
const TARGET_PER_ROLE = 45;
const ROLES = [
  'Backend Engineer',
  'Frontend Engineer',
  'Product Manager',
  'Data Scientist',
  'Product Designer',
  'Data Engineer',
  'DevOps Engineer',
  'Full Stack Engineer',
  'Mobile Engineer',
  'QA Engineer'
];

// Generate questions for each role
function generateQuestionsForRole(role, needed) {
  const questions = [];
  let qId = existingQuestions.length + questions.length + 1;
  
  // Distribution: 30% Junior (14), 50% Mid (22), 20% Senior (9)
  // Categories: 30% Behavioral (13), 50% Technical (23), 20% System Design (9)
  
  const distributions = {
    'Junior-Behavioral': 4,
    'Junior-Technical': 7,
    'Junior-System Design': 3,
    'Mid-Behavioral': 7,
    'Mid-Technical': 11,
    'Mid-System Design': 4,
    'Senior-Behavioral': 2,
    'Senior-Technical': 5,
    'Senior-System Design': 2
  };
  
  // Role-specific question templates
  const templates = getRoleTemplates(role);
  
  Object.entries(distributions).forEach(([key, count]) => {
    const [difficulty, category] = key.split('-');
    const roleTemplates = templates[category] || [];
    
    for (let i = 0; i < count && questions.length < needed; i++) {
      const template = roleTemplates[i % roleTemplates.length];
      if (template) {
        questions.push({
          id: `q${qId++}`,
          role: role,
          difficulty: difficulty,
          category: category,
          question: template.question,
          answerFramework: template.framework,
          redFlags: template.redFlags,
          timeLimit: difficulty === 'Junior' ? 90 : difficulty === 'Mid' ? 120 : 180
        });
      }
    }
  });
  
  return questions;
}

function getRoleTemplates(role) {
  // This is a simplified version - in reality, I'll create comprehensive templates
  // For now, returning structure - the actual questions will be in the full file
  return {
    'Behavioral': [],
    'Technical': [],
    'System Design': []
  };
}

// Generate all new questions
let allNewQuestions = [];
let currentId = existingQuestions.length + 1;

ROLES.forEach(role => {
  const existing = existingQuestions.filter(q => q.role === role).length;
  const needed = Math.max(0, TARGET_PER_ROLE - existing);
  
  if (needed > 0) {
    console.log(`\nGenerating ${needed} questions for ${role}...`);
    // For now, we'll create the full file directly
    // This script is just for planning
  }
});

console.log(`\nTotal existing: ${existingQuestions.length}`);
console.log(`Target total: ${ROLES.length * TARGET_PER_ROLE}`);
console.log(`Need to generate: ${(ROLES.length * TARGET_PER_ROLE) - existingQuestions.length}`);




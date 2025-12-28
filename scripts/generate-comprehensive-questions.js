/**
 * Comprehensive Question Generation Script
 * Generates 2,250+ questions across 50+ roles in 12+ domains
 * Output: JSON file ready for Firestore import
 */

const fs = require("fs");
const path = require("path");

// Read existing questions if any
const existingPath = path.join(__dirname, "..", "public", "questions.json");
let existingQuestions = [];
try {
  const existing = JSON.parse(fs.readFileSync(existingPath, "utf-8"));
  existingQuestions = existing.questions || [];
} catch (e) {
  console.log("No existing questions file, starting fresh");
}

// All roles organized by domain
const ALL_ROLES = {
  Engineering: [
    "Backend Engineer",
    "Frontend Engineer",
    "Full Stack Engineer",
    "Mobile Engineer",
    "DevOps Engineer",
    "QA Engineer",
    "Security Engineer",
    "Cloud Engineer",
    "Site Reliability Engineer",
    "Software Architect",
    "Embedded Systems Engineer",
    "Game Developer",
  ],
  Business: [
    "Product Manager",
    "MBA Student",
    "Business Analyst",
    "Strategy Consultant",
    "Operations Manager",
    "Project Manager",
    "Program Manager",
    "Business Development Manager",
    "Management Consultant",
    "Supply Chain Manager",
    "Operations Analyst",
  ],
  "Data & Analytics": [
    "Data Scientist",
    "Data Engineer",
    "Data Analyst",
    "Machine Learning Engineer",
    "Business Intelligence Analyst",
    "Analytics Engineer",
    "Data Architect",
    "Quantitative Analyst",
  ],
  Design: [
    "Product Designer",
    "UX Designer",
    "UI Designer",
    "Graphic Designer",
    "Design Systems Engineer",
    "User Researcher",
  ],
  Finance: [
    "Finance Analyst",
    "Investment Banker",
    "Financial Advisor",
    "Risk Analyst",
    "Corporate Finance Manager",
    "Fintech Product Manager",
  ],
  "Marketing & Sales": [
    "Marketing Manager",
    "Digital Marketing Manager",
    "Content Marketing Manager",
    "SEO Specialist",
    "Sales Manager",
    "Account Executive",
    "Sales Engineer",
    "Business Development Representative",
  ],
  Cybersecurity: [
    "Security Analyst",
    "Penetration Tester",
    "Security Engineer",
    "Information Security Manager",
    "Compliance Officer",
    "Security Architect",
  ],
  "Healthcare & Biotech": [
    "Healthcare Data Analyst",
    "Bioinformatics Scientist",
    "Clinical Research Coordinator",
    "Healthcare IT Specialist",
    "Medical Device Engineer",
  ],
  "Operations & Supply Chain": [
    "Operations Manager",
    "Supply Chain Analyst",
    "Logistics Coordinator",
    "Process Improvement Specialist",
    "Quality Assurance Manager",
  ],
  Consulting: [
    "Management Consultant",
    "Technology Consultant",
    "Strategy Consultant",
    "Implementation Consultant",
  ],
  "Human Resources": [
    "HR Business Partner",
    "Talent Acquisition Specialist",
    "HR Generalist",
    "Compensation Analyst",
  ],
  "Education & Training": [
    "Instructional Designer",
    "Training Specialist",
    "Educational Technology Specialist",
  ],
};

// Question distribution: 45 questions per role
// Junior: 14 (4 Behavioral, 7 Technical, 3 System Design)
// Mid: 22 (7 Behavioral, 11 Technical, 4 System Design)
// Senior: 9 (2 Behavioral, 5 Technical, 2 System Design)

const DISTRIBUTION = {
  "Junior-Behavioral": 4,
  "Junior-Technical": 7,
  "Junior-System Design": 3,
  "Mid-Behavioral": 7,
  "Mid-Technical": 11,
  "Mid-System Design": 4,
  "Senior-Behavioral": 2,
  "Senior-Technical": 5,
  "Senior-System Design": 2,
};

// Generic question templates that can be customized per role
function getGenericTemplates(role, domain) {
  const roleLower = role.toLowerCase();

  return {
    Behavioral: [
      {
        question: `Tell me about a time when you had to learn a new skill or technology quickly for ${role}.`,
        framework: "Situation → Task → Action → Result (STAR method)",
        redFlags: [
          "No specific example",
          "Vague timeline",
          "No measurable outcome",
        ],
      },
      {
        question: `Describe a challenging situation you faced in ${role} and how you resolved it.`,
        framework: "Context → Challenge → Approach → Outcome",
        redFlags: ["Blamed others", "No clear solution", "No learning"],
      },
      {
        question: `How do you handle feedback and criticism in your work as a ${role}?`,
        framework: "Approach → Examples → Learning → Improvement",
        redFlags: ["Defensive", "No examples", "Ignores feedback"],
      },
      {
        question: `Tell me about a time you had to work with a difficult team member or stakeholder.`,
        framework: "Situation → Your approach → Communication → Resolution",
        redFlags: ["Negative attitude", "No resolution", "Blame game"],
      },
      {
        question: `Describe a project where you had to meet a tight deadline. How did you manage it?`,
        framework: "Context → Planning → Execution → Result",
        redFlags: ["Poor planning", "Missed deadline", "No lessons"],
      },
      {
        question: `What motivates you in your career as a ${role}?`,
        framework: "Values → Examples → Growth → Alignment",
        redFlags: ["Generic answers", "No passion", "Money only"],
      },
      {
        question: `Tell me about a time you had to make a difficult decision with limited information.`,
        framework: "Situation → Options → Decision → Rationale → Outcome",
        redFlags: [
          "No alternatives considered",
          "Rash decision",
          "No rationale",
        ],
      },
      {
        question: `How do you stay updated with industry trends and best practices in ${domain}?`,
        framework: "Methods → Examples → Application → Impact",
        redFlags: ["No methods", "Not current", "No application"],
      },
      {
        question: `Describe a time when you had to explain a complex ${domain} concept to a non-technical audience.`,
        framework: "Context → Simplification → Communication → Understanding",
        redFlags: ["Too technical", "No adaptation", "No confirmation"],
      },
    ],
    Technical: [
      {
        question: `What are the key skills and technologies essential for a ${role}?`,
        framework: "Core skills → Technologies → Application → Best practices",
        redFlags: ["Incomplete list", "Outdated tech", "No depth"],
      },
      {
        question: `Explain a common challenge in ${domain} and how you would approach solving it.`,
        framework: "Problem → Analysis → Solution → Implementation",
        redFlags: ["Vague problem", "No solution", "No implementation"],
      },
      {
        question: `What tools and frameworks do you use in ${role}, and why?`,
        framework: "Tools → Use cases → Comparison → Selection criteria",
        redFlags: ["No justification", "Limited knowledge", "No comparison"],
      },
      {
        question: `How do you ensure quality and best practices in your work as a ${role}?`,
        framework: "Standards → Processes → Tools → Validation",
        redFlags: ["No standards", "No process", "No validation"],
      },
      {
        question: `Describe your experience with ${domain} methodologies and processes.`,
        framework: "Methodologies → Application → Results → Lessons",
        redFlags: ["No experience", "Wrong methodology", "No results"],
      },
      {
        question: `What metrics or KPIs do you track in ${role}, and why are they important?`,
        framework: "Metrics → Definition → Measurement → Impact",
        redFlags: ["Wrong metrics", "No measurement", "No impact"],
      },
      {
        question: `How do you handle data security and privacy concerns in ${role}?`,
        framework: "Risks → Policies → Implementation → Monitoring",
        redFlags: ["No awareness", "No policies", "No monitoring"],
      },
      {
        question: `Explain a technical concept in ${domain} that you find particularly interesting.`,
        framework: "Concept → Why interesting → Application → Impact",
        redFlags: ["No depth", "No application", "No passion"],
      },
      {
        question: `What are the biggest trends and challenges facing ${domain} today?`,
        framework: "Trends → Challenges → Opportunities → Preparation",
        redFlags: ["Outdated info", "No awareness", "No preparation"],
      },
      {
        question: `How do you approach debugging and problem-solving in ${role}?`,
        framework: "Method → Tools → Process → Documentation",
        redFlags: ["No method", "Trial and error only", "No documentation"],
      },
      {
        question: `Describe your experience with version control and collaboration tools.`,
        framework: "Tools → Workflow → Best practices → Team collaboration",
        redFlags: ["No experience", "Poor practices", "No collaboration"],
      },
      {
        question: `What is your approach to testing and quality assurance in ${role}?`,
        framework: "Strategy → Types → Tools → Coverage",
        redFlags: ["No strategy", "No testing", "Low coverage"],
      },
    ],
    "System Design": [
      {
        question: `Design a scalable system for ${role} use case. What are the key components?`,
        framework:
          "Requirements → Architecture → Components → Scalability → Trade-offs",
        redFlags: ["No scalability", "Missing components", "No trade-offs"],
      },
      {
        question: `How would you design a system to handle high traffic and ensure reliability?`,
        framework: "Load → Architecture → Caching → Database → Monitoring",
        redFlags: [
          "No load handling",
          "Single point of failure",
          "No monitoring",
        ],
      },
      {
        question: `Describe how you would architect a solution for ${domain} problem.`,
        framework:
          "Problem → Requirements → Architecture → Technology → Implementation",
        redFlags: [
          "Wrong architecture",
          "No requirements",
          "No implementation",
        ],
      },
      {
        question: `What are the key considerations when designing a distributed system?`,
        framework:
          "Consistency → Availability → Partitioning → Latency → Trade-offs",
        redFlags: ["No CAP theorem", "No trade-offs", "Missing considerations"],
      },
      {
        question: `How would you design a data pipeline for ${role} use case?`,
        framework:
          "Data sources → Processing → Storage → Consumption → Monitoring",
        redFlags: ["No pipeline", "No monitoring", "Data loss risk"],
      },
    ],
  };
}

// Generate questions for a specific role
function generateQuestionsForRole(role, domain, startId) {
  const questions = [];
  let currentId = startId;
  const templates = getGenericTemplates(role, domain);

  Object.entries(DISTRIBUTION).forEach(([key, count]) => {
    const [difficulty, category] = key.split("-");
    const categoryTemplates = templates[category] || [];

    for (let i = 0; i < count; i++) {
      const template = categoryTemplates[i % categoryTemplates.length];
      if (template) {
        questions.push({
          id: `q${currentId++}`,
          role: role,
          difficulty: difficulty,
          category: category,
          question: template.question,
          answerFramework: template.framework,
          redFlags: template.redFlags,
          timeLimit:
            difficulty === "Junior" ? 90 : difficulty === "Mid" ? 120 : 180,
          commonAnswers: [],
        });
      }
    }
  });

  return { questions, nextId: currentId };
}

// Main generation function
function generateAllQuestions() {
  let allQuestions = [...existingQuestions];
  let currentId =
    existingQuestions.length > 0
      ? Math.max(
          ...existingQuestions.map((q) => parseInt(q.id.replace("q", "")) || 0)
        ) + 1
      : 1;

  console.log(`Starting with ${existingQuestions.length} existing questions`);
  console.log(`Next ID will be: ${currentId}`);

  // Generate questions for all roles
  Object.entries(ALL_ROLES).forEach(([domain, roles]) => {
    console.log(
      `\nGenerating questions for ${domain} domain (${roles.length} roles)...`
    );

    roles.forEach((role) => {
      const { questions, nextId } = generateQuestionsForRole(
        role,
        domain,
        currentId
      );
      allQuestions = allQuestions.concat(questions);
      currentId = nextId;
      console.log(`  ✓ ${role}: ${questions.length} questions generated`);
    });
  });

  console.log(`\nTotal questions generated: ${allQuestions.length}`);

  // Count by role
  const roleCounts = {};
  allQuestions.forEach((q) => {
    roleCounts[q.role] = (roleCounts[q.role] || 0) + 1;
  });

  console.log("\nQuestions per role:");
  Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

  // Write to file
  const outputPath = path.join(
    __dirname,
    "..",
    "public",
    "comprehensive-questions.json"
  );
  const output = {
    questions: allQuestions,
    metadata: {
      totalQuestions: allQuestions.length,
      totalRoles: Object.keys(roleCounts).length,
      generatedAt: new Date().toISOString(),
      domains: Object.keys(ALL_ROLES),
    },
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Questions written to: ${outputPath}`);
  console.log(
    `\nTo import to Firestore, use the ImportQuestionsButton component or run a batch import script.`
  );

  return output;
}

// Run if called directly
if (require.main === module) {
  generateAllQuestions();
}

module.exports = { generateAllQuestions, ALL_ROLES };

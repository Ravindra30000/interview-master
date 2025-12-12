/**
 * Question Generation Script
 * Uses Gemini API to generate 400-500 interview questions
 * 
 * Run: npx tsx scripts/generate-questions.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY not found in environment");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Question {
  id: string;
  role: string;
  difficulty: "Junior" | "Mid" | "Senior";
  category: "Behavioral" | "Technical" | "System Design";
  question: string;
  answerFramework: string;
  redFlags: string[];
  timeLimit: number;
  commonAnswers?: string[];
}

const ROLES = [
  "Backend Engineer",
  "Frontend Engineer",
  "Product Manager",
  "Data Scientist",
  "Product Designer",
  "Data Engineer",
  "DevOps Engineer",
  "Full Stack Engineer",
  "Mobile Engineer",
  "QA Engineer",
];

const QUESTIONS_PER_ROLE = 45; // ~45 questions per role to reach 450 total

async function generateQuestionsForRole(
  role: string,
  model: any
): Promise<Question[]> {
  const prompt = `Generate ${QUESTIONS_PER_ROLE} realistic interview questions for ${role} position.

Requirements:
- 15 Junior level questions (30%)
- 22 Mid level questions (50%)
- 8 Senior level questions (20%)

Categories distribution:
- Behavioral: 13 questions (teamwork, problem-solving, leadership, conflict resolution)
- Technical: 23 questions (role-specific technical skills, tools, frameworks)
- System Design: 9 questions (architecture, scalability, design patterns)

For each question, provide:
1. A realistic, industry-standard interview question
2. An answer framework (step-by-step approach)
3. Red flags (what to avoid in answers)
4. Appropriate time limit (90 for Junior, 120 for Mid, 180-300 for Senior)

Return ONLY valid JSON array format:
[
  {
    "id": "q1",
    "role": "${role}",
    "difficulty": "Junior|Mid|Senior",
    "category": "Behavioral|Technical|System Design",
    "question": "The actual question text",
    "answerFramework": "Step 1 → Step 2 → Step 3",
    "redFlags": ["flag1", "flag2", "flag3"],
    "timeLimit": 90|120|180|300
  },
  ...
]

Make questions diverse, realistic, and relevant to ${role} role.`;

  try {
    console.log(`Generating questions for ${role}...`);
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }
    
    const questions: Question[] = JSON.parse(jsonText);
    
    // Validate and add IDs
    const validatedQuestions = questions.map((q, idx) => ({
      ...q,
      id: q.id || `${role.toLowerCase().replace(/\s+/g, "-")}-q${idx + 1}`,
      role: role,
      difficulty: q.difficulty || "Mid",
      category: q.category || "Technical",
      timeLimit: q.timeLimit || 120,
    }));

    console.log(`✓ Generated ${validatedQuestions.length} questions for ${role}`);
    return validatedQuestions;
  } catch (error: any) {
    console.error(`Error generating questions for ${role}:`, error.message);
    if (error.message.includes("JSON")) {
      console.error("Failed to parse JSON response. The model may have returned invalid JSON.");
    }
    return [];
  }
}

async function main() {
  console.log("Starting question generation...");
  console.log(`Target: ${ROLES.length} roles × ${QUESTIONS_PER_ROLE} questions = ~${ROLES.length * QUESTIONS_PER_ROLE} total\n`);

  // Try Gemini 3 Pro first, fallback to Gemini 2.5 Flash
  let model = genAI.getGenerativeModel({ model: "gemini-3-pro" });
  try {
    // Test model availability - if it fails, use fallback
    await model.generateContent("test");
  } catch (e: any) {
    if (e?.message?.includes("404") || e?.message?.includes("not found")) {
      console.log("Gemini 3 Pro not available, using Gemini 2.5 Flash");
      model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } else {
      throw e;
    }
  }
  const allQuestions: Question[] = [];

  // Load existing questions if any
  const existingPath = path.join(process.cwd(), "public", "questions.json");
  let existingQuestions: Question[] = [];
  
  if (fs.existsSync(existingPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(existingPath, "utf-8"));
      existingQuestions = existing.questions || [];
      console.log(`Found ${existingQuestions.length} existing questions\n`);
    } catch (error) {
      console.log("No existing questions found or error reading file\n");
    }
  }

  // Generate questions for each role
  for (const role of ROLES) {
    // Check if we already have enough questions for this role
    const existingForRole = existingQuestions.filter((q) => q.role === role);
    if (existingForRole.length >= QUESTIONS_PER_ROLE) {
      console.log(`Skipping ${role} - already has ${existingForRole.length} questions`);
      allQuestions.push(...existingForRole.slice(0, QUESTIONS_PER_ROLE));
      continue;
    }

    const questions = await generateQuestionsForRole(role, model);
    allQuestions.push(...questions);

    // Rate limiting - wait 2 seconds between requests
    if (role !== ROLES[ROLES.length - 1]) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Merge with existing questions (avoid duplicates)
  const questionMap = new Map<string, Question>();
  
  // Add existing questions first
  existingQuestions.forEach((q) => {
    questionMap.set(q.id, q);
  });

  // Add new questions (overwrite if same ID)
  allQuestions.forEach((q) => {
    questionMap.set(q.id, q);
  });

  const finalQuestions = Array.from(questionMap.values());

  // Save to file
  const output = {
    questions: finalQuestions,
  };

  const outputPath = path.join(process.cwd(), "public", "questions.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✓ Generated ${finalQuestions.length} total questions`);
  console.log(`✓ Saved to ${outputPath}`);

  // Print summary
  const roleCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  finalQuestions.forEach((q) => {
    roleCounts[q.role] = (roleCounts[q.role] || 0) + 1;
    difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });

  console.log("\nSummary by Role:");
  Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([role, count]) => {
      console.log(`  ${role}: ${count} questions`);
    });

  console.log("\nSummary by Difficulty:");
  Object.entries(difficultyCounts).forEach(([diff, count]) => {
    console.log(`  ${diff}: ${count} questions`);
  });

  console.log("\nSummary by Category:");
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} questions`);
  });
}

main().catch(console.error);


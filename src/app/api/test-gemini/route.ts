import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list available models using REST API
    let availableModels: string[] = [];
    try {
      const listResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (listResponse.ok) {
        const listData = await listResponse.json();
        availableModels = (listData.models || []).map((m: any) => m.name?.replace('models/', '') || m.name).filter(Boolean);
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.log("Could not list models:", errorMessage);
    }
    
    // Try common model names (prioritize gemini-2.5-flash)
    const modelNames = [
      "gemini-2.5-flash",    // Primary model
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest", 
      "gemini-pro",
      ...availableModels.slice(0, 5) // Try first 5 from list
    ];

    const results: { model: string; status: string; error?: string }[] = [];

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const testResult = await model.generateContent("Say hello");
        const text = testResult.response.text();
        results.push({ model: modelName, status: "SUCCESS", error: text.substring(0, 50) });
        break; // Found a working model
      } catch (err: any) {
        results.push({ 
          model: modelName, 
          status: "FAILED", 
          error: err?.message || "Unknown error" 
        });
      }
    }

    return NextResponse.json({
      apiKeyPresent: !!apiKey,
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
      availableModelsFromAPI: availableModels,
      results,
      workingModel: results.find(r => r.status === "SUCCESS")?.model || null
    });
  } catch (err: any) {
    return NextResponse.json(
      { 
        error: err?.message || "Test failed",
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined
      },
      { status: 500 }
    );
  }
}

"use client";

import { useState } from "react";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Question } from "@/types";

export default function ImportQuestionsButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (useComprehensive = false) => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const fileName = useComprehensive
        ? "comprehensive-questions.json"
        : "questions.json";
      const res = await fetch(`/${fileName}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch ${fileName}`);
      const data = await res.json();
      const questions: Question[] = data.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error(`${fileName} has no questions`);
      }

      // Firestore batch write limit is 500, so we need to chunk
      const BATCH_SIZE = 500;
      const col = collection(db, "questions");
      let imported = 0;

      for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = questions.slice(i, i + BATCH_SIZE);

        chunk.forEach((q) => {
          const id = q.id || crypto.randomUUID();
          batch.set(doc(col, id), { ...q, id });
        });

        await batch.commit();
        imported += chunk.length;
        setMessage(`Importing... ${imported}/${questions.length} questions`);
      }

      setMessage(
        `Successfully imported ${questions.length} questions to Firestore!`
      );
    } catch (err: any) {
      setError(err?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">
          Import questions to Firestore
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleImport(false);
          }}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 text-sm"
        >
          {loading ? "Importing..." : "Import questions.json"}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleImport(true);
          }}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60 text-sm"
        >
          {loading ? "Importing..." : "Import Comprehensive Questions (4,000+)"}
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Import questions from JSON files into Firestore. Use
        comprehensive-questions.json for all 73 roles across 12+ domains.
      </p>
      {message && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Question } from "@/types";

export default function ImportQuestionsButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/questions.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch questions.json");
      const data = await res.json();
      const questions: Question[] = data.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("questions.json has no questions");
      }

      const batch = writeBatch(db);
      const col = collection(db, "questions");
      questions.forEach((q) => {
        const id = q.id || crypto.randomUUID();
        batch.set(doc(col, id), { ...q, id });
      });
      await batch.commit();
      setMessage(`Imported ${questions.length} questions to Firestore.`);
    } catch (err: any) {
      setError(err?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Import questions to Firestore</h3>
        <button
          onClick={handleImport}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Importing..." : "Import now"}
        </button>
      </div>
      <p className="text-sm text-gray-600">
        One-time import of `public/questions.json` into Firestore collection `questions`.
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






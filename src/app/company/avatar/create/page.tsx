"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import { auth } from "@/lib/firebase";
import {
  createAvatarPersona,
  createOrUpdateCompany,
} from "@/lib/avatarPersona";
import type { AvatarPersona } from "@/types";
import {
  Loader2,
  Save,
  ArrowLeft,
  User,
  Building2,
  Settings,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default function CreateAvatarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<
    Omit<
      AvatarPersona,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "isActive"
      | "createdBy"
      | "type"
    >
  >({
    name: "",
    role: "Senior Hiring Manager",
    companyName: "",
    appearance: {
      gender: "male",
      ageRange: "mid",
      style: "professional",
    },
    behavior: {
      pace: "normal",
      formality: "professional",
      encouragement: "supportive",
      gestures: true,
      eyeContact: true,
    },
    instructions: {
      systemPrompt:
        "You are an expert interviewer. Ask behavioral questions. Listen carefully. Ask follow-ups to understand depth. Be encouraging but objective.",
      evaluationCriteria: [
        "Problem solving ability",
        "Communication clarity",
        "Technical depth",
        "Culture fit",
      ],
      followUpStrategy:
        "Ask probing questions when answers are vague. Dig deeper into specific examples.",
    },
    interviewConfig: {
      duration: 15,
      questionCount: 5,
      allowFollowUps: true,
      scoringEnabled: true,
    },
    apiConfig: {
      provider: "did",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create or update company first
      let companyId: string | undefined;
      if (formData.companyName) {
        companyId = await createOrUpdateCompany(user.uid, {
          name: formData.companyName,
          avatarPersonas: [],
          settings: {
            allowPublicPractice: true,
            requireInvitation: false,
          },
        });
      }

      // Create avatar persona
      const personaId = await createAvatarPersona(user.uid, {
        ...formData,
        type: "company",
        companyId,
        createdBy: user.uid,
      });

      // Redirect to avatar list or practice page
      router.push(`/company/avatar?created=${personaId}`);
    } catch (err: any) {
      console.error("[CreateAvatar] Error:", err);
      setError(err?.message || "Failed to create avatar persona");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Link
              href="/company"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Company Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Create Company Avatar
            </h1>
            <p className="text-gray-600 mt-2">
              Customize an AI avatar for your company's interview process
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Sarah - TechCorp Interviewer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role/Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Senior Hiring Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., TechCorp"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.appearance.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appearance: {
                          ...formData.appearance,
                          gender: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Range
                  </label>
                  <select
                    value={formData.appearance.ageRange}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appearance: {
                          ...formData.appearance,
                          ageRange: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="young">Young</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Style
                  </label>
                  <select
                    value={formData.appearance.style}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appearance: {
                          ...formData.appearance,
                          style: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Behavior */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Behavior Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speech Pace
                    </label>
                    <select
                      value={formData.behavior.pace}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          behavior: {
                            ...formData.behavior,
                            pace: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="slow">Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Formality Level
                    </label>
                    <select
                      value={formData.behavior.formality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          behavior: {
                            ...formData.behavior,
                            formality: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="casual">Casual</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encouragement Style
                  </label>
                  <select
                    value={formData.behavior.encouragement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        behavior: {
                          ...formData.behavior,
                          encouragement: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="supportive">Supportive</option>
                    <option value="neutral">Neutral</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.behavior.gestures}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          behavior: {
                            ...formData.behavior,
                            gestures: e.target.checked,
                          },
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Show Gestures</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.behavior.eyeContact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          behavior: {
                            ...formData.behavior,
                            eyeContact: e.target.checked,
                          },
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Eye Contact</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Interview Instructions */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Interview Instructions</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Prompt (How avatar should behave)
                  </label>
                  <textarea
                    value={formData.instructions.systemPrompt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructions: {
                          ...formData.instructions,
                          systemPrompt: e.target.value,
                        },
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe how the avatar should conduct interviews..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evaluation Criteria (one per line)
                  </label>
                  <textarea
                    value={formData.instructions.evaluationCriteria.join("\n")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructions: {
                          ...formData.instructions,
                          evaluationCriteria: e.target.value
                            .split("\n")
                            .filter((line) => line.trim()),
                        },
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Problem solving ability&#10;Communication clarity&#10;Technical depth"
                  />
                </div>
              </div>
            </div>

            {/* Interview Config */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Interview Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={formData.interviewConfig.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interviewConfig: {
                          ...formData.interviewConfig,
                          duration: parseInt(e.target.value) || 15,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.interviewConfig.questionCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interviewConfig: {
                          ...formData.interviewConfig,
                          questionCount: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interviewConfig.allowFollowUps}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interviewConfig: {
                          ...formData.interviewConfig,
                          allowFollowUps: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Allow Follow-ups</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interviewConfig.scoringEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interviewConfig: {
                          ...formData.interviewConfig,
                          scoringEnabled: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enable Scoring</span>
                </label>
              </div>
            </div>

            {/* API Config */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">API Configuration</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar Provider
                </label>
                <select
                  value={formData.apiConfig.provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apiConfig: {
                        ...formData.apiConfig,
                        provider: e.target.value as "did" | "heygen",
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="did">D-ID (Development)</option>
                  <option value="heygen">HeyGen (Production/Demo)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  D-ID is cheaper for testing. HeyGen offers higher quality for
                  demos.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/company"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Avatar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}

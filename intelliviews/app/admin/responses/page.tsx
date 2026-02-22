"use client";

import { useState, useEffect } from "react";

interface ChatMessage {
  role: "ai" | "candidate";
  text: string;
}

interface ResponseData {
  id: string;
  candidateEmail: string;
  candidateId: string;
  interviewType: string;
  taskId: number;
  taskTitle: string;
  response?: string; // For technical interviews
  chatHistory?: ChatMessage[]; // For behavioural interviews
  timeSpentSeconds: number;
  metadata: any;
  createdAt: string;
  submittedAt: string;
}

export default function AdminResponsesPage() {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchResponses();
  }, [filter]);

  async function fetchResponses() {
    setLoading(true);
    setError("");
    try {
      const url = filter === "all" 
        ? "/api/get-responses" 
        : `/api/get-responses?type=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setResponses(data.responses);
      } else {
        setError(data.message || "Failed to fetch responses");
      }
    } catch (err) {
      setError("Network error: " + (err instanceof Error ? err.message : "Unknown"));
      console.error("Failed to fetch responses:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview Responses</h1>
            <p className="text-zinc-400">View and analyze candidate interview data</p>
          </div>
          <button
            onClick={fetchResponses}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "technical1", "technical2", "behavioural"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-zinc-400">Loading responses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && responses.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-500 text-lg">No responses found</p>
            <p className="text-zinc-600 text-sm mt-2">
              Complete an interview to see responses here
            </p>
          </div>
        )}

        {/* Responses List */}
        {!loading && !error && responses.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 mb-4">
              Found {responses.length} response{responses.length !== 1 ? 's' : ''}
            </p>
            
            {responses.map((response) => (
              <div
                key={response.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{response.taskTitle}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full font-medium">
                        {response.interviewType}
                      </span>
                      <span className="text-zinc-500">Task #{response.taskId}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-600 font-mono">
                    ID: {response.id.slice(-8)}
                  </span>
                </div>

                {/* Candidate Info */}
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">Email:</span>
                      <p className="font-medium">{response.candidateEmail}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Candidate ID:</span>
                      <p className="font-mono text-xs">{response.candidateId}</p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {response.metadata && Object.keys(response.metadata).length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-zinc-400 mb-2">Metadata</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {response.timeSpentSeconds !== undefined && (
                        <div>
                          <span className="text-zinc-500">Time Spent:</span>
                          <p className="font-medium">{Math.floor(response.timeSpentSeconds / 60)}m {response.timeSpentSeconds % 60}s</p>
                        </div>
                      )}
                      {response.metadata.difficulty !== undefined && (
                        <div>
                          <span className="text-zinc-500">Difficulty:</span>
                          <p className="font-medium">{response.metadata.difficulty}</p>
                        </div>
                      )}
                      {response.metadata.type !== undefined && (
                        <div>
                          <span className="text-zinc-500">Type:</span>
                          <p className="font-medium">{response.metadata.type}</p>
                        </div>
                      )}
                      {response.metadata.hintsViewed !== undefined && (
                        <div>
                          <span className="text-zinc-500">Hints Viewed:</span>
                          <p className="font-medium">{response.metadata.hintsViewed ? "Yes" : "No"}</p>
                        </div>
                      )}
                      {response.metadata.currentFollowUp !== undefined && (
                        <div>
                          <span className="text-zinc-500">Follow-ups:</span>
                          <p className="font-medium">{response.metadata.currentFollowUp}</p>
                        </div>
                      )}
                      {response.metadata.tokenCount !== undefined && (
                        <div>
                          <span className="text-zinc-500">Tokens Used:</span>
                          <p className="font-medium">{response.metadata.tokenCount}</p>
                        </div>
                      )}
                      {response.metadata.completed !== undefined && (
                        <div>
                          <span className="text-zinc-500">Status:</span>
                          <p className="font-medium">
                            {response.metadata.completed ? "✅ Complete" : "⏳ In Progress"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Technical Interview Response */}
                {response.response && (response.interviewType === 'technical1' || response.interviewType === 'technical2') && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 mb-3">
                      Candidate Submission
                    </h4>
                    <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                      <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-emerald-300 overflow-x-auto">
                        {response.response}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Chat History */}
                {response.chatHistory && response.chatHistory.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 mb-3">
                      Conversation ({response.chatHistory.filter(m => m.role === "candidate").length} candidate responses)
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto bg-zinc-950 rounded-lg p-4">
                      {response.chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`${
                            msg.role === "candidate" ? "ml-8" : "mr-8"
                          }`}
                        >
                          <div
                            className={`rounded-lg p-3 ${
                              msg.role === "candidate"
                                ? "bg-indigo-600/20 border border-indigo-600/30"
                                : "bg-zinc-800 border border-zinc-700"
                            }`}
                          >
                            <p className="text-[10px] font-semibold mb-1 opacity-70">
                              {msg.role === "candidate" ? "👤 Candidate" : "🤖 AI Interviewer"}
                            </p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

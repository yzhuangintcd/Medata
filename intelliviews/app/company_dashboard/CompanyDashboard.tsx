'use client';

import { useState, useEffect } from 'react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  skills: string[];
  experience: string;
  avatar?: string;
}

interface JobRequirement {
  id: string;
  quality: string;
  importance: 'critical' | 'important' | 'nice-to-have';
}

interface CultureValue {
  id: string;
  value: string;
  description: string;
}

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
  response?: string;
  chatHistory?: ChatMessage[];
  timeSpentSeconds: number;
  metadata: any;
  createdAt: string;
  submittedAt: string;
}

export default function CompanyDashboard() {
  // Sample candidate data - will be replaced with real data integration
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>({
    id: '1',
    name: 'Paddy Zhuang',
    email: 'yzhuang@tcd.ie',
    position: 'Full Stack Software Engineer',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: '2 years',
  });

  const [jobRequirements, setJobRequirements] = useState<JobRequirement[]>([
    {
      id: '1',
      quality: 'Problem-solving ability',
      importance: 'critical',
    },
    {
      id: '2',
      quality: 'Team collaboration',
      importance: 'important',
    },
  ]);

  const [cultureValues, setCultureValues] = useState<CultureValue[]>([
    {
      id: '1',
      value: 'Innovation',
      description: 'We encourage creative thinking and new ideas',
    },
    {
      id: '2',
      value: 'Transparency',
      description: 'Open communication is core to our success',
    },
  ]);

  // Response viewing state
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);

  const [newQuality, setNewQuality] = useState('');
  const [newQualityImportance, setNewQualityImportance] =
    useState<'critical' | 'important' | 'nice-to-have'>('important');

  const [newCultureValue, setNewCultureValue] = useState('');
  const [newCultureDescription, setNewCultureDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Fetch responses when selected candidate changes
  useEffect(() => {
    if (selectedCandidate?.email) {
      fetchResponses();
    }
  }, [selectedCandidate?.email]);

  async function fetchResponses() {
    setLoadingResponses(true);
    setResponseError("");
    try {
      const res = await fetch("/api/get-responses");
      const data = await res.json();
      
      if (data.success) {
        // Filter responses for selected candidate
        const candidateResponses = selectedCandidate 
          ? data.responses.filter((r: ResponseData) => r.candidateEmail === selectedCandidate.email)
          : data.responses;
        setResponses(candidateResponses);
      } else {
        setResponseError(data.message || "Failed to fetch responses");
      }
    } catch (err) {
      setResponseError("Network error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoadingResponses(false);
    }
  }

  const sendInterviewEmail = async () => {
    if (!selectedCandidate) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/send-interview-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: selectedCandidate.name,
          candidateEmail: selectedCandidate.email,
          candidatePosition: selectedCandidate.position,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        console.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addJobRequirement = () => {
    if (newQuality.trim()) {
      setJobRequirements([
        ...jobRequirements,
        {
          id: Math.random().toString(),
          quality: newQuality,
          importance: newQualityImportance,
        },
      ]);
      setNewQuality('');
      setNewQualityImportance('important');
    }
  };

  const removeJobRequirement = (id: string) => {
    setJobRequirements(jobRequirements.filter((req) => req.id !== id));
  };

  const addCultureValue = () => {
    if (newCultureValue.trim() && newCultureDescription.trim()) {
      setCultureValues([
        ...cultureValues,
        {
          id: Math.random().toString(),
          value: newCultureValue,
          description: newCultureDescription,
        },
      ]);
      setNewCultureValue('');
      setNewCultureDescription('');
    }
  };

  const removeCultureValue = (id: string) => {
    setCultureValues(cultureValues.filter((val) => val.id !== id));
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'important':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'nice-to-have':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Company Dashboard
          </h1>
          <p className="text-slate-600">
            Manage candidate interviews and define your ideal hire
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Candidate Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Current Candidate
              </h2>

              {selectedCandidate ? (
                <div className="space-y-4">
                  {selectedCandidate.avatar && (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedCandidate.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedCandidate.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedCandidate.email}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Position Applied:
                    </p>
                    <p className="text-slate-900 font-semibold">
                      {selectedCandidate.position}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Experience:
                    </p>
                    <p className="text-slate-900">
                      {selectedCandidate.experience}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={sendInterviewEmail}
                    disabled={isLoading}
                    className={`w-full mt-4 text-white font-semibold py-2 px-4 rounded-lg transition ${
                      emailSent 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                    }`}
                  >
                    {isLoading ? 'Sending...' : emailSent ? '✓ Email Sent!' : 'Send Interview Link to Candidate'}
                  </button>

                  {/* Responses Summary */}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Interview Responses:
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {responses.length}
                    </p>
                    <p className="text-xs text-slate-500">
                      {responses.filter(r => r.metadata?.completed).length} completed
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No candidate selected</p>
              )}
            </div>
          </div>

          {/* Right: Job Requirements & Culture */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Job Requirements
              </h2>

              <div className="space-y-3 mb-6">
                {jobRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${getImportanceColor(
                      req.importance
                    )}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{req.quality}</p>
                      <p className="text-xs opacity-75 capitalize">
                        {req.importance}
                      </p>
                    </div>
                    <button
                      onClick={() => removeJobRequirement(req.id)}
                      className="ml-4 text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Requirement */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Add Quality
                  </label>
                  <input
                    type="text"
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value)}
                    placeholder="e.g., Leadership experience"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Importance Level
                  </label>
                  <select
                    value={newQualityImportance}
                    onChange={(e) =>
                      setNewQualityImportance(
                        e.target.value as
                          | 'critical'
                          | 'important'
                          | 'nice-to-have'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="important">Important</option>
                    <option value="nice-to-have">Nice to Have</option>
                  </select>
                </div>

                <button
                  onClick={addJobRequirement}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Company Culture Values */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Company Culture
              </h2>

              <div className="space-y-3 mb-6">
                {cultureValues.map((val) => (
                  <div
                    key={val.id}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {val.value}
                      </h3>
                      <button
                        onClick={() => removeCultureValue(val.id)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-slate-700">{val.description}</p>
                  </div>
                ))}
              </div>

              {/* Add New Culture Value */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Culture Value
                  </label>
                  <input
                    type="text"
                    value={newCultureValue}
                    onChange={(e) => setNewCultureValue(e.target.value)}
                    placeholder="e.g., Accountability"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCultureDescription}
                    onChange={(e) => setNewCultureDescription(e.target.value)}
                    placeholder="Describe what this value means to your company"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={addCultureValue}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add Culture Value
                </button>
              </div>
            </div>

            {/* Interview Responses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Interview Responses
                </h2>
                <button
                  onClick={fetchResponses}
                  className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg transition"
                >
                  🔄 Refresh
                </button>
              </div>

              {loadingResponses && (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-slate-400 text-sm">Loading responses...</p>
                </div>
              )}

              {responseError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm">❌ {responseError}</p>
                </div>
              )}

              {!loadingResponses && !responseError && responses.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">No responses yet</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Responses will appear here once the candidate completes an interview
                  </p>
                </div>
              )}

              {!loadingResponses && !responseError && responses.length > 0 && (
                <div className="space-y-3">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer"
                      onClick={() => setExpandedResponseId(
                        expandedResponseId === response.id ? null : response.id
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {response.taskTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {response.interviewType}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(response.createdAt).toLocaleDateString()}
                            </span>
                            {response.metadata?.completed && (
                              <span className="text-xs font-medium text-green-600">✓ Complete</span>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-400">
                          {expandedResponseId === response.id ? '▼' : '▶'}
                        </span>
                      </div>

                      {expandedResponseId === response.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {response.timeSpentSeconds !== undefined && (
                              <div>
                                <span className="text-slate-600">Time Spent:</span>
                                <p className="font-medium">
                                  {Math.floor(response.timeSpentSeconds / 60)}m {response.timeSpentSeconds % 60}s
                                </p>
                              </div>
                            )}
                            {response.metadata?.difficulty && (
                              <div>
                                <span className="text-slate-600">Difficulty:</span>
                                <p className="font-medium capitalize">{response.metadata.difficulty}</p>
                              </div>
                            )}
                          </div>

                          {/* Technical Response */}
                          {response.response && (response.interviewType === 'technical1' || response.interviewType === 'technical2') && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-slate-600 mb-2">Submission:</p>
                              <pre className="bg-slate-50 rounded p-3 text-xs overflow-x-auto max-h-48 font-mono text-slate-800 whitespace-pre-wrap break-words">
                                {response.response}
                              </pre>
                            </div>
                          )}

                          {/* Chat History */}
                          {response.chatHistory && response.chatHistory.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-slate-600 mb-2">
                                Conversation ({response.chatHistory.filter(m => m.role === "candidate").length} responses)
                              </p>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {response.chatHistory.map((msg, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-xs p-2 rounded ${
                                      msg.role === "candidate"
                                        ? "bg-blue-50 border border-blue-100 text-blue-900"
                                        : "bg-slate-100 border border-slate-200 text-slate-900"
                                    }`}
                                  >
                                    <p className="font-medium mb-1">
                                      {msg.role === "candidate" ? "👤 Candidate" : "🤖 AI"}
                                    </p>
                                    <p className="whitespace-pre-wrap text-slate-700">
                                      {msg.text.length > 200 ? msg.text.substring(0, 200) + "..." : msg.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

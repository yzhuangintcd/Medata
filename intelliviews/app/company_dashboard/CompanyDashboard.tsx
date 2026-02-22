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
    name: '',
    email: 'candidate@example.com',
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

  // Recommendation state
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    decision: 'hire' | 'reject' | 'review';
    reasoning: string;
    strengths: string[];
    concerns: string[];
    emailSubject?: string;
    emailBody?: string;
  } | null>(null);
  const [analyzingCandidate, setAnalyzingCandidate] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load culture values from localStorage on mount
  useEffect(() => {
    const savedCultureValues = localStorage.getItem('companyCultureValues');
    if (savedCultureValues) {
      try {
        setCultureValues(JSON.parse(savedCultureValues));
      } catch (e) {
        console.error('Failed to parse saved culture values', e);
      }
    }
  }, []);

  // Save culture values to localStorage whenever they change
  useEffect(() => {
    if (cultureValues.length > 0) {
      localStorage.setItem('companyCultureValues', JSON.stringify(cultureValues));
    }
  }, [cultureValues]);

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
          candidateName: 'Candidate',
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

  const analyzeAndRecommend = async () => {
    if (!selectedCandidate) return;

    setAnalyzingCandidate(true);
    setShowRecommendation(false);
    try {
      const response = await fetch('/api/recommend-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: selectedCandidate.email,
          jobRequirements,
          cultureValues,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendation(data.recommendation);
        setShowRecommendation(true);
      } else {
        alert('Failed to generate recommendation: ' + data.error);
      }
    } catch (error) {
      console.error('Error analyzing candidate:', error);
      alert('Failed to analyze candidate');
    } finally {
      setAnalyzingCandidate(false);
    }
  };

  const sendDecisionEmail = async () => {
    if (!selectedCandidate || !recommendation) return;

    setSendingEmail(true);
    try {
      const response = await fetch('/api/send-decision-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: selectedCandidate.email,
          candidateName: 'Candidate',
          subject: recommendation.emailSubject,
          body: recommendation.emailBody,
          decision: recommendation.decision,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Email sent successfully!');
      } else {
        alert('Failed to send email: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">
                Company Dashboard
              </h1>
            </div>
          </div>
          <p className="text-zinc-400 text-lg ml-15">
            Manage candidate interviews and define your ideal hire
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Candidate Information */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-4 border-b border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <span className="text-indigo-400">👤</span>
                  Current Candidate
                </h2>
              </div>
              <div className="p-6">

              {selectedCandidate ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-zinc-800">
                      {selectedCandidate.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">
                        Candidate Email
                      </label>
                      <input
                        type="email"
                        value={selectedCandidate.email}
                        onChange={(e) => setSelectedCandidate({
                          ...selectedCandidate,
                          email: e.target.value
                        })}
                        placeholder="candidate@example.com"
                        className="w-full px-3 py-2 text-sm border border-zinc-700 rounded-lg bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-5 space-y-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                        Position Applied
                      </p>
                      <p className="text-zinc-100 font-semibold text-base">
                        {selectedCandidate.position}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2.5">
                        Experience
                      </p>
                      <p className="text-zinc-200 font-medium">
                        {selectedCandidate.experience}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2.5">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={sendInterviewEmail}
                    disabled={isLoading}
                    className={`w-full mt-6 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                      emailSent 
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                        <span>Sending...</span>
                      </>
                    ) : emailSent ? (
                      <>
                        <span className="text-lg">✓</span>
                        <span>Email Sent!</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">📧</span>
                        <span>Send Interview Link</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No candidate selected</p>
              )}
              </div>
            </div>
          </div>

          {/* Right: Job Requirements & Culture */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Requirements */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-4 border-b border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <span className="text-indigo-400">📋</span>
                  Job Requirements
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Define the key qualities you're looking for</p>
              </div>
              <div className="p-6">

              <div className="space-y-3 mb-6">
                {jobRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-sm transition-all hover:shadow-md ${
                      req.importance === 'critical'
                        ? 'bg-red-950/40 border-red-500/40 text-red-200 hover:border-red-500/60'
                        : req.importance === 'important'
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 hover:border-amber-500/60'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 hover:border-emerald-500/60'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-base mb-1">{req.quality}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                        req.importance === 'critical'
                          ? 'bg-red-500/20 text-red-300'
                          : req.importance === 'important'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {req.importance.replace('-', ' ')}
                      </span>
                    </div>
                    <button
                      onClick={() => removeJobRequirement(req.id)}
                      className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Requirement */}
              <div className="space-y-3 border-t border-zinc-800 pt-6 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Add Quality
                  </label>
                  <input
                    type="text"
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value)}
                    placeholder="e.g., Leadership experience"
                    className="w-full px-3 py-2.5 border-2 border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
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
                    className="w-full px-3 py-2.5 border-2 border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-zinc-600 cursor-pointer"
                  >
                    <option value="critical">Critical</option>
                    <option value="important">Important</option>
                    <option value="nice-to-have">Nice to Have</option>
                  </select>
                </div>

                <button
                  onClick={addJobRequirement}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span>
                  <span>Add Requirement</span>
                </button>
              </div>
              </div>
            </div>

            {/* Company Culture Values */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-4 border-b border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <span className="text-purple-400">⭐</span>
                  Company Culture
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Define your company values and culture</p>
              </div>
              <div className="p-6">

              <div className="space-y-3 mb-6">
                {cultureValues.map((val) => (
                  <div
                    key={val.id}
                    className="p-5 bg-gradient-to-br from-purple-950/50 via-pink-950/40 to-purple-950/50 border-2 border-purple-500/40 rounded-xl shadow-md hover:shadow-lg hover:border-purple-500/60 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-purple-200 text-lg flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        {val.value}
                      </h3>
                      <button
                        onClick={() => removeCultureValue(val.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{val.description}</p>
                  </div>
                ))}
              </div>

              {/* Add New Culture Value */}
              <div className="space-y-3 border-t border-zinc-800 pt-6 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Culture Value
                  </label>
                  <input
                    type="text"
                    value={newCultureValue}
                    onChange={(e) => setNewCultureValue(e.target.value)}
                    placeholder="e.g., Accountability"
                    className="w-full px-3 py-2.5 border-2 border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCultureDescription}
                    onChange={(e) => setNewCultureDescription(e.target.value)}
                    placeholder="Describe what this value means to your company"
                    rows={3}
                    className="w-full px-3 py-2.5 border-2 border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:border-zinc-600 resize-none"
                  />
                </div>

                <button
                  onClick={addCultureValue}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span>
                  <span>Add Culture Value</span>
                </button>
              </div>
              </div>
            </div>

            {/* Interview Responses */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-4 border-b border-zinc-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                    <span className="text-indigo-400">📝</span>
                    Interview Responses
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Review candidate submissions and performance</p>
                </div>
                <button
                  onClick={fetchResponses}
                  className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 text-zinc-200 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 font-medium"
                >
                  <span>🔄</span>
                  <span>Refresh</span>
                </button>
              </div>
              <div className="p-6">

              {loadingResponses && (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent mb-3"></div>
                  <p className="text-zinc-300 font-medium">Loading responses...</p>
                  <p className="text-zinc-500 text-sm mt-1">Please wait</p>
                </div>
              )}

              {responseError && (
                <div className="bg-red-950/50 border-2 border-red-500/40 rounded-xl p-5 mb-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="text-red-200 font-semibold mb-1">Error Loading Responses</p>
                      <p className="text-red-300 text-sm">{responseError}</p>
                    </div>
                  </div>
                </div>
              )}

              {!loadingResponses && !responseError && responses.length === 0 && (
                <div className="text-center py-12 bg-zinc-800/50 rounded-xl border-2 border-dashed border-zinc-700">
                  <span className="text-5xl mb-4 block">📭</span>
                  <p className="text-zinc-300 font-semibold text-lg mb-2">No responses yet</p>
                  <p className="text-zinc-500 text-sm">
                    Responses will appear here once the candidate completes an interview
                  </p>
                </div>
              )}

              {!loadingResponses && !responseError && responses.length > 0 && (
                <div className="border-2 border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/50 shadow-lg">
                  {/* Overview Header */}
                  <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border-b border-zinc-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-zinc-100 text-lg">
                          Complete Interview Submission
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                          {responses.length} response{responses.length > 1 ? 's' : ''} • 
                          Total time: {Math.floor(responses.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0) / 60)} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-zinc-500">Submitted on</span>
                        <p className="text-sm font-medium text-zinc-300">
                          {new Date(responses[0].createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grouped Responses */}
                  <div className="divide-y divide-zinc-700">
                    {/* Technical 1 Section */}
                    {responses.filter(r => r.interviewType === 'technical1').length > 0 && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">💻</span>
                          <h4 className="font-semibold text-zinc-100">Technical Assessment 1 - Coding</h4>
                          <span className="ml-auto px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium">
                            {responses.filter(r => r.interviewType === 'technical1' && r.metadata?.completed).length} completed
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {responses.filter(r => r.interviewType === 'technical1').map((response) => (
                            <div key={response.id} className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
                              <button
                                onClick={() => setExpandedResponseId(expandedResponseId === response.id ? null : response.id)}
                                className="w-full p-3 text-left hover:bg-zinc-800/50 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-zinc-200 text-sm">{response.taskTitle}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {response.metadata?.difficulty && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          response.metadata.difficulty === 'Hard' 
                                            ? 'bg-red-950/50 text-red-300 border border-red-500/30' 
                                            : 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                                        }`}>
                                          {response.metadata.difficulty}
                                        </span>
                                      )}
                                      <span className="text-xs text-zinc-500">
                                        ⏱ {Math.floor(response.timeSpentSeconds / 60)}m {response.timeSpentSeconds % 60}s
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {response.metadata?.completed && (
                                      <span className="text-emerald-400 text-sm">✓</span>
                                    )}
                                    <span className="text-zinc-400 text-sm">
                                      {expandedResponseId === response.id ? '▼' : '▶'}
                                    </span>
                                  </div>
                                </div>
                              </button>
                              {expandedResponseId === response.id && response.response && (
                                <div className="px-3 pb-3 border-t border-zinc-700 pt-3 bg-zinc-950">
                                  <p className="text-xs text-zinc-500 mb-2 font-medium">CANDIDATE'S CODE:</p>
                                  <pre className="bg-zinc-900 p-3 rounded border border-zinc-700 text-xs text-zinc-200 overflow-x-auto">
                                    <code>{response.response}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical 2 Section */}
                    {responses.filter(r => r.interviewType === 'technical2').length > 0 && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">🏢</span>
                          <h4 className="font-semibold text-zinc-100">Technical Assessment 2 - Scenarios</h4>
                          <span className="ml-auto px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium">
                            {responses.filter(r => r.interviewType === 'technical2' && r.metadata?.completed).length} completed
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {responses.filter(r => r.interviewType === 'technical2').map((response) => (
                            <div key={response.id} className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
                              <button
                                onClick={() => setExpandedResponseId(expandedResponseId === response.id ? null : response.id)}
                                className="w-full p-3 text-left hover:bg-zinc-800/50 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-zinc-200 text-sm">{response.taskTitle}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {response.metadata?.difficulty && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          response.metadata.difficulty === 'Hard' 
                                            ? 'bg-red-950/50 text-red-300 border border-red-500/30' 
                                            : 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                                        }`}>
                                          {response.metadata.difficulty}
                                        </span>
                                      )}
                                      <span className="text-xs text-zinc-500">
                                        ⏱ {Math.floor(response.timeSpentSeconds / 60)}m {response.timeSpentSeconds % 60}s
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {response.metadata?.completed && (
                                      <span className="text-emerald-400 text-sm">✓</span>
                                    )}
                                    <span className="text-zinc-400 text-sm">
                                      {expandedResponseId === response.id ? '▼' : '▶'}
                                    </span>
                                  </div>
                                </div>
                              </button>
                              {expandedResponseId === response.id && (
                                <div className="px-3 pb-3 border-t border-zinc-700 pt-3 bg-zinc-950">
                                  {response.chatHistory && response.chatHistory.length > 0 && (
                                    <div>
                                      <p className="text-xs text-zinc-500 mb-2 font-medium">CHAT HISTORY:</p>
                                      <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {response.chatHistory.map((msg, idx) => (
                                          <div key={idx} className={`p-2 rounded text-xs ${
                                            msg.role === 'ai' 
                                              ? 'bg-indigo-950/30 border border-indigo-800/30 text-indigo-200' 
                                              : 'bg-zinc-800 border border-zinc-700 text-zinc-200'
                                          }`}>
                                            <span className="font-semibold">{msg.role === 'ai' ? '🤖 AI: ' : '👤 Candidate: '}</span>
                                            {msg.text}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {response.response && (
                                    <div className="mt-3">
                                      <p className="text-xs text-zinc-500 mb-2 font-medium">FINAL RESPONSE:</p>
                                      <div className="bg-zinc-900 p-3 rounded border border-zinc-700 text-xs text-zinc-200">
                                        {response.response}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Behavioural Section */}
                    {responses.filter(r => r.interviewType === 'behavioural').length > 0 && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">🧠</span>
                          <h4 className="font-semibold text-zinc-100">Behavioral Assessment</h4>
                          <span className="ml-auto px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium">
                            {responses.filter(r => r.interviewType === 'behavioural' && r.metadata?.completed).length} completed
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {responses.filter(r => r.interviewType === 'behavioural').map((response) => (
                            <div key={response.id} className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
                              <button
                                onClick={() => setExpandedResponseId(expandedResponseId === response.id ? null : response.id)}
                                className="w-full p-3 text-left hover:bg-zinc-800/50 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-zinc-200 text-sm">{response.taskTitle}</p>
                                    {response.metadata?.question && (
                                      <p className="text-xs text-zinc-400 mt-1 italic">
                                        Q: {response.metadata.question}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {response.metadata?.completed && (
                                      <span className="text-emerald-400 text-sm">✓</span>
                                    )}
                                    <span className="text-zinc-400 text-sm">
                                      {expandedResponseId === response.id ? '▼' : '▶'}
                                    </span>
                                  </div>
                                </div>
                              </button>
                              {expandedResponseId === response.id && response.response && (
                                <div className="px-3 pb-3 border-t border-zinc-700 pt-3 bg-zinc-950">
                                  <p className="text-xs text-zinc-500 mb-2 font-medium">CANDIDATE'S RESPONSE:</p>
                                  <div className="bg-zinc-900 p-3 rounded border border-zinc-700 text-sm text-zinc-200 whitespace-pre-wrap">
                                    {response.response}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analyze And Recommend Button */}
                  <div className="p-5 bg-gradient-to-r from-zinc-900 to-zinc-800 border-t-2 border-zinc-700">
                    <button 
                      onClick={analyzeAndRecommend}
                      disabled={analyzingCandidate}
                      className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {analyzingCandidate ? (
                        <>
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-white border-r-transparent"></div>
                          <span>Analyzing Candidate...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">🤖</span>
                          <span>Analyze And Recommend</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Recommendation Results */}
                  {showRecommendation && recommendation && (
                    <div className="p-5 bg-zinc-900 border-t-2 border-zinc-700">
                      <div className={`rounded-xl border-2 p-6 shadow-2xl ${
                        recommendation.decision === 'hire' 
                          ? 'bg-emerald-950/50 border-emerald-500/50'
                          : recommendation.decision === 'reject'
                          ? 'bg-red-950/50 border-red-500/50'
                          : 'bg-amber-950/50 border-amber-500/50'
                      }`}>
                        {/* Decision Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-zinc-800 shadow-lg">
                              <span className="text-4xl">
                                {recommendation.decision === 'hire' ? '✅' : 
                                 recommendation.decision === 'reject' ? '❌' : '⚠️'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-zinc-100 capitalize mb-2">
                                Recommendation: {recommendation.decision}
                              </h3>
                              {(recommendation as any).overallScore && (
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="px-3 py-1 bg-zinc-800 rounded-lg text-zinc-300 font-semibold">
                                    Overall: {(recommendation as any).overallScore}/10
                                  </span>
                                  <span className="px-3 py-1 bg-zinc-800 rounded-lg text-zinc-300 font-semibold">
                                    Technical: {(recommendation as any).technicalScore}/10
                                  </span>
                                  <span className="px-3 py-1 bg-zinc-800 rounded-lg text-zinc-300 font-semibold">
                                    Behavioral: {(recommendation as any).behavioralScore}/10
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div className="mb-5 bg-zinc-800/50 rounded-lg p-4">
                          <h4 className="font-bold text-zinc-100 mb-3 text-sm uppercase tracking-wide">Reasoning</h4>
                          <p className="text-zinc-300 leading-relaxed">{recommendation.reasoning}</p>
                        </div>

                        {/* Strengths */}
                        {recommendation.strengths && recommendation.strengths.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-zinc-100 mb-2 flex items-center gap-2">
                              <span>💪</span> Strengths
                            </h4>
                            <ul className="space-y-1">
                              {recommendation.strengths.map((strength, idx) => (
                                <li key={idx} className="text-zinc-300 text-sm flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Concerns */}
                        {recommendation.concerns && recommendation.concerns.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-zinc-100 mb-2 flex items-center gap-2">
                              <span>⚠️</span> Concerns
                            </h4>
                            <ul className="space-y-1">
                              {recommendation.concerns.map((concern, idx) => (
                                <li key={idx} className="text-zinc-300 text-sm flex items-start gap-2">
                                  <span className="text-amber-400 mt-0.5">•</span>
                                  <span>{concern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Email Preview */}
                        {recommendation.emailSubject && recommendation.emailBody && (
                          <div className="mt-5 pt-5 border-t border-zinc-700">
                            <h4 className="font-semibold text-zinc-100 mb-3 flex items-center gap-2">
                              <span>📧</span> Suggested Email
                            </h4>
                            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-4">
                              <div className="mb-3">
                                <p className="text-xs text-zinc-500 mb-1">Subject:</p>
                                <p className="font-medium text-zinc-200">{recommendation.emailSubject}</p>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Body:</p>
                                <div className="text-sm text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {recommendation.emailBody}
                                </div>
                              </div>
                            </div>

                            {/* Email Actions */}
                            <div className="flex gap-3">
                              <button
                                onClick={sendDecisionEmail}
                                disabled={sendingEmail}
                                className={`flex-1 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base ${
                                  recommendation.decision === 'hire'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : recommendation.decision === 'reject'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {sendingEmail ? (
                                  <>
                                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>📨</span>
                                    <span>Send Email</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setShowRecommendation(false)}
                                className="px-6 py-3.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect, JSX } from "react";

// Simple markdown-like formatting renderer
function formatFeedback(text: string) {
    const lines = text.split('\n');
    const formatted: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Headers
        if (line.startsWith('### ')) {
            formatted.push(
                <h3 key={key++} className="text-lg font-semibold mt-6 mb-3 text-emerald-400">
                    {line.replace('### ', '')}
                </h3>
            );
        } else if (line.startsWith('## ')) {
            formatted.push(
                <h2 key={key++} className="text-xl font-semibold mt-8 mb-4 text-indigo-400">
                    {line.replace('## ', '')}
                </h2>
            );
        } else if (line.startsWith('# ')) {
            formatted.push(
                <h1 key={key++} className="text-2xl font-bold mt-8 mb-4">
                    {line.replace('# ', '')}
                </h1>
            );
        }
        // Bullet points
        else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            formatted.push(
                <li key={key++} className="text-zinc-300 ml-4 mb-2">
                    {line.trim().substring(2)}
                </li>
            );
        }
        // Numbered lists
        else if (/^\d+\.\s/.test(line.trim())) {
            formatted.push(
                <li key={key++} className="text-zinc-300 ml-4 mb-2">
                    {line.trim().replace(/^\d+\.\s/, '')}
                </li>
            );
        }
        // Bold text
        else if (line.includes('**')) {
            const parts = line.split('**');
            const formatted_line: (JSX.Element | string)[] = [];
            parts.forEach((part, idx) => {
                if (idx % 2 === 1) {
                    formatted_line.push(<strong key={`${key}-${idx}`} className="font-semibold text-zinc-100">{part}</strong>);
                } else {
                    formatted_line.push(part);
                }
            });
            formatted.push(
                <p key={key++} className="text-zinc-300 leading-relaxed mb-4">
                    {formatted_line}
                </p>
            );
        }
        // Regular paragraphs
        else if (line.trim().length > 0) {
            formatted.push(
                <p key={key++} className="text-zinc-300 leading-relaxed mb-4">
                    {line}
                </p>
            );
        }
        // Empty lines
        else {
            formatted.push(<div key={key++} className="h-2" />);
        }
    }

    return <div>{formatted}</div>;
}

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [stats, setStats] = useState<{
        totalResponses: number;
        technical1Count: number;
        technical2Count: number;
        behaviouralCount: number;
        totalTimeSpent: number;
    } | null>(null);
    const [candidateEmail, setCandidateEmail] = useState('');
    const [dataSyncStatus, setDataSyncStatus] = useState<'checking' | 'synced' | 'error'>('checking');

    useEffect(() => {
        const email = localStorage.getItem('candidateEmail') || 'candidate@example.com';
        setCandidateEmail(email);
        
        // Verify data sync with manager dashboard
        verifyDataSync(email);
        
        // Fetch performance analysis
        analyzPerformance(email);
    }, []);

    async function verifyDataSync(email: string) {
        try {
            const response = await fetch('/api/get-responses');
            const data = await response.json();
            
            if (data.success) {
                const candidateResponses = data.responses.filter(
                    (r: any) => r.candidateEmail === email
                );
                
                if (candidateResponses.length > 0) {
                    setDataSyncStatus('synced');
                    console.log('✅ Data successfully synced to manager dashboard:', candidateResponses.length, 'responses');
                } else {
                    setDataSyncStatus('error');
                }
            } else {
                setDataSyncStatus('error');
            }
        } catch (err) {
            console.error('Failed to verify data sync:', err);
            setDataSyncStatus('error');
        }
    }

    async function analyzPerformance(email: string) {
        setIsLoading(true);
        setError("");
        
        try {
            const response = await fetch('/api/analyze-performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateEmail: email }),
            });

            if (!response.ok) {
                throw new Error(`Failed to analyze performance: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                setFeedback(data.feedback);
                setStats(data.stats);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            console.error('❌ Error fetching feedback:', err);
            setError(err instanceof Error ? err.message : 'Failed to load feedback');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="mx-auto max-w-4xl px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 mb-4">
                        <span className="text-3xl">✓</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
                    <p className="text-zinc-400">
                        Thank you for completing the technical interview. Here's your personalized feedback.
                    </p>
                </div>

                {/* Data Sync Status */}
                <div className="mb-8">
                    {dataSyncStatus === 'checking' && (
                        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 flex items-center gap-4">
                            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-indigo-500 border-r-transparent"></div>
                            <div className="flex-1">
                                <p className="font-semibold text-zinc-200">Syncing your responses...</p>
                                <p className="text-sm text-zinc-500 mt-0.5">Sending your interview data to the hiring team</p>
                            </div>
                        </div>
                    )}
                    
                    {dataSyncStatus === 'synced' && (
                        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-950/30 p-5 flex items-center gap-4 shadow-lg shadow-emerald-900/20">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-emerald-300 text-lg">All Responses Submitted Successfully!</p>
                                <p className="text-sm text-emerald-200/80 mt-1">
                                    Your interview data has been sent to the manager dashboard. The hiring team can now review your responses.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {dataSyncStatus === 'error' && (
                        <div className="rounded-xl border-2 border-amber-500/40 bg-amber-950/30 p-5 flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-amber-300">Verifying submission status...</p>
                                <p className="text-sm text-amber-200/80 mt-1">
                                    Your responses were saved. If you have concerns, please contact the hiring team.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center">
                            <div className="text-2xl font-bold text-indigo-400">{stats.totalResponses}</div>
                            <div className="text-xs text-zinc-500 mt-1">Tasks Completed</div>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">{stats.technical1Count}</div>
                            <div className="text-xs text-zinc-500 mt-1">Technical 1</div>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center">
                            <div className="text-2xl font-bold text-amber-400">{stats.technical2Count}</div>
                            <div className="text-xs text-zinc-500 mt-1">Technical 2</div>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400">{stats.behaviouralCount}</div>
                            <div className="text-xs text-zinc-500 mt-1">Behavioral</div>
                        </div>
                    </div>
                )}

                {/* Feedback Section */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 mb-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span>📊</span>
                        <span>Your Performance Analysis</span>
                    </h2>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
                            <p className="text-zinc-400">Analyzing your interview responses...</p>
                            <p className="text-xs text-zinc-600 mt-2">This may take 10-15 seconds</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-red-800 bg-red-950/30 p-6 text-center">
                            <p className="text-red-400 mb-2">❌ {error}</p>
                            <button
                                onClick={() => analyzPerformance(candidateEmail)}
                                className="text-sm text-red-300 hover:text-red-200 underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-none">
                            {formatFeedback(feedback)}
                        </div>
                    )}
                </div>

                {/* Time Spent */}
                {stats && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Total Time Spent</p>
                                <p className="text-2xl font-bold">
                                    {Math.floor(stats.totalTimeSpent / 60)} min {stats.totalTimeSpent % 60} sec
                                </p>
                            </div>
                            <div className="text-4xl">⏱️</div>
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                <div className="rounded-xl border border-indigo-600/30 bg-indigo-950/20 p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>🎯</span>
                        <span>Next Steps</span>
                    </h3>
                    <ul className="space-y-2 text-sm text-zinc-300">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span><strong className="text-emerald-300">Your responses are now available</strong> on the manager dashboard for review</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">→</span>
                            <span>Our team will review your responses within 2-3 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">→</span>
                            <span>You'll receive an email with the final decision and next steps</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">→</span>
                            <span>Use the feedback above to continue improving your skills</span>
                        </li>
                    </ul>
                </div>


            </div>
        </div>
    );
}

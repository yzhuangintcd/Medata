"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ─── Scenario data ─── */
const scenarios = [
    {
        id: 1,
        title: "Conflict Resolution",
        situation:
            "You're leading a sprint and two senior engineers publicly disagree on the architecture for a critical microservice during a team meeting. One wants event-driven with Kafka; the other insists on synchronous REST. The debate is getting heated and the rest of the team has gone silent.",
    },
];

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ScenarioProgress {
    messages: Message[];
    completed: boolean;
}

interface CultureValue {
    id: string;
    value: string;
    description: string;
}

export default function BehaviouralPage() {
    const [activeScenario, setActiveScenario] = useState(0);
    const [scenarioProgress, setScenarioProgress] = useState<Record<number, ScenarioProgress>>({});
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [candidateEmail, setCandidateEmail] = useState('candidate@example.com');
    const [cultureValues, setCultureValues] = useState<CultureValue[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scenario = scenarios[activeScenario];
    const progress = scenarioProgress[scenario.id];
    const role = "Senior Software Engineer";

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [progress?.messages]);

    // Load progress from localStorage on mount
    useEffect(() => {
        const savedProgress = localStorage.getItem('behavioural_progress');
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                // Validate that the data has the new format (messages array)
                let isValidFormat = true;
                for (const key in parsed) {
                    if (!parsed[key].messages || !Array.isArray(parsed[key].messages)) {
                        isValidFormat = false;
                        break;
                    }
                }
                if (isValidFormat) {
                    setScenarioProgress(parsed);
                } else {
                    // Clear old format data
                    console.log('Clearing old format behavioral progress');
                    localStorage.removeItem('behavioural_progress');
                }
            } catch (e) {
                console.error('Failed to parse saved progress', e);
                localStorage.removeItem('behavioural_progress');
            }
        }
        
        // Get email from localStorage or URL params
        let email = localStorage.getItem('candidateEmail');
        if (!email) {
            const params = new URLSearchParams(window.location.search);
            email = params.get('email') || 'candidate@example.com';
            if (email) {
                localStorage.setItem('candidateEmail', email);
            }
        }
        setCandidateEmail(email);

        // Load company culture values
        const savedCultureValues = localStorage.getItem('companyCultureValues');
        if (savedCultureValues) {
            try {
                const values = JSON.parse(savedCultureValues);
                setCultureValues(values);
            } catch (e) {
                console.error('Failed to parse culture values', e);
                setCultureValues([
                    { id: '1', value: 'Communication', description: 'Effective sharing of ideas' },
                    { id: '2', value: 'Empathy', description: 'Understanding others perspectives' },
                    { id: '3', value: 'Decision-making', description: 'Making informed choices' },
                    { id: '4', value: 'Leadership', description: 'Guiding and inspiring teams' },
                    { id: '5', value: 'Integrity', description: 'Acting with honesty and ethics' },
                ]);
            }
        } else {
            setCultureValues([
                { id: '1', value: 'Communication', description: 'Effective sharing of ideas' },
                { id: '2', value: 'Empathy', description: 'Understanding others perspectives' },
                { id: '3', value: 'Decision-making', description: 'Making informed choices' },
                { id: '4', value: 'Leadership', description: 'Guiding and inspiring teams' },
                { id: '5', value: 'Integrity', description: 'Acting with honesty and ethics' },
            ]);
        }
    }, []);

    // Start conversation if no progress exists
    useEffect(() => {
        if (!progress && !isLoadingMessage) {
            startConversation();
        }
    }, [activeScenario]);

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        if (Object.keys(scenarioProgress).length > 0) {
            localStorage.setItem('behavioural_progress', JSON.stringify(scenarioProgress));
        }
    }, [scenarioProgress]);

    async function startConversation() {
        setIsLoadingMessage(true);
        try {
            const apiResponse = await fetch("/api/behavioral-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario,
                    role,
                    conversationHistory: [],
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`API error: ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            
            if (!data.response) {
                throw new Error("No response from AI");
            }

            // Initialize conversation with AI's first message
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    messages: [{ role: 'assistant', content: data.response }],
                    completed: false,
                }
            }));
        } catch (error) {
            console.error("❌ Error starting conversation:", error);
            // Provide a fallback message
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    messages: [{ 
                        role: 'assistant', 
                        content: "How would you handle this situation? Walk me through your thinking step by step." 
                    }],
                    completed: false,
                }
            }));
        } finally {
            setIsLoadingMessage(false);
        }
    }

    async function sendMessage() {
        if (!inputValue.trim() || isLoadingMessage || !progress || progress.completed) return;

        const userMessage = inputValue.trim();
        setInputValue("");

        // Add user message to conversation
        const updatedMessages = [...progress.messages, { role: 'user' as const, content: userMessage }];
        
        setScenarioProgress(prev => ({
            ...prev,
            [scenario.id]: {
                ...prev[scenario.id],
                messages: updatedMessages,
            }
        }));

        // Get AI response
        setIsLoadingMessage(true);
        try {
            const apiResponse = await fetch("/api/behavioral-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario,
                    role,
                    conversationHistory: updatedMessages,
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`API error: ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            
            if (!data.response) {
                throw new Error("No response from AI");
            }

            // Add AI response to conversation
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    ...prev[scenario.id],
                    messages: [...updatedMessages, { role: 'assistant', content: data.response }],
                }
            }));
        } catch (error) {
            console.error("❌ Error getting AI response:", error);
            // Show error message in chat
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    ...prev[scenario.id],
                    messages: [...updatedMessages, { 
                        role: 'assistant', 
                        content: "I apologize, I'm having trouble responding right now. Please continue with your thoughts." 
                    }],
                }
            }));
        } finally {
            setIsLoadingMessage(false);
        }
    }

    async function completeInterview() {
        if (!progress || progress.completed || isSubmitting) return;

        // Need at least one user message to complete
        const hasUserMessage = progress.messages.some(m => m.role === 'user');
        if (!hasUserMessage) {
            alert('Please respond to at least one question before completing the interview.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Save entire conversation to database
            await fetch('/api/save-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: `candidate-${Date.now()}`,
                    candidateEmail: candidateEmail,
                    interviewType: 'behavioural',
                    taskId: scenario.id,
                    taskTitle: scenario.title,
                    response: JSON.stringify(progress.messages), // Store entire conversation
                    timeSpentSeconds: 0,
                    metadata: {
                        scenario: scenario.situation,
                        conversationLength: progress.messages.length,
                        completed: true,
                    },
                }),
            });
            
            console.log('✅ Behavioural conversation saved to database');
            
            // Mark as completed
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    ...prev[scenario.id],
                    completed: true,
                }
            }));
        } catch (error) {
            console.error('❌ Failed to save to database:', error);
            alert('Failed to complete interview. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function handleScenarioSwitch(idx: number) {
        const newScenario = scenarios[idx];
        setActiveScenario(idx);
        setInputValue("");
    }

    return (
        <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
            {/* ─── Left Panel: Scenario & selector ─── */}
            <div className="w-[420px] shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-y-auto">
                {/* Scenario tabs */}
                <div className="flex flex-wrap border-b border-zinc-800">
                    {scenarios.map((s, idx) => {
                        const isCompleted = scenarioProgress[s.id]?.completed;
                        return (
                            <button
                                key={s.id}
                                onClick={() => handleScenarioSwitch(idx)}
                                className={`flex-1 px-2 py-3 text-xs font-medium transition-colors relative ${idx === activeScenario
                                        ? "bg-zinc-800 text-indigo-400 border-b-2 border-indigo-500"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                    }`}
                            >
                                {isCompleted && <span className="absolute top-1 right-1 text-emerald-400">✓</span>}
                                {s.id}. {s.title}
                            </button>
                        );
                    })}
                </div>

                {/* Active scenario detail */}
                <div className="p-5 flex-1">
                    <h2 className="text-xl font-bold mb-1">{scenario.title}</h2>
                    <span className="text-xs text-zinc-500 mb-4 block">
                        Scenario {scenario.id} of {scenarios.length}
                    </span>

                    {/* Situation card */}
                    <div className="rounded-lg border border-amber-700/30 bg-amber-950/20 p-4 mb-6">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                            📋 The Situation
                        </h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {scenario.situation}
                        </p>
                    </div>

                    {/* Assessment rubric hint */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                            🎯 What We're Assessing
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {cultureValues.length > 0 ? (
                                cultureValues.map((cv) => (
                                    <span
                                        key={cv.id}
                                        className="rounded-full bg-zinc-700 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300"
                                        title={cv.description}
                                    >
                                        {cv.value}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] text-zinc-500 italic">Loading culture values...</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Right Panel: Chat Interface ─── */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-5 py-3">
                    <span className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                        AI
                    </span>
                    <div>
                        <p className="text-sm font-semibold">AI Interviewer</p>
                        <p className="text-[10px] text-zinc-500">
                            Behavioural Assessment • Scenario {scenario.id}
                        </p>
                    </div>
                    {progress?.completed && (
                        <span className="ml-auto text-emerald-400 text-xs font-medium">✓ Completed</span>
                    )}
                </div>

                {/* Chat Messages */}
                {isLoadingMessage && !progress ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
                            <p className="text-zinc-400">Starting conversation...</p>
                        </div>
                    </div>
                ) : progress ? (
                    <>
                        {/* Messages container */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {progress.messages && Array.isArray(progress.messages) && progress.messages.map((message, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3.5 ${
                                            message.role === 'user'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold mb-1 opacity-70">
                                            {message.role === 'user' ? 'You' : 'AI Interviewer'}
                                        </p>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Loading indicator */}
                            {isLoadingMessage && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3.5">
                                        <p className="text-xs font-semibold mb-1 opacity-70">AI Interviewer</p>
                                        <div className="flex gap-1.5">
                                            <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div className="border-t border-zinc-800 bg-zinc-900 p-4">
                            {progress.completed ? (
                                <div className="text-center py-4">
                                    <span className="text-emerald-400 text-sm font-medium">✓ Interview completed and saved</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your response... (Press Enter to send)"
                                                disabled={isLoadingMessage}
                                                className="w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <button
                                            onClick={sendMessage}
                                            disabled={isLoadingMessage || !inputValue.trim()}
                                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Send
                                        </button>
                                        <button
                                            onClick={completeInterview}
                                            disabled={isSubmitting || isLoadingMessage}
                                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Completing...' : 'Complete Interview'}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-[10px] text-zinc-600">
                                        Have a natural conversation. Click "Complete Interview" when you're done to save the conversation.
                                    </p>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-zinc-500">Preparing scenario...</p>
                    </div>
                )}
            </div>

            {/* ─── Bottom navigation ─── */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-6 py-3">
                <Link
                    href="/interview_environment/technical2"
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    ← Back to Technical 2
                </Link>
                {progress?.completed ? (
                    <Link
                        href="/interview_environment/feedback"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                    >
                        Complete Interview & Get Feedback ✓
                    </Link>
                ) : (
                    <button
                        disabled
                        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-500 cursor-not-allowed"
                        title="Please complete the behavioral scenario first"
                    >
                        Complete Interview & Get Feedback ✓
                    </button>
                )}
            </div>
        </div>
    );
}

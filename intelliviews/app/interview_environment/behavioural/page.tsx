"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ─── Scenario data ─── */
const scenarios = [
    {
        id: 1,
        title: "Conflict Resolution",
        situation:
            "You're leading a sprint and two senior engineers publicly disagree on the architecture for a critical microservice during a team meeting. One wants event-driven with Kafka; the other insists on synchronous REST. The debate is getting heated and the rest of the team has gone silent.",
    },
];

interface ScenarioProgress {
    question: string;
    userResponse: string;
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
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [candidateEmail, setCandidateEmail] = useState('candidate@example.com');
    const [cultureValues, setCultureValues] = useState<CultureValue[]>([]);

    const scenario = scenarios[activeScenario];
    const progress = scenarioProgress[scenario.id];
    const role = "Senior Software Engineer";

    // Load progress from localStorage on mount
    useEffect(() => {
        const savedProgress = localStorage.getItem('behavioural_progress');
        if (savedProgress) {
            try {
                setScenarioProgress(JSON.parse(savedProgress));
            } catch (e) {
                console.error('Failed to parse saved progress', e);
            }
        }
        
        const email = localStorage.getItem('candidateEmail');
        if (email) {
            setCandidateEmail(email);
        }

        // Load company culture values
        const savedCultureValues = localStorage.getItem('companyCultureValues');
        if (savedCultureValues) {
            try {
                const values = JSON.parse(savedCultureValues);
                setCultureValues(values);
            } catch (e) {
                console.error('Failed to parse culture values', e);
                // Fallback to default values
                setCultureValues([
                    { id: '1', value: 'Communication', description: 'Effective sharing of ideas' },
                    { id: '2', value: 'Empathy', description: 'Understanding others perspectives' },
                    { id: '3', value: 'Decision-making', description: 'Making informed choices' },
                    { id: '4', value: 'Leadership', description: 'Guiding and inspiring teams' },
                    { id: '5', value: 'Integrity', description: 'Acting with honesty and ethics' },
                ]);
            }
        } else {
            // Default values if none are set
            setCultureValues([
                { id: '1', value: 'Communication', description: 'Effective sharing of ideas' },
                { id: '2', value: 'Empathy', description: 'Understanding others perspectives' },
                { id: '3', value: 'Decision-making', description: 'Making informed choices' },
                { id: '4', value: 'Leadership', description: 'Guiding and inspiring teams' },
                { id: '5', value: 'Integrity', description: 'Acting with honesty and ethics' },
            ]);
        }
    }, []);

    // Load question for scenario if not already loaded
    useEffect(() => {
        if (!progress && !isLoadingQuestion) {
            loadQuestion();
        } else if (progress && !progress.completed) {
            setInputValue(progress.userResponse || "");
        }
    }, [activeScenario]);

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        if (Object.keys(scenarioProgress).length > 0) {
            localStorage.setItem('behavioural_progress', JSON.stringify(scenarioProgress));
        }
    }, [scenarioProgress]);

    async function loadQuestion() {
        setIsLoadingQuestion(true);
        try {
            const apiResponse = await fetch("/api/behavioral-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario,
                    role,
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`API error: ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            
            if (!data.response) {
                throw new Error("No response from AI");
            }

            // Save the question to progress
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    question: data.response,
                    userResponse: "",
                    completed: false,
                }
            }));
        } catch (error) {
            console.error("❌ Error loading question:", error);
            // Provide a fallback question
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    question: "How would you handle this situation? Walk me through your thinking.",
                    userResponse: "",
                    completed: false,
                }
            }));
        } finally {
            setIsLoadingQuestion(false);
        }
    }

    function handleInputChange(value: string) {
        setInputValue(value);
        // Auto-save the response as they type
        if (progress) {
            setScenarioProgress(prev => ({
                ...prev,
                [scenario.id]: {
                    ...prev[scenario.id],
                    userResponse: value,
                }
            }));
        }
    }

    async function handleSubmit() {
        if (!inputValue.trim() || isSubmitting || !progress) return;

        // Check if already completed - prevent duplicate submissions
        if (progress.completed) {
            alert('This scenario has already been submitted.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Save to database
            await fetch('/api/save-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: `candidate-${Date.now()}`,
                    candidateEmail: candidateEmail,
                    interviewType: 'behavioural',
                    taskId: scenario.id,
                    taskTitle: scenario.title,
                    response: inputValue,
                    timeSpentSeconds: 0,
                    metadata: {
                        question: progress.question,
                        scenario: scenario.situation,
                        completed: true,
                    },
                }),
            });
            
            console.log('✅ Behavioural response saved to database');
            
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
            alert('Failed to submit response. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleScenarioSwitch(idx: number) {
        const newScenario = scenarios[idx];
        setActiveScenario(idx);
        const newProgress = scenarioProgress[newScenario.id];
        setInputValue(newProgress?.userResponse || "");
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

            {/* ─── Right Panel: Response interface ─── */}
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

                {/* Question display */}
                {isLoadingQuestion ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
                            <p className="text-zinc-400">Loading interview question...</p>
                        </div>
                    </div>
                ) : progress ? (
                    <div className="flex-1 flex flex-col">
                        {/* Question */}
                        <div className="bg-zinc-800/50 border-l-4 border-indigo-500 p-5 m-5">
                            <p className="text-xs font-semibold text-indigo-400 mb-2">INTERVIEW QUESTION</p>
                            <p className="text-sm text-zinc-200 leading-relaxed">{progress.question}</p>
                        </div>

                        {/* Response area */}
                        <div className="flex-1 p-5 pt-0">
                            <label className="text-xs font-semibold text-zinc-400 mb-2 block">YOUR RESPONSE</label>
                            <textarea
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Type your response here... Be specific and use examples from your experience."
                                disabled={progress.completed || isSubmitting}
                                className="w-full h-[calc(100%-2rem)] resize-none rounded-lg bg-zinc-800 p-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Submit button */}
                        <div className="border-t border-zinc-800 bg-zinc-900 p-4">
                            <div className="flex gap-3 items-center justify-end">
                                {progress.completed ? (
                                    <span className="text-emerald-400 text-sm font-medium">✓ Response submitted</span>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !inputValue.trim()}
                                        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Response"}
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 text-[10px] text-zinc-600 text-right">
                                <p>Tip: Be specific and use real examples from your experience.</p>
                            </div>
                        </div>
                    </div>
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

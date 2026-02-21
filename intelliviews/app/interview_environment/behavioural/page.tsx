"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Scenario data ─── */
const scenarios = [
    {
        id: 1,
        title: "Conflict Resolution",
        situation:
            "You're leading a sprint and two senior engineers publicly disagree on the architecture for a critical microservice during a team meeting. One wants event-driven with Kafka; the other insists on synchronous REST. The debate is getting heated and the rest of the team has gone silent.",
    },
    {
        id: 2,
        title: "Handling Ambiguity",
        situation:
            "Your product manager just left the company mid-sprint. The feature you're building has incomplete requirements — there's no spec for error states, edge cases, or the mobile experience. Stakeholders expect a demo in 5 days.",
    },
    {
        id: 3,
        title: "Giving Difficult Feedback",
        situation:
            "A teammate you're close with has been consistently missing deadlines and their code quality has dropped noticeably over the past month. Other team members have started picking up the slack quietly, and morale is slipping. Your manager hasn't noticed yet.",
    },
    {
        id: 4,
        title: "Ethical Decision Making",
        situation:
            "You discover that a feature your team shipped is collecting more user data than disclosed in the privacy policy. It's driving great engagement metrics and leadership is thrilled. You're the only one who seems to have noticed the discrepancy.",
    },
];

export default function BehaviouralPage() {
    const [activeScenario, setActiveScenario] = useState(0);
    const [responses, setResponses] = useState<Record<number, string>>({});
    const [currentFollowUp, setCurrentFollowUp] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenCount, setTokenCount] = useState(0);
    const [chatHistory, setChatHistory] = useState<
        { role: "ai" | "candidate"; text: string }[]
    >([
        {
            role: "ai",
            text: "Welcome to the behavioural assessment. I'm going to walk you through several realistic workplace scenarios. There are no right or wrong answers — I'm interested in how you think, communicate, and navigate complex situations. Let's begin with the first scenario. Read it carefully, then tell me how you'd respond.",
        },
    ]);
    const [inputValue, setInputValue] = useState("");

    const scenario = scenarios[activeScenario];
    const role = "Senior Software Engineer"; // Can be passed as prop or from session

    async function handleSend() {
        if (!inputValue.trim() || isLoading) return;

        setIsLoading(true);
        const candidateInput = inputValue;

        // Add candidate response to chat immediately
        const newHistory = [
            ...chatHistory,
            { role: "candidate" as const, text: candidateInput },
        ];

        setChatHistory(newHistory);
        setResponses({ ...responses, [activeScenario]: candidateInput });
        setInputValue("");

        try {
            // Call Claude API for AI-generated follow-up
            const apiResponse = await fetch("/api/behavioral-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario,
                    candidateResponse: candidateInput,
                    role,
                    questionNumber: currentFollowUp + 1,
                }),
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                console.error("API Error:", errorData);
                throw new Error(`API error: ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            
            if (!data.response) {
                throw new Error("No response from AI");
            }

            const aiMessage = data.response;

            // Update token count
            if (data.tokenUsage) {
                setTokenCount(data.tokenUsage.cumulativeTotal);
                console.log(`✅ Token usage: ${data.tokenUsage.total} | Total: ${data.tokenUsage.estimatedCost}`);
            }

            // Add Claude's AI-generated response to chat
            newHistory.push({
                role: "ai" as const,
                text: aiMessage,
            });
            
            setChatHistory(newHistory);
            setCurrentFollowUp((prev) => prev + 1);
        } catch (error) {
            console.error("❌ Error getting AI response:", error);
            // Remove the last candidate message and show error
            newHistory.pop();
            newHistory.push({
                role: "ai" as const,
                text: "Sorry, I encountered an error generating a response. Please try again.",
            });
            setChatHistory(newHistory);
        } finally {
            setIsLoading(false);
        }
    }

    function handleScenarioSwitch(idx: number) {
        setActiveScenario(idx);
        setCurrentFollowUp(0);
        setChatHistory([
            {
                role: "ai",
                text: `Let's move on to a new scenario: "${scenarios[idx].title}". Read the situation carefully and share your initial response.`,
            },
        ]);
    }

    return (
        <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
            {/* ─── Left Panel: Scenario & selector ─── */}
            <div className="w-[420px] shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-y-auto">
                {/* Scenario tabs */}
                <div className="flex flex-wrap border-b border-zinc-800">
                    {scenarios.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => handleScenarioSwitch(idx)}
                            className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${idx === activeScenario
                                ? "bg-zinc-800 text-indigo-400 border-b-2 border-indigo-500"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                        >
                            {s.id}. {s.title}
                        </button>
                    ))}
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

                    {/* Follow-up questions preview */}
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                            💬 Live Conversation
                        </h3>
                        <div className="text-sm text-zinc-400">
                            <p>Questions asked: {currentFollowUp}</p>
                            <p className="text-[10px] text-zinc-600 mt-1">
                                The AI interviewer will dynamically ask follow-ups based on your responses.
                            </p>
                        </div>
                    </div>

                    {/* Assessment rubric hint */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                            🎯 What We're Assessing
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Communication",
                                "Empathy",
                                "Decision-making",
                                "Leadership",
                                "Integrity",
                            ].map((trait) => (
                                <span
                                    key={trait}
                                    className="rounded-full bg-zinc-700 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300"
                                >
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Right Panel: Chat interface ─── */}
            <div className="flex-1 flex flex-col">
                {/* Chat header */}
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
                    <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {chatHistory.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === "candidate"
                                    ? "bg-indigo-600 text-white rounded-br-sm"
                                    : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input bar */}
                <div className="border-t border-zinc-800 bg-zinc-900 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                            placeholder="Type your response..."
                            disabled={isLoading}
                            className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-indigo-500 transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Thinking..." : "Send"}
                        </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-600">
                        <p>Tip: Be specific and use real examples from your experience.</p>
                        {tokenCount > 0 && (
                            <span className="text-zinc-500">
                                Tokens used: {tokenCount} (~${(tokenCount * 0.00015).toFixed(3)})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Bottom navigation ─── */}
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-6 py-3">
                <Link
                    href="/interview_environment/technical2"
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    ← Back to Technical 2
                </Link>
                <Link
                    href="/interview_environment"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                    Complete Interview ✓
                </Link>
            </div>
        </div>
    );
}

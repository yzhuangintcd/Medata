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
        followUps: [
            "How do you de-escalate the situation in the meeting?",
            "What framework would you use to evaluate both proposals objectively?",
            "How do you ensure the person whose approach isn't chosen still feels valued?",
        ],
    },
    {
        id: 2,
        title: "Handling Ambiguity",
        situation:
            "Your product manager just left the company mid-sprint. The feature you're building has incomplete requirements — there's no spec for error states, edge cases, or the mobile experience. Stakeholders expect a demo in 5 days.",
        followUps: [
            "What's the first thing you do after learning this news?",
            "How do you prioritise what to build vs what to cut?",
            "How do you communicate uncertainty to stakeholders without losing their confidence?",
        ],
    },
    {
        id: 3,
        title: "Giving Difficult Feedback",
        situation:
            "A teammate you're close with has been consistently missing deadlines and their code quality has dropped noticeably over the past month. Other team members have started picking up the slack quietly, and morale is slipping. Your manager hasn't noticed yet.",
        followUps: [
            "Do you talk to your teammate directly, go to your manager, or both? Why?",
            "How would you structure the conversation with your teammate?",
            "What if they become defensive or dismiss your concerns?",
        ],
    },
    {
        id: 4,
        title: "Ethical Decision Making",
        situation:
            "You discover that a feature your team shipped is collecting more user data than disclosed in the privacy policy. It's driving great engagement metrics and leadership is thrilled. You're the only one who seems to have noticed the discrepancy.",
        followUps: [
            "What's your immediate course of action?",
            "How do you raise this without sounding accusatory?",
            "What if leadership asks you to keep quiet until after the funding round?",
        ],
    },
];

export default function BehaviouralPage() {
    const [activeScenario, setActiveScenario] = useState(0);
    const [responses, setResponses] = useState<Record<number, string>>({});
    const [currentFollowUp, setCurrentFollowUp] = useState(0);
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

    function handleSend() {
        if (!inputValue.trim()) return;

        const newHistory = [
            ...chatHistory,
            { role: "candidate" as const, text: inputValue },
        ];

        // AI follow-up
        if (currentFollowUp < scenario.followUps.length) {
            newHistory.push({
                role: "ai" as const,
                text: `Interesting perspective. Let me dig deeper: ${scenario.followUps[currentFollowUp]}`,
            });
            setCurrentFollowUp((prev) => prev + 1);
        } else {
            newHistory.push({
                role: "ai" as const,
                text: "Great — I've captured your responses for this scenario. Feel free to move to the next scenario when you're ready.",
            });
        }

        setChatHistory(newHistory);
        setResponses({ ...responses, [activeScenario]: inputValue });
        setInputValue("");
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
                            Follow-up questions
                        </h3>
                        <ul className="space-y-2">
                            {scenario.followUps.map((q, i) => (
                                <li
                                    key={i}
                                    className={`text-sm leading-relaxed flex items-start gap-2 ${i < currentFollowUp ? "text-zinc-500" : "text-zinc-400"
                                        }`}
                                >
                                    <span
                                        className={`mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-[10px] ${i < currentFollowUp
                                                ? "bg-emerald-600 text-white"
                                                : "bg-zinc-800 text-zinc-500"
                                            }`}
                                    >
                                        {i < currentFollowUp ? "✓" : i + 1}
                                    </span>
                                    {q}
                                </li>
                            ))}
                        </ul>
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
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type your response..."
                            className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-indigo-500 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                        >
                            Send
                        </button>
                    </div>
                    <p className="mt-2 text-[10px] text-zinc-600">
                        Tip: Be specific and use real examples from your experience. The AI will follow up with deeper questions.
                    </p>
                </div>
            </div>

            {/* ─── Bottom navigation ─── */}
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-6 py-3">
                <Link
                    href="/interview_environment/technical"
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    ← Back to Technical
                </Link>
                <Link
                    href="/interview_environment/simulation"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Continue to Simulation →
                </Link>
            </div>
        </div>
    );
}

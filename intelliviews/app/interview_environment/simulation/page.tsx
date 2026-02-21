"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Simulated workspace data ─── */
const slackMessages = [
    {
        id: 1,
        channel: "#eng-team",
        sender: "Sarah (PM)",
        avatar: "SP",
        time: "9:02 AM",
        text: "Hey team — stakeholder demo moved to 3 PM today instead of Friday. We need the dashboard feature working by then. Prioritise this over everything else.",
        urgent: true,
    },
    {
        id: 2,
        channel: "#eng-team",
        sender: "Mike (Backend)",
        avatar: "MB",
        time: "9:15 AM",
        text: "Heads up: the staging DB is throwing connection pool errors. I think it's related to the migration I ran last night. Looking into it.",
        urgent: true,
    },
    {
        id: 3,
        channel: "#general",
        sender: "Lisa (Design)",
        avatar: "LD",
        time: "9:20 AM",
        text: "Updated the Figma for the dashboard cards — added loading states and error states. Can someone on frontend take a look? 🎨",
        urgent: false,
    },
    {
        id: 4,
        channel: "#eng-team",
        sender: "Alex (QA)",
        avatar: "AQ",
        time: "9:32 AM",
        text: "Found a P1 bug in production — users on the free tier can access premium features by modifying the JWT. Security issue.",
        urgent: true,
    },
    {
        id: 5,
        channel: "#random",
        sender: "HR Bot",
        avatar: "HR",
        time: "9:45 AM",
        text: "Reminder: Team retro is at 4:30 PM today. Please fill out the feedback form before the meeting.",
        urgent: false,
    },
];

const kanbanTasks = [
    {
        id: "TASK-101",
        title: "Build dashboard chart component",
        status: "in-progress",
        priority: "high",
        assignee: "You",
    },
    {
        id: "TASK-102",
        title: "Fix JWT validation on free tier",
        status: "todo",
        priority: "critical",
        assignee: "Unassigned",
    },
    {
        id: "TASK-103",
        title: "Review Lisa's design updates",
        status: "todo",
        priority: "medium",
        assignee: "You",
    },
    {
        id: "TASK-104",
        title: "Investigate staging DB errors",
        status: "in-progress",
        priority: "high",
        assignee: "Mike",
    },
    {
        id: "TASK-105",
        title: "Write unit tests for rate limiter",
        status: "todo",
        priority: "medium",
        assignee: "You",
    },
    {
        id: "TASK-106",
        title: "Prepare demo talking points",
        status: "todo",
        priority: "high",
        assignee: "You",
    },
];

const emails = [
    {
        id: 1,
        from: "CTO",
        subject: "Quick sync on architecture decision",
        preview:
            "Hey — wanted to get your take on whether we should go with the event-driven approach for the notifications service. Can you write up a short proposal by EOD?",
        time: "8:30 AM",
        read: false,
    },
    {
        id: 2,
        from: "Recruiter (External)",
        subject: "Exciting opportunity at TechCorp",
        preview:
            "Hi! I came across your profile and wanted to see if you'd be open to a conversation about a Staff Engineer role...",
        time: "7:15 AM",
        read: true,
    },
];

type TabType = "slack" | "tasks" | "email" | "notes";

export default function SimulationPage() {
    const [activeTab, setActiveTab] = useState<TabType>("slack");
    const [notes, setNotes] = useState(
        "## My Plan for Today\n\n- [ ] Prioritise tasks based on the demo deadline\n- [ ] Address the security vulnerability (P1)\n- [ ] Finish dashboard chart component\n- [ ] Review Figma updates\n- [ ] Prepare demo talking points\n\n### Notes:\n"
    );
    const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>(
        kanbanTasks.reduce((acc, t) => ({ ...acc, [t.id]: t.status }), {})
    );

    function moveTask(taskId: string, newStatus: string) {
        setTaskStatuses((prev) => ({ ...prev, [taskId]: newStatus }));
    }

    const tabs: { key: TabType; label: string; icon: string; badge?: number }[] =
        [
            {
                key: "slack",
                label: "Slack",
                icon: "💬",
                badge: slackMessages.filter((m) => m.urgent).length,
            },
            { key: "tasks", label: "Tasks", icon: "📋" },
            { key: "email", label: "Email", icon: "📧", badge: emails.filter((e) => !e.read).length },
            { key: "notes", label: "Notes", icon: "📝" },
        ];

    return (
        <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
            {/* ─── Left Sidebar: Workspace nav ─── */}
            <div className="w-14 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col items-center py-4 gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative h-10 w-10 rounded-lg flex items-center justify-center text-lg transition-colors ${activeTab === tab.key
                                ? "bg-indigo-600/20 ring-1 ring-indigo-500"
                                : "hover:bg-zinc-800"
                            }`}
                        title={tab.label}
                    >
                        {tab.icon}
                        {tab.badge && tab.badge > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ─── Main workspace area ─── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Scenario briefing bar */}
                <div className="border-b border-zinc-800 bg-indigo-950/30 px-5 py-3">
                    <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            AI
                        </span>
                        <p className="text-sm text-zinc-300">
                            <span className="font-semibold text-indigo-400">
                                Work Simulation:
                            </span>{" "}
                            It&apos;s 9 AM on a Tuesday. You&apos;re a mid-level software engineer. A
                            stakeholder demo was just moved up to 3 PM today. You have a P1
                            security bug, a DB incident, incomplete designs, and 6 hours to
                            figure it all out.{" "}
                            <span className="text-zinc-500">
                                How do you prioritise and navigate your day?
                            </span>
                        </p>
                    </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                    {/* ── SLACK TAB ── */}
                    {activeTab === "slack" && (
                        <div className="p-5 space-y-3">
                            <h2 className="text-lg font-bold mb-4">💬 Slack Messages</h2>
                            {slackMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`rounded-lg border p-4 ${msg.urgent
                                            ? "border-red-800/40 bg-red-950/20"
                                            : "border-zinc-800 bg-zinc-900"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                                            {msg.avatar}
                                        </span>
                                        <div>
                                            <span className="text-sm font-semibold">
                                                {msg.sender}
                                            </span>
                                            <span className="ml-2 text-xs text-zinc-500">
                                                {msg.channel} • {msg.time}
                                            </span>
                                        </div>
                                        {msg.urgent && (
                                            <span className="ml-auto rounded-full bg-red-600/20 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        {msg.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── TASKS TAB ── */}
                    {activeTab === "tasks" && (
                        <div className="p-5">
                            <h2 className="text-lg font-bold mb-4">📋 Task Board</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {(["todo", "in-progress", "done"] as const).map((col) => (
                                    <div key={col}>
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full ${col === "todo"
                                                        ? "bg-zinc-500"
                                                        : col === "in-progress"
                                                            ? "bg-amber-500"
                                                            : "bg-emerald-500"
                                                    }`}
                                            />
                                            {col.replace("-", " ")} (
                                            {
                                                kanbanTasks.filter(
                                                    (t) => taskStatuses[t.id] === col
                                                ).length
                                            }
                                            )
                                        </h3>
                                        <div className="space-y-2">
                                            {kanbanTasks
                                                .filter((t) => taskStatuses[t.id] === col)
                                                .map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-mono text-zinc-500">
                                                                {task.id}
                                                            </span>
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${task.priority === "critical"
                                                                        ? "bg-red-600/20 text-red-400"
                                                                        : task.priority === "high"
                                                                            ? "bg-amber-600/20 text-amber-400"
                                                                            : "bg-zinc-700 text-zinc-400"
                                                                    }`}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium mb-2">
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] text-zinc-500">
                                                                {task.assignee}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                {col !== "todo" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            moveTask(
                                                                                task.id,
                                                                                col === "done"
                                                                                    ? "in-progress"
                                                                                    : "todo"
                                                                            )
                                                                        }
                                                                        className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700"
                                                                    >
                                                                        ←
                                                                    </button>
                                                                )}
                                                                {col !== "done" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            moveTask(
                                                                                task.id,
                                                                                col === "todo"
                                                                                    ? "in-progress"
                                                                                    : "done"
                                                                            )
                                                                        }
                                                                        className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700"
                                                                    >
                                                                        →
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── EMAIL TAB ── */}
                    {activeTab === "email" && (
                        <div className="p-5 space-y-3">
                            <h2 className="text-lg font-bold mb-4">📧 Inbox</h2>
                            {emails.map((email) => (
                                <div
                                    key={email.id}
                                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${email.read
                                            ? "border-zinc-800 bg-zinc-900/50"
                                            : "border-indigo-600/30 bg-zinc-900 hover:bg-zinc-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        {!email.read && (
                                            <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                                        )}
                                        <span className="text-sm font-semibold">{email.from}</span>
                                        <span className="ml-auto text-xs text-zinc-500">
                                            {email.time}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium mb-1">{email.subject}</p>
                                    <p className="text-xs text-zinc-500 leading-relaxed truncate">
                                        {email.preview}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── NOTES TAB ── */}
                    {activeTab === "notes" && (
                        <div className="p-5 h-full">
                            <h2 className="text-lg font-bold mb-4">📝 Your Scratchpad</h2>
                            <p className="text-xs text-zinc-500 mb-3">
                                Use this space to plan your day, take notes, and explain your
                                prioritisation decisions. The AI interviewer will review your
                                notes.
                            </p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-[calc(100%-6rem)] rounded-lg bg-zinc-900 border border-zinc-800 p-4 font-mono text-sm text-zinc-200 leading-relaxed outline-none resize-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Right Panel: AI Observer ─── */}
            <div className="w-[300px] shrink-0 border-l border-zinc-800 bg-zinc-900 flex flex-col">
                <div className="border-b border-zinc-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            AI
                        </span>
                        <span className="text-sm font-semibold">AI Observer</span>
                        <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-zinc-400 leading-relaxed">
                    <div className="rounded-lg bg-zinc-800/50 p-3">
                        <p>
                            I'm watching how you navigate this workday. I'll be looking at:
                        </p>
                        <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                            <li>How you triage and prioritise competing tasks</li>
                            <li>How you communicate with teammates</li>
                            <li>Whether you escalate the security issue appropriately</li>
                            <li>How you balance urgency vs importance</li>
                            <li>Your decision-making under time pressure</li>
                        </ul>
                    </div>
                    <div className="rounded-lg bg-zinc-800/50 p-3">
                        <p className="text-indigo-400 font-medium text-xs mb-1">
                            💡 Prompt
                        </p>
                        <p>
                            Start by reviewing your Slack messages and task board. Then use the
                            Notes tab to write out your plan for the day. What would you tackle
                            first and why?
                        </p>
                    </div>
                    <div className="rounded-lg bg-zinc-800/50 p-3">
                        <p className="text-indigo-400 font-medium text-xs mb-1">
                            📊 Assessment Areas
                        </p>
                        <div className="space-y-2 mt-2">
                            {[
                                { label: "Prioritisation", score: "—" },
                                { label: "Communication", score: "—" },
                                { label: "Problem Solving", score: "—" },
                                { label: "Time Management", score: "—" },
                                { label: "Judgement", score: "—" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <span>{item.label}</span>
                                    <span className="text-zinc-600">{item.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="border-t border-zinc-800 p-4 space-y-2">
                    <Link
                        href="/interview_environment/behavioural"
                        className="block text-center text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        ← Back to Behavioural
                    </Link>
                    <button className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
                        Complete Interview ✓
                    </button>
                </div>
            </div>
        </div>
    );
}

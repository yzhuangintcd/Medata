"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ─── Task data with real-life scenarios ─── */
const tasks = [
    {
        id: 1,
        title: "Technical Debt vs Feature Velocity",
        difficulty: "Hard",
        type: "scenario",
        description:
            "Your codebase has accumulated significant technical debt over 2 years of rapid growth. Test coverage is 30%, the deployment process takes 2 hours and fails 40% of the time, and the authentication system uses deprecated libraries with known security vulnerabilities.\n\nMeanwhile, your product team has a roadmap of high-value features that could increase revenue by 30% if shipped this quarter. Your engineering team is spending 60% of their time fighting fires instead of building new features.\n\nYour VP asks: 'Why is engineering so slow? Can't we just hire more people?'\n\nQuestion: How do you analyze this situation and make a recommendation?",
        starterCode: `Your structured analysis:

1. Problem Framing:
   - Root causes:
   - Impact on business:
   - Impact on team:

2. Data You'd Gather:
   - Metrics needed:
   - Stakeholder interviews:
   - Technical assessment:

3. Options & Trade-offs:
   
   Option A: Stop all feature work for 1 quarter, focus on debt
     Business impact:
     Technical impact:
     Team morale:
     Risk:
   
   Option B: Dedicate 20% of sprint capacity to debt incrementally
     Business impact:
     Technical impact:
     Team morale:
     Risk:
   
   Option C: (Your alternative)
     

4. Your Recommendation:
   

5. How You'd Present This:
   - To VP of Engineering:
   - To Product team:
   - To your engineers:

6. Success Metrics:
   - How you'd measure progress:
   - Timeline:
`,
        hints: [
            "The VP's question about hiring reveals a misunderstanding. How do you address it?",
            "What's the cost of NOT addressing technical debt?",
            "How do you make technical debt tangible to non-technical stakeholders?",
            "What would be a realistic, incremental approach?",
        ],
    },
    {
        id: 2,
        title: "Production Outage: Incident Response",
        difficulty: "Hard",
        type: "scenario",
        description:
            "It's 2 AM on Saturday. Your monitoring alerts you that the API is returning 503 errors for 60% of requests. The database connection pool is exhausted. You're the on-call engineer.\n\nContext:\n- Big product launch happened 6 hours ago\n- Traffic is 5x normal levels\n- CEO is awake and messaging in Slack\n- Your team lead is unreachable (camping, no signal)\n- Database admin is in Europe (won't be online for 5 hours)\n- Last deploy was 3 days ago, no recent changes\n- Rolling back would lose customer data from the past 6 hours\n\nQuestion: Walk through your incident response process step-by-step.",
        starterCode: `Your incident response plan:

1. Immediate Triage (First 10 minutes):
   - What data do you check first:
   - Quick wins to reduce customer impact:
   - What you DON'T do right now:

2. Investigation (Next 20 minutes):
   - Hypothesis 1:
     How to test:
     
   - Hypothesis 2:
     How to test:
     
   - Hypothesis 3:
     How to test:

3. Communication:
   - Message to CEO (right now):
   
   
   - Message to engineering team Slack:
   
   
   - Customer-facing status page update:
   
   
   - Update frequency plan:

4. Fix Strategy:
   
   Option A: Increase DB connection pool immediately
     Pros:
     Cons:
     Rollback plan:
   
   Option B: Add rate limiting to shed load
     Pros:
     Cons:
     Rollback plan:
   
   Option C: Scale up database resources
     Pros:
     Cons:
     Rollback plan:

5. Your Decision & Reasoning:
   

6. Post-Incident Actions:
   - Immediate follow-up:
   - Postmortem agenda:
   - Prevention measures:
`,
        hints: [
            "How do you balance quick mitigation vs. finding root cause?",
            "What's your communication strategy under pressure?",
            "How do you decide between risky fixes and safe options?",
            "What if your first fix makes things worse?",
        ],
    },
    {
        id: 3,
        title: "Architecture Decision: Microservices Migration",
        difficulty: "Hard",
        type: "scenario",
        description:
            "Your company's monolithic Rails app is 8 years old, 500K lines of code, and handles 50M requests/day. The engineering team has grown from 5 to 50 people, and developers are stepping on each other's toes. Deploy times are 45 minutes and the test suite takes 2 hours.\n\nYour new CTO (hired from Netflix) wants to migrate to microservices. The proposal:\n- Break into 15-20 services\n- Use Kubernetes for orchestration\n- Estimated migration: 12-18 months\n- Requires hiring 10 more engineers\n- Pause most feature development during migration\n\nThe CEO is concerned about the cost and timeline. The product team is frustrated about pausing features. Some senior engineers are excited, others think it's premature.\n\nQuestion: How do you evaluate this decision and make a recommendation?",
        starterCode: `Your evaluation framework:

1. Current System Assessment:
   - Real problems we're facing:
   - Problems that are NOT caused by the monolith:
   - Pain points that will get worse:
   - What's actually working well:

2. Alternatives to Full Migration:
   
   Option A: Full microservices migration (CTO's proposal)
     Timeline:
     Cost:
     Risks:
     Benefits:
     Team impact:
   
   Option B: Modular monolith with better boundaries
     Timeline:
     Cost:
     Risks:
     Benefits:
     Team impact:
   
   Option C: Extract 2-3 critical services, keep the rest
     Timeline:
     Cost:
     Risks:
     Benefits:
     Team impact:
   
   Option D: (Your alternative)
     

3. Key Questions to Answer:
   - For CTO:
   - For CEO:
   - For engineering team:
   - For product team:

4. Your Recommendation:
   

5. If You Recommend Migration:
   - Phase 1:
   - Phase 2:
   - Phase 3:
   - Success metrics:
   - Rollback strategy:

6. Communication Plan:
   - To CTO (how to frame your analysis):
   - To CEO (business case):
   - To engineering team:
   - To product team:
`,
        hints: [
            "Is microservices the solution, or is it solving organizational problems?",
            "What's the minimum viable migration that proves value?",
            "How do you navigate disagreement with your CTO?",
            "What evidence would change your mind?",
        ],
    },
    {
        id: 4,
        title: "Team Conflict: Code Review Standards",
        difficulty: "Hard",
        type: "scenario",
        description:
            "Your team is split into two camps over code review practices:\n\nCamp A (3 senior engineers): Want rigorous reviews, block PRs for style issues, insist on 100% test coverage, and believe 'slow and right' is better than 'fast and broken.' Their reviews take 2-3 days.\n\nCamp B (5 mid-level engineers): Frustrated by nitpicking, feel seniors are gatekeeping, want to ship faster, and argue that perfect is the enemy of good. They're threatening to leave.\n\nMeanwhile:\n- Your PM is upset about missed deadlines\n- Two PRs have been open for a week with 50+ comments\n- One engineer stopped submitting PRs entirely out of anxiety\n- The team's velocity has dropped 40%\n- You just hired 3 junior engineers who need guidance\n\nQuestion: How do you resolve this conflict and establish team norms?",
        starterCode: `Your resolution strategy:

1. Root Cause Analysis:
   - What Camp A really wants:
   - What Camp B really wants:
   - Underlying fears/motivations:
   - Legitimate concerns from each side:

2. Data Gathering:
   - Metrics to review:
   - Questions for each camp:
   - Questions for PM:
   - Code quality assessment:

3. Proposed Solution:
   
   Team Norms:
   - What requires rigorous review:
   - What can be fast-tracked:
   - Review time SLA:
   - How to handle disagreements:
   
   Technical Standards:
   - Test coverage requirement:
   - Style/lint rules:
   - When to allow exceptions:
   - Documentation requirements:
   
   Process Changes:
   - Review assignment:
   - Escalation path:
   - How to mentor juniors:

4. Implementation Plan:
   - Week 1:
   - Week 2-4:
   - How you'll measure success:

5. Communication:
   - Team meeting agenda:
   - How you'll frame this to Camp A:
   - How you'll frame this to Camp B:
   - Message to PM:

6. Handling Resistance:
   - If seniors refuse to compromise:
   - If mid-levels keep rushing:
   - If someone threatens to quit:
   - Your escalation path:
`,
        hints: [
            "Is this really about code review, or about trust and respect?",
            "How do you balance code quality with team morale?",
            "What's your role as a leader vs. as a technical contributor?",
            "Can you find common ground both sides can agree on?",
        ],
    },
];

export default function Technical2Page() {
    // Select one random question for this candidate
    const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null);
    const [code, setCode] = useState("");
    const [showHints, setShowHints] = useState(false);
    const [output, setOutput] = useState("");
    const [startTime, setStartTime] = useState<number>(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [candidateEmail, setCandidateEmail] = useState('candidate@example.com');

    // Initialize with random question on mount
    useEffect(() => {
        // Get previous question ID to avoid showing the same one
        const previousTaskId = localStorage.getItem('technical2_previousTaskId');
        
        // Filter out the previous question if it exists
        const availableTasks = previousTaskId 
            ? tasks.filter(t => t.id !== parseInt(previousTaskId))
            : tasks;
        
        // Select random question from available tasks
        const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        
        // Save this question as the previous one for next time
        localStorage.setItem('technical2_previousTaskId', task.id.toString());
        
        setSelectedTask(task);
        
        // Start fresh - load starter code for this question
        setCode(task.starterCode);
        setIsSubmitted(false);
        
        // Set start time
        const now = Date.now();
        setStartTime(now);
        
        const email = localStorage.getItem('candidateEmail');
        if (email) {
            setCandidateEmail(email);
        }
    }, []);

    if (!selectedTask) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const task = selectedTask;

    function handleCodeChange(newCode: string) {
        setCode(newCode);
    }

    function handleRun() {
        if (isSubmitted) return;
        setOutput("▶ Analyzing your response...\n\n[AI Agent]: I'm reviewing your structured approach. How would you present this analysis to someone who disagrees with your recommendation?");
    }

    async function handleSubmit() {
        if (isSubmitted) return;
        
        setOutput("📤 Submitting response...\n\n[AI Agent]: Processing your analysis...");
        
        // Calculate time spent
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

        // Save to database
        try {
            await fetch('/api/save-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: `candidate-${Date.now()}`,
                    candidateEmail: candidateEmail,
                    interviewType: 'technical2',
                    taskId: task.id,
                    taskTitle: task.title,
                    response: code,
                    timeSpentSeconds,
                    metadata: {
                        difficulty: task.difficulty,
                        type: task.type,
                        hintsViewed: showHints,
                        completed: true,
                        question: {
                            description: task.description,
                            starterCode: task.starterCode,
                            hints: task.hints,
                        },
                    },
                }),
            });
            console.log('✅ Technical solution saved to database');
            
            // Mark as completed
            setIsSubmitted(true);
            localStorage.setItem('technical2_submitted', 'true');
            setOutput("📤 Response submitted!\n\n[AI Agent]: Thank you for walking me through your thinking. I'm evaluating your structure, trade-off analysis, and communication strategy.");
        } catch (error) {
            console.error('❌ Failed to save to database:', error);
            // Still mark as completed even if DB save fails
            setIsSubmitted(true);
            localStorage.setItem('technical2_submitted', 'true');
            setOutput("📤 Response submitted! (Note: Failed to save to database, but you can continue)\n\n[AI Agent]: Thank you for walking me through your thinking.");
        }
    }

    return (
        <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
            {/* ─── Left Panel: Task description ─── */}
            <div className="w-[420px] shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-y-auto">
                {/* Task body */}
                <div className="p-5 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${task.difficulty === "Hard"
                                ? "bg-red-900/50 text-red-400"
                                : "bg-amber-900/50 text-amber-400"
                                }`}
                        >
                            {task.difficulty}
                        </span>
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-900/50 text-blue-400">
                            Scenario
                        </span>
                        {isSubmitted && (
                            <span className="ml-auto text-emerald-400 text-xs font-medium">✓ Completed</span>
                        )}
                    </div>

                    <h2 className="text-xl font-bold mb-3">{task.title}</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                        {task.description}
                    </p>

                    {/* Hints */}
                    <button
                        onClick={() => setShowHints(!showHints)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-3"
                    >
                        {showHints ? "▾ Hide hints" : "▸ Show hints"}
                    </button>
                    {showHints && (
                        <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside mb-4">
                            {task.hints.map((h, i) => (
                                <li key={i}>{h}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* ─── Right Panel: Code editor + output ─── */}
            <div className="flex-1 flex flex-col">
                {/* Editor toolbar */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="ml-2 font-mono">response.md</span>
                        <span className="ml-3 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                            Scenario Analysis
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRun}
                            disabled={isSubmitted}
                            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ▶ Analyze
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitted ? '✓ Submitted' : 'Submit Response'}
                        </button>
                    </div>
                </div>

                {/* Response textarea */}
                <div className="flex-1 overflow-hidden relative">
                    <textarea
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        spellCheck={false}
                        placeholder="Structure your response here... Walk through your thought process step by step."
                        disabled={isSubmitted}
                        className="h-full w-full resize-none bg-zinc-950 p-5 font-mono text-sm text-zinc-300 leading-relaxed outline-none selection:bg-indigo-600/40 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    {isSubmitted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 pointer-events-none">
                            <span className="text-emerald-400 text-lg font-bold">✓ Task completed</span>
                        </div>
                    )}
                </div>

                {/* Output panel */}
                <div className="border-t border-zinc-800 bg-zinc-900">
                    <div className="flex items-center px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">
                        <span>Output</span>
                    </div>
                    <pre className="p-4 text-xs text-zinc-400 font-mono h-36 overflow-y-auto whitespace-pre-wrap">
                        {output || "Run your code to see output here..."}
                    </pre>
                </div>
            </div>

            {/* ─── Navigation footer inside panel ─── */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-6 py-3">
                <Link
                    href="/interview_environment/technical"
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    ← Back to Technical 1
                </Link>
                <Link
                    href="/interview_environment/behavioural"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Continue to Behavioural →
                </Link>
            </div>
        </div>
    );
}

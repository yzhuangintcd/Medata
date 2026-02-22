"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ─── Task data ─── */
const tasks = [
    {
        id: 1,
        title: "Bug Fix: Payment Processing",
        difficulty: "Medium",
        type: "coding",
        description:
            "The checkout service is silently dropping orders when the payment gateway returns a timeout. Customers are charged but never receive a confirmation email. Investigate the code below and fix the bug.",
        starterCode: `async function processPayment(order: Order) {
  const gateway = new PaymentGateway();

  // BUG: timeout errors are swallowed here
  try {
    const result = await gateway.charge(order.total, order.paymentMethod);
    await db.orders.update(order.id, { status: "paid", txnId: result.id });
    await emailService.sendConfirmation(order.customerEmail, order);
  } catch (err) {
    console.log("Payment failed");
  }
}`,
        hints: [
            "What happens to the order status when a TimeoutError is caught?",
            "Should you differentiate between a timeout and a declined card?",
            "Think about idempotency — can the customer safely retry?",
            "How would you communicate the urgency of this bug to your PM?",
        ],
    },
    {
        id: 2,
        title: "Race Condition: User Session",
        difficulty: "Hard",
        type: "coding",
        description:
            "Users are reporting that they're seeing each other's data briefly after login. You suspect a race condition in the session management code. The app uses Redis for sessions and multiple API servers behind a load balancer.",
        starterCode: `async function createUserSession(userId: string, res: Response) {
  const sessionId = generateSessionId();
  
  // Store session data
  await redis.set(\`session:\${sessionId}\`, JSON.stringify({ userId }));
  
  // Get user data
  const userData = await db.users.findById(userId);
  
  // Set cookie
  res.cookie('sessionId', sessionId, { httpOnly: true });
  
  // Cache user data for performance
  await redis.set(\`user:\${userId}\`, JSON.stringify(userData), 'EX', 300);
  
  return userData;
}

async function getUserData(sessionId: string) {
  const session = await redis.get(\`session:\${sessionId}\`);
  if (!session) return null;
  
  const { userId } = JSON.parse(session);
  
  // BUG: Race condition here
  let userData = await redis.get(\`user:\${userId}\`);
  if (!userData) {
    userData = await db.users.findById(userId);
    await redis.set(\`user:\${userId}\`, JSON.stringify(userData), 'EX', 300);
  }
  
  return JSON.parse(userData);
}`,
        hints: [
            "What happens if two users with the same userId log in simultaneously?",
            "How does the Redis cache key structure contribute to the problem?",
            "Consider: should sessionId be the cache key instead?",
            "What if user A logs out while user B is logging in?",
        ],
    },
    {
        id: 3,
        title: "Memory Leak: Event Listeners",
        difficulty: "Medium",
        type: "coding",
        description:
            "The app's memory usage grows over time and eventually crashes after users navigate between pages. You've identified that the WebSocket connection manager might be leaking memory. Fix the leak.",
        starterCode: `class RealtimeNotifications {
  private ws: WebSocket | null = null;
  private listeners: Array<(data: any) => void> = [];

  connect(userId: string) {
    this.ws = new WebSocket(\`wss://api.example.com/notifications?user=\${userId}\`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // BUG: Memory leak - listeners never removed
      this.listeners.forEach(listener => listener(data));
    };
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.push(callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Usage in React component:
function NotificationBell() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const notifications = new RealtimeNotifications();
    notifications.connect(currentUser.id);
    
    notifications.subscribe((data) => {
      if (data.type === 'notification') {
        setCount(prev => prev + 1);
      }
    });
    
    return () => {
      notifications.disconnect();
    };
  }, [currentUser.id]);
  
  return <div className="bell">{count}</div>;
}`,
        hints: [
            "What happens to the listeners array when the component unmounts?",
            "Is disconnect() sufficient to prevent the memory leak?",
            "Should subscribe() return a cleanup function?",
            "What if the user navigates away and back 50 times?",
        ],
    },
    {
        id: 4,
        title: "SQL Injection Vulnerability",
        difficulty: "Hard",
        type: "coding",
        description:
            "A security audit found that the search feature is vulnerable to SQL injection. Users can access other users' private data by manipulating the search query. Identify and fix all vulnerabilities.",
        starterCode: `async function searchUsers(searchTerm: string, currentUserId: string) {
  // BUG: SQL injection vulnerability
  const query = \`
    SELECT id, name, email, bio 
    FROM users 
    WHERE (name LIKE '%\${searchTerm}%' OR bio LIKE '%\${searchTerm}%')
      AND id != \${currentUserId}
      AND account_status = 'active'
    ORDER BY name ASC
  \`;
  
  const results = await db.query(query);
  return results;
}

// Advanced search with filters
async function advancedSearch(filters: SearchFilters, currentUserId: string) {
  let conditions = [];
  
  if (filters.name) {
    conditions.push(\`name LIKE '%\${filters.name}%'\`);
  }
  
  if (filters.location) {
    conditions.push(\`location = '\${filters.location}'\`);
  }
  
  if (filters.skills) {
    const skillsList = filters.skills.split(',').map(s => \`'\${s.trim()}'\`).join(',');
    conditions.push(\`skills IN (\${skillsList})\`);
  }
  
  const whereClause = conditions.length > 0 
    ? 'WHERE ' + conditions.join(' AND ')
    : '';
  
  const query = \`
    SELECT * FROM users 
    \${whereClause}
    ORDER BY \${filters.sortBy || 'name'} \${filters.sortOrder || 'ASC'}
  \`;
  
  return await db.query(query);
}`,
        hints: [
            "What could an attacker type in searchTerm to see all users?",
            "How can they inject a UNION query to access other tables?",
            "The ORDER BY clause is also vulnerable - how?",
            "What's the proper way to handle dynamic SQL in modern apps?",
        ],
    },
];

export default function TechnicalPage() {
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
        const previousTaskId = localStorage.getItem('technical1_previousTaskId');
        
        // Filter out the previous question if it exists
        const availableTasks = previousTaskId 
            ? tasks.filter(t => t.id !== parseInt(previousTaskId))
            : tasks;
        
        // Select random question from available tasks
        const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        
        // Save this question as the previous one for next time
        localStorage.setItem('technical1_previousTaskId', task.id.toString());
        
        setSelectedTask(task);
        
        // Start fresh - load starter code for this question
        setCode(task.starterCode);
        setIsSubmitted(false);
        
        // Set start time
        const now = Date.now();
        setStartTime(now);
        
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
        setOutput("▶ Running code...\n\n✅ No syntax errors detected.\n⏱ Execution time: 42ms\n\n[AI Agent]: I see your changes. Let me analyze your approach... Also, tell me how you'd prioritize finishing this vs responding to a production incident.");
    }

    async function handleSubmit() {
        if (isSubmitted) return;
        
        setOutput("📤 Submitting solution...\n\n[AI Agent]: Processing your submission...");
        
        // Calculate time spent
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

        // Save to database for ALL task types
        try {
            await fetch('/api/save-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: `candidate-${Date.now()}`,
                    candidateEmail: candidateEmail,
                    interviewType: 'technical1',
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
            setOutput("📤 Solution submitted!\n\n[AI Agent]: Thank you. I'm reviewing your solution now. I'll assess correctness, code quality, edge-case handling, and your reasoning.");
        } catch (error) {
            console.error('❌ Failed to save to database:', error);
            // Still mark as completed even if DB save fails
            setIsSubmitted(true);
            setOutput("📤 Solution submitted! (Note: Failed to save to database, but you can continue)\n\n[AI Agent]: Thank you. I'm reviewing your solution now.");
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
                        <span className="ml-2 font-mono">{task.type === 'coding' ? 'solution.ts' : 'response.md'}</span>
                        <span className="ml-3 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                            {task.type === 'coding' ? 'Code' : 'Scenario Analysis'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitted ? '✓ Submitted' : 'Submit Solution'}
                        </button>
                    </div>
                </div>

                {/* Code/Response textarea */}
                <div className="flex-1 overflow-hidden relative">
                    <textarea
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        spellCheck={false}
                        placeholder={task.type === 'coding' ? 'Write your code here...' : 'Structure your response here... Walk through your thought process step by step.'}
                        disabled={isSubmitted}
                        className={`h-full w-full resize-none bg-zinc-950 p-5 font-mono text-sm leading-relaxed outline-none selection:bg-indigo-600/40 disabled:opacity-70 disabled:cursor-not-allowed ${task.type === 'coding' ? 'text-emerald-300' : 'text-zinc-300'}`}
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
                    href="/interview_environment"
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    ← Back to Dashboard
                </Link>
                <Link
                    href="/interview_environment/technical2"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Continue to Technical 2 →
                </Link>
            </div>
        </div>
    );
}

"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import type { InterviewerDef } from "./ConferenceScene";
import type OrigConferenceScene from "./ConferenceScene";

const ConferenceScene = dynamic(() => import("./ConferenceScene"), {
  ssr: false,
}) as typeof OrigConferenceScene;

/* ─── Interview stages ─── */
const interviewers: (InterviewerDef & {
  title: string;
  description: string;
  href: string;
  duration: string;
  step: number;
  focus: string[];
})[] = [
    {
      id: "technical1",
      name: "Alex Chen",
      role: "Senior Engineer",
      title: "Technical Interviewer 1",
      description:
        "Technical assessment with one coding question and real-life problem scenarios. We evaluate your thought process, logical reasoning, and how you approach complex engineering decisions.",
      href: "/interview_environment/technical",
      duration: "30 min",
      step: 1,
      accent: "#2a6b8a",
      focus: ["Problem Solving", "Reasoning", "Decision Making", "Structure"],
      skinTone: "#deb887",
      hairColor: "#1a1a2e",
      hairStyle: "short",
      shirtColor: "#2a5a8a",
      seatX: -1.6,
    },
    {
      id: "technical2",
      name: "Jordan Park",
      role: "Engineering Manager",
      title: "Technical Interviewer 2",
      description:
        "Real-world scenario assessment focused on architectural decisions, technical trade-offs, stakeholder management, and how you navigate complex engineering challenges with ambiguity.",
      href: "/interview_environment/technical2",
      duration: "30 min",
      step: 2,
      accent: "#8a6b2a",
      focus: ["Architecture", "Trade-offs", "Communication", "Strategy"],
      skinTone: "#f1c27d",
      hairColor: "#4a3728",
      hairStyle: "medium",
      shirtColor: "#8a6b2a",
      seatX: 0,
    },
    {
      id: "behavioural",
      name: "Maya Johnson",
      role: "People & Culture Lead",
      title: "Behavioural Interviewer",
      description:
        "Behavioural assessment with workplace scenarios. We evaluate your communication, empathy, leadership, and how you navigate interpersonal challenges in a team environment.",
      href: "/interview_environment/behavioural",
      duration: "25 min",
      step: 3,
      accent: "#6b4a8a",
      focus: ["Communication", "Empathy", "Leadership", "Teamwork"],
      skinTone: "#8d5524",
      hairColor: "#2a1a0a",
      hairStyle: "long",
      shirtColor: "#6b4a8a",
      seatX: 1.6,
    },
  ];

export default function InterviewDashboard() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const hovered = interviewers.find((i) => i.id === hoveredId) ?? null;

  useEffect(() => {
    setMounted(true);
    
    // Capture email from URL and store in localStorage
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    if (email) {
      localStorage.setItem('candidateEmail', email);
      console.log('📧 Candidate email captured:', email);
    }
  }, []);

  function handleSelect(id: string) {
    const person = interviewers.find((i) => i.id === id);
    if (person) router.push(person.href);
  }

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-7rem)] bg-zinc-950 overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-sm text-zinc-400 font-medium">
                  Preparing your interview room...
                </span>
              </div>
            </div>
          }
        >
          <ConferenceScene
            interviewers={interviewers}
            onSelect={handleSelect}
          />
        </Suspense>
      </div>

      {/* Top Overlay */}
      <div
        className={`relative z-10 flex flex-col items-center pointer-events-none transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
      >
        <section className="text-center pt-8 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#2a3a2a] drop-shadow-sm">
            Welcome to Your Interview 
          </h1>
          <p className="text-sm text-[#5a8a5e] mt-2 font-medium">
            Grab a coffee — this will take about 1.5 hours
          </p>
          <p className="text-sm text-[#5a8a5e] mt-2 font-medium">
            Don't worry We will notify you of time!
          </p>
        </section>

        {/* Step indicators */}
        <section className="flex items-center gap-3 mt-3 pointer-events-auto">
          {interviewers.map((p) => (
            <button
              key={p.id}
              onClick={() => setHoveredId(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${hoveredId === p.id
                ? "bg-white shadow-lg border-[#c0b898] text-[#2a3a2a] scale-105"
                : "bg-white/70 border-[#d8d0c0] text-[#6b6a5a] hover:bg-white/90 hover:shadow-md"
                }`}
            >
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#f0ebe3] text-[11px] font-bold text-[#6b5a3a] border border-[#d8d0c0]">
                {p.step}
              </span>
              <span>{p.title}</span>
            </button>
          ))}
        </section>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Panel */}
      <div
        className={`relative z-10 flex flex-col items-center pb-4 px-4 pointer-events-none transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        {/* Hover detail card */}
        <section
          onMouseEnter={() => hovered && setHoveredId(hovered.id)}
          className={`w-full max-w-xl transition-all duration-500 pointer-events-auto ${hovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
            }`}
        >
          {hovered && (
            <div className="rounded-2xl border border-[#d8d0c0] bg-white/90 backdrop-blur-lg p-5 shadow-lg relative">
              {/* Close button */}
              <button
                onClick={() => setHoveredId(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-800 transition-colors flex items-center justify-center text-sm font-bold"
                aria-label="Close"
              >
                ✕
              </button>
              
              <div className="flex items-start gap-4">
                {/* Avatar icon */}
                <div className="relative shrink-0">
                  <div
                    className="w-14 h-14 rounded-xl border-2 border-[#c0b898] shadow-sm flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${hovered.shirtColor}44, ${hovered.accent}33)`,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="w-7 h-7 rounded-full border-2 border-white/60"
                        style={{ backgroundColor: hovered.skinTone }}
                      />
                      <div
                        className="w-8 h-4 rounded-t-lg -mt-0.5"
                        style={{ backgroundColor: hovered.shirtColor }}
                      />
                    </div>
                  </div>
                  <div className="absolute -top-1 -left-1 flex items-center justify-center h-5 w-5 rounded-full bg-[#5a8a5e] text-[9px] font-bold text-white">
                    {hovered.step}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-[#2a3a2a]">
                      Step {hovered.step}: {hovered.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#5a8a5e] font-medium mb-1.5">
                    with {hovered.name}, {hovered.role}
                  </p>
                  <p className="text-xs text-[#6b6a5a] leading-relaxed mb-3">
                    {hovered.description}
                  </p>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {hovered.focus.map((f: string) => (
                      <span
                        key={f}
                        className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-[#f0ebe3] text-[#6b5a3a] border border-[#d8d0c0]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[#8a8a7a]">
                    <span>⏱ {hovered.duration}</span>
                    <span>📋 Conversational format</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(hovered.id)}
                  className="shrink-0 self-center px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#2a6b4a] hover:bg-[#1f5a3a] transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Begin Stage {hovered.step} →
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

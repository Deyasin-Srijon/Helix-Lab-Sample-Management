/**
 * FILE: src/pages/AIChatPage.jsx
 *
 * PURPOSE:
 * Administrative AI Chat Assistant interface for Helix Laboratory Sample Management.
 * Features an intelligent query system, fluid 3D particle morphing thinking orb,
 * adaptive answer card unfolding, quick suggestion prompts, and persistent top navigation.
 */

import {
  FlaskConical as FlaskIcon,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import MorphOrb from '../components/ui/ai-thiking-orb-and-input';
import { generateDummyReply } from '../services/aiReplyService';

const SUGGESTED_PROMPTS = [
  "How many samples are pending?",
  "What is the cold storage protocol?",
  "How do I register a new sample?",
  "What is the procedure for STAT priority samples?",
];

export default function AIChatPage() {
  const [orbTriggerQuery, setOrbTriggerQuery] = useState('');

  // Quick prompt chip click
  const handleSelectPrompt = (promptText) => {
    setOrbTriggerQuery(promptText);
  };

  // Handle MorphOrb submit
  const handleOrbSubmit = async (query) => {
    return await generateDummyReply(query);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top navigation header */}
      <Navbar />

      {/* Main container */}
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 space-y-4">
        {/* Header Card: Title, Status Badge, and Quick Prompts */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title & Lab Assistant Branding */}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  AI Lab Assistant
                </h1>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Interactive thinking orb &amp; intelligent laboratory query interface.
                </p>
              </div>
            </div>

            {/* Active Status Badge */}
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Thinking Orb Active
            </div>
          </div>

          {/* Suggested Quick Prompts Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
            <span className="mr-1 text-xs font-semibold text-slate-400 shrink-0">Quick Prompts:</span>
            {SUGGESTED_PROMPTS.map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => handleSelectPrompt(promptText)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700 active:scale-95"
              >
                <FlaskIcon className="h-3.5 w-3.5 text-emerald-600" />
                {promptText}
              </button>
            ))}
          </div>
        </section>

        {/* Centerpiece Card: Subtle dot grid + central emerald glow + MorphOrb */}
        <section className="w-full relative flex min-h-[580px] sm:min-h-[620px] flex-col items-stretch justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <MorphOrb
            className="w-full h-full flex-1 self-stretch"
            onSubmit={handleOrbSubmit}
            triggerQuery={orbTriggerQuery}
            onAnswer={() => setOrbTriggerQuery('')}
          />
        </section>
      </main>
    </div>
  );
}

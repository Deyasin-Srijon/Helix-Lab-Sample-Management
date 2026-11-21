import { useState } from 'react';
import { FlaskIcon, SparklesIcon } from '../components/icons';
import MorphOrb from '../components/ui/ai-thiking-orb-and-input';
import { useSamples } from '../context/SampleContext';
import { generateDummyReply } from '../services/aiReplyService';

const SUGGESTED_PROMPTS = [
  "Show me all my samples.",
  "Show me samples with status completed.",
  "How many samples are In progress?",
  "How can I register a new sample?",
];

export default function AIChatPage() {
  const [orbTriggerQuery, setOrbTriggerQuery] = useState('');
  const { refresh } = useSamples();

  // Quick prompt chip click
  const handleSelectPrompt = (promptText) => {
    setOrbTriggerQuery(promptText);
  };

  // Handle MorphOrb submit
  const handleOrbSubmit = async (query) => {
    const reply = await generateDummyReply(query);

    // The chatbot may have created/updated/deleted samples on the backend,
    // so re-sync the shared sample state (no full page reload needed).
    refresh().catch(() => {});

    return reply;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-xs">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-slate-900">
                AI Lab Assistant
              </h1>
              <p className="text-sm text-slate-500">
                Interactive thinking orb &amp; intelligent laboratory query interface.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-primary sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Thinking Orb Active
          </div>
        </div>

        {/* Suggested Prompts Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="mr-1 text-xs font-medium text-slate-400">Quick Prompts:</span>
          {SUGGESTED_PROMPTS.map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => handleSelectPrompt(promptText)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-primary/40 hover:bg-muted hover:text-primary active:scale-95"
            >
              <FlaskIcon className="h-3 w-3 text-primary" />
              {promptText}
            </button>
          ))}
        </div>
      </section>

      {/* Thinking Orb Centerpiece (Light Mode) */}
      <section className="relative flex w-full min-h-[600px] items-stretch justify-stretch overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-slate-50/70 via-white to-slate-50/70 shadow-sm text-slate-900">

        {/* Background ambient lighting and subtle tech grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        <div className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 h-[220px] w-[220px] rounded-full bg-teal-400/15 blur-xl" />

        {/* Full-width MorphOrb */}
        <div className="relative z-10 w-full min-h-[600px] flex-1">
          <MorphOrb
            onSubmit={handleOrbSubmit}
            triggerQuery={orbTriggerQuery}
            onAnswer={() => setOrbTriggerQuery('')}
          />
        </div>

      </section>
    </div>
  );
}
/**
 * FILE: src/components/MorphOrb.jsx
 *
 * PURPOSE:
 * Implements the interactive 3D particle morphing thinking orb and adaptable answer display
 * for the Helix Lab AI Admin Assistant.
 *
 * KEY FEATURES:
 * - Fluid 3D particle canvas with organic Fibonacci spherical distribution, morphing undulation,
 *   perspective projection, depth-based alpha, and constellation filaments.
 * - Dynamic color transitions:
 *   - Thinking / Searching / Analyzing Phase: Luminous bright emerald-mint (rgb(20, 184, 140) / #14b88c).
 *   - Done / Resolved Phase: Polished medium-deep emerald green (rgb(8, 126, 94) / #087e5e).
 *   - Condensing sphere (.mo-green): radial-gradient(circle at 35% 35%, #10b981, #047857 80%).
 *   - Pulse ring & Done status text: #047857.
 * - High-precision adaptive card geometry:
 *   - Responsive card width clamped to Math.min(600, containerWidth - 32).
 *   - Height measured via offscreen probe and clamped between 114px (minimum) and 280px (maximum).
 *   - Scrollable card body (.mo-a-body) with flexbox and custom thin scrollbar for long answers.
 *   - Dynamic reset button ("New question") positioned at top: calc(46% + (var(--h, 114px) / 2) + 24px).
 * - Full input interactivity with click-to-focus container and pointer-events protection.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import {
  ArrowUp,
  Bot,
  Check,
  Copy,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getAIReply } from '../services/aiReplyService';

const THINKING_MESSAGES = [
  'Searching laboratory database...',
  'Analyzing telemetry & audit records...',
  'Synthesizing administrative report...',
  'Compiling system metrics...'
];

const MorphOrb = forwardRef(function MorphOrb({ onQueryStart }, ref) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const probeRef = useRef(null);

  // Phases: 'idle' | 'shrinking' | 'thinking' | 'done' | 'unfolding' | 'answered'
  const [phase, setPhase] = useState('idle');
  const [inputQuery, setInputQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [statusText, setStatusText] = useState('Thinking...');
  const [answerData, setAnswerData] = useState(null);
  const [measuredHeight, setMeasuredHeight] = useState(114);
  const [containerWidth, setContainerWidth] = useState(800);
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const cardWidth = Math.min(600, Math.max(300, containerWidth - 32));

  // Focus input automatically on idle
  useEffect(() => {
    if (phase === 'idle') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Cycle thinking status messages during the thinking phase
  useEffect(() => {
    if (phase !== 'thinking') return;
    let idx = 0;
    setStatusText(THINKING_MESSAGES[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % THINKING_MESSAGES.length;
      setStatusText(THINKING_MESSAGES[idx]);
    }, 750);
    return () => clearInterval(interval);
  }, [phase]);

  // Master Submission Flow
  const triggerSubmission = useCallback(
    async (queryText) => {
      const q = (queryText || '').trim();
      if (!q || phase === 'shrinking' || phase === 'thinking') return;

      if (phase === 'answered') {
        setIsResetting(true);
        await new Promise((r) => setTimeout(r, 200));
        setIsResetting(false);
        setAnswerData(null);
      }

      setActiveQuery(q);
      setInputQuery('');
      setPhase('shrinking');
      onQueryStart?.(q);

      // 1. Shrink input pill into orb (350ms)
      await new Promise((r) => setTimeout(r, 350));
      setPhase('thinking');

      // 2. Concurrently fetch reply from service
      try {
        const reply = await getAIReply(q);
        setAnswerData(reply);

        // 3. Measure answer height offscreen
        // Allow a tick for probe DOM to render the new answer text
        setTimeout(() => {
          let probeH = 160;
          if (probeRef.current) {
            probeH = probeRef.current.offsetHeight || 160;
          }
          // Clamp between 114px (concise) and 280px (maximum)
          const targetH = Math.max(114, Math.min(280, probeH));
          setMeasuredHeight(targetH);

          // 4. Transition to 'done' (deep emerald green, particle condensation)
          setPhase('done');
          setStatusText('Done');

          // 5. Unfold after brief pause (400ms)
          setTimeout(() => {
            setPhase('unfolding');

            // 6. Fully answered after unfold animation (420ms)
            setTimeout(() => {
              setPhase('answered');
            }, 420);
          }, 450);
        }, 50);
      } catch {
        const fallbackReply = {
          text: 'Unable to reach laboratory telemetry service. Please try again or verify database connectivity.',
          category: 'Diagnostics Error',
          query: q,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setAnswerData(fallbackReply);
        setMeasuredHeight(140);
        setPhase('done');
        setStatusText('Done');
        setTimeout(() => {
          setPhase('unfolding');
          setTimeout(() => {
            setPhase('answered');
          }, 420);
        }, 400);
      }
    },
    [phase, onQueryStart]
  );

  // Expose imperative API for suggestion chips
  useImperativeHandle(
    ref,
    () => ({
      submitPrompt: (text) => {
        triggerSubmission(text);
      },
      reset: () => {
        handleReset();
      }
    }),
    [triggerSubmission]
  );

  const handleSubmit = (e) => {
    e?.preventDefault();
    triggerSubmission(inputQuery);
  };

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      setPhase('idle');
      setAnswerData(null);
      setIsResetting(false);
      setCopied(false);
    }, 240);
  };

  const handleCopy = () => {
    if (!answerData?.text) return;
    navigator.clipboard?.writeText(answerData.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3D Canvas Particle Animation Loop
  useEffect(() => {
    if (phase !== 'thinking' && phase !== 'done') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 340;
    const height = 340;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const cx = width / 2;
    const cy = height / 2;
    const numParticles = 210;
    const baseRadius = 78;

    // Distribute particles using Fibonacci spherical lattice
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numParticles);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      particles.push({
        phi,
        theta,
        baseR: baseRadius,
        size: 1.2 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.6
      });
    }

    let angleY = 0;
    let angleX = 0;
    let time = 0;
    let animId;

    // Color matrix:
    // Thinking: Luminous bright emerald-mint rgb(20, 184, 140) / #14b88c
    // Done: Polished medium-deep emerald green rgb(8, 126, 94) / #087e5e
    const currentColor = [20, 184, 140];
    let contraction = 1.0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDone = phase === 'done';
      const targetColor = isDone ? [8, 126, 94] : [20, 184, 140];

      // Smooth color lerp
      currentColor[0] += (targetColor[0] - currentColor[0]) * 0.12;
      currentColor[1] += (targetColor[1] - currentColor[1]) * 0.12;
      currentColor[2] += (targetColor[2] - currentColor[2]) * 0.12;

      // Smooth contraction when done
      if (isDone) {
        contraction = Math.max(0.04, contraction * 0.91);
      } else {
        contraction = 1.0;
      }

      time += 0.025;
      angleY += isDone ? 0.025 : 0.014;
      angleX += isDone ? 0.015 : 0.008;

      // Central ambient glow
      const glowR = Math.max(1, 90 * contraction);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(
        0,
        `rgba(${Math.round(currentColor[0])}, ${Math.round(currentColor[1])}, ${Math.round(currentColor[2])}, ${
          isDone ? 0.4 : 0.25
        })`
      );
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Project particles to 2D
      const projected = [];
      const fov = 260;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Organic sinusoidal wave morphing
        const wave =
          Math.sin(time * 2.8 * p.speed + p.phase) *
          Math.cos(time * 1.7 + p.theta) *
          (isDone ? 4 : 11);

        const r = (p.baseR + wave) * contraction;

        // Spherical to Cartesian
        const px = r * Math.sin(p.phi) * Math.cos(p.theta);
        const py = r * Math.cos(p.phi);
        const pz = r * Math.sin(p.phi) * Math.sin(p.theta);

        // 3D rotation around Y and X axes
        const x1 = px * Math.cos(angleY) - pz * Math.sin(angleY);
        const z1 = px * Math.sin(angleY) + pz * Math.cos(angleY);

        const y2 = py * Math.cos(angleX) - z1 * Math.sin(angleX);
        const z2 = py * Math.sin(angleX) + z1 * Math.cos(angleX);

        const scale = fov / (fov + z2);
        const screenX = cx + x1 * scale;
        const screenY = cy + y2 * scale;
        const radius = Math.max(0.8, p.size * scale * (0.85 + 0.35 * (z2 / baseRadius)));
        const depthAlpha = Math.min(1, Math.max(0.2, (z2 + baseRadius) / (2 * baseRadius)));

        projected.push({
          x: screenX,
          y: screenY,
          z: z2,
          radius,
          alpha: depthAlpha
        });
      }

      // Sort by depth back-to-front
      projected.sort((a, b) => a.z - b.z);

      // Draw subtle connecting constellation filaments
      ctx.lineWidth = 0.75;
      const step = 4;
      for (let i = 0; i < projected.length; i += step) {
        for (let j = i + 1; j < Math.min(projected.length, i + 9); j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 1100 * contraction) {
            const lineAlpha = (1 - distSq / (1100 * contraction)) * 0.16 * projected[i].alpha;
            ctx.strokeStyle = `rgba(${Math.round(currentColor[0])}, ${Math.round(
              currentColor[1]
            )}, ${Math.round(currentColor[2])}, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw individual particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(currentColor[0])}, ${Math.round(
          currentColor[1]
        )}, ${Math.round(currentColor[2])}, ${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  // CSS Variables configuration for layout interpolation
  const cssVars = {
    '--w': `${cardWidth}px`,
    '--h': `${measuredHeight}px`,
    '--r': phase === 'answered' ? '16px' : '24px',
    '--hOp': phase === 'answered' ? 1 : 0,
    '--oPill': phase === 'idle' ? 1 : 0,
    '--oCard': phase === 'unfolding' || phase === 'answered' ? 1 : 0,
    '--oGreen': phase === 'done' || phase === 'unfolding' ? 1 : 0
  };

  return (
    <div
      ref={containerRef}
      style={cssVars}
      className="relative flex h-[580px] w-full select-none items-center justify-center overflow-hidden"
    >
      {/* Offscreen Probe for exact text measurement prior to card expansion */}
      <div
        ref={probeRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -9999,
          left: -9999,
          width: `${cardWidth}px`,
          visibility: 'hidden',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        }}
        className="flex flex-col p-5"
      >
        {/* Mirror header */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-emerald-100" />
            <span className="text-xs font-semibold text-slate-800">AI Admin Assistant</span>
          </div>
          <span className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        {/* Mirror query pill */}
        <div className="mb-2.5 inline-flex text-xs font-medium text-slate-600">
          Q: {activeQuery}
        </div>
        {/* Mirror answer body */}
        <div className="text-[13.5px] leading-relaxed whitespace-pre-line text-slate-700">
          {answerData?.text || ''}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. INPUT PILL PHASE (Idle & Shrinking)                        */}
      {/* ------------------------------------------------------------- */}
      {(phase === 'idle' || phase === 'shrinking') && (
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: phase === 'shrinking' ? '48px' : `${Math.min(520, cardWidth)}px`,
            transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease'
          }}
          className={`absolute z-20 flex h-13 cursor-text items-center overflow-hidden rounded-full border border-slate-200/90 bg-white px-3 shadow-lg shadow-slate-200/50 backdrop-blur transition-all duration-300 hover:border-emerald-300 focus-within:border-emerald-500 focus-within:ring-3 focus-within:ring-emerald-500/15 ${
            phase === 'shrinking' ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
          }`}
        >
          {/* Sparkles leading indicator */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>

          {/* Prompt text input field */}
          <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center px-2.5">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about lab operations, samples, audit logs..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              disabled={phase !== 'idle'}
            />
          </form>

          {/* Submit action button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputQuery.trim() || phase !== 'idle'}
            aria-label="Submit prompt"
            className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
              inputQuery.trim()
                ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            <ArrowUp className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. THINKING & DONE ORB STAGE (3D Canvas + Status Messages)     */}
      {/* ------------------------------------------------------------- */}
      {(phase === 'thinking' || phase === 'done') && (
        <div
          style={{
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          className="absolute z-10 flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Subtle outer pulse ring */}
          <div
            style={{
              borderColor: phase === 'done' ? '#047857' : 'rgba(20, 184, 140, 0.45)',
              boxShadow:
                phase === 'done'
                  ? '0 0 24px rgba(4, 120, 87, 0.35)'
                  : '0 0 24px rgba(20, 184, 140, 0.25)'
            }}
            className="absolute h-54 w-54 rounded-full border border-dashed transition-all duration-500 [animation:moPulseRing_2.4s_ease-in-out_infinite]"
          />

          {/* 3D Particle Canvas */}
          <div className="relative flex items-center justify-center">
            <canvas ref={canvasRef} className="block" />

            {/* Condensing central sphere visible as particles collapse into center */}
            {phase === 'done' && (
              <div
                style={{
                  width: '48px',
                  height: '48px'
                }}
                className="mo-green mo-fade-in absolute rounded-full"
              />
            )}
          </div>

          {/* Thinking / Done Status Text */}
          <div className="mt-1 flex items-center gap-2">
            {phase === 'thinking' && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#14b88c]" />
              </span>
            )}
            <p
              style={{
                color: phase === 'done' ? '#047857' : '#0f766e'
              }}
              className="text-xs font-semibold tracking-wide transition-colors duration-300"
            >
              {statusText}
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. UNFOLDING GREEN SPHERE TO CARD TRANSITION                  */}
      {/* ------------------------------------------------------------- */}
      {phase === 'unfolding' && (
        <div
          style={{
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `var(--w)`,
            height: `var(--h)`,
            borderRadius: `var(--r)`,
            transition:
              'width 0.42s cubic-bezier(0.16, 1, 0.3, 1), height 0.42s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.35s ease, background-color 0.35s ease'
          }}
          className="absolute z-10 border border-emerald-300 bg-white shadow-xl shadow-emerald-500/10 pointer-events-none"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ANSWERED CARD (Interactive, adaptive height, scrollable)   */}
      {/* ------------------------------------------------------------- */}
      {phase === 'answered' && (
        <div
          style={{
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `var(--w)`,
            height: `var(--h)`
          }}
          className={`mo-in absolute z-20 flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl shadow-slate-200/60 backdrop-blur pointer-events-auto ${
            isResetting ? 'mo-out' : ''
          }`}
        >
          {/* Card Header */}
          <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">AI Admin Assistant</p>
                <p className="text-[10px] text-slate-400">
                  {answerData?.category || 'Laboratory Engine'} • {answerData?.timestamp}
                </p>
              </div>
            </div>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-600"
              title="Copy answer to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* User query context pill */}
          <div className="mb-2 shrink-0">
            <span className="inline-flex max-w-full truncate rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              Q: {activeQuery}
            </span>
          </div>

          {/* Answer Body: Scrollable when exceeding 280px clamp */}
          <div className="mo-a-body pr-1 text-[13.5px] leading-relaxed whitespace-pre-line text-slate-700">
            {answerData?.text}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. DYNAMIC RESET BUTTON ("New question")                      */}
      {/* Placed dynamically exactly 24px below the expanded card        */}
      {/* ------------------------------------------------------------- */}
      {phase === 'answered' && (
        <div
          style={{
            top: `calc(46% + (var(--h, 114px) / 2) + 24px)`,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          className={`mo-fade-in absolute z-20 ${isResetting ? 'mo-out' : ''}`}
        >
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span>New question</span>
          </button>
        </div>
      )}
    </div>
  );
});

export default MorphOrb;

import { ArrowLeft, Coffee, Flame, HeartHandshake, Terminal, Waves } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface StillBuildingWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALL_PHRASES = [
  'I NEED FUNDING',
  'SOLO DEV STRUGGLE',
  'I NEED FUNDING',
  'SEND COFFEE & INVESTORS',
  'I NEED FUNDING',
  'ONE PERSON BUILDING ALL OF THIS',
  'I NEED FUNDING',
  'SERVER BILLS DO NOT PAY THEMSELVES',
  'I NEED FUNDING',
  '3 AM DEBUGGING RANT',
  'I NEED FUNDING',
  'STILL BUILDING SOLO',
];

export function StillBuildingWaterModal({ isOpen, onClose }: StillBuildingWaterModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [overdrive, setOverdrive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const waveLayerCount = overdrive ? 7 : 4;
    const stepX = overdrive ? 8 : 16;

    const computeWaveY = (x: number, t: number, layer: number) => {
      const baseLine = height * (0.42 + layer * 0.085);
      const speed = 1.4 + layer * 0.35;
      const freq1 = 0.0042 + layer * 0.0008;
      const freq2 = 0.011 + layer * 0.0012;
      const amp1 = 22 - layer * 1.4;
      const amp2 = 10 - layer * 0.6;
      return (
        baseLine +
        Math.sin(x * freq1 - t * speed + layer) * amp1 +
        Math.cos(x * freq2 - t * (speed * 1.3) + layer * 1.9) * amp2
      );
    };

    const render = (now: number) => {
      const t = now * 0.0016;
      ctx.clearRect(0, 0, width, height);

      for (let layer = 0; layer < waveLayerCount; layer++) {
        const layerFrac = layer / Math.max(1, waveLayerCount - 1);
        ctx.beginPath();
        ctx.moveTo(0, computeWaveY(0, t, layer));
        for (let x = stepX; x <= width + stepX; x += stepX) {
          ctx.lineTo(x, computeWaveY(x, t, layer));
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const alpha = 0.09 + layerFrac * 0.08;
        ctx.fillStyle =
          layer % 2 === 0
            ? `rgba(42, 157, 143, ${alpha})`
            : `rgba(38, 70, 83, ${alpha + 0.06})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, overdrive]);

  if (!isOpen) return null;

  return createPortal(
    <div
      data-testid="still-building-water-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="solo-dev-rant-title"
      className="fixed inset-0 z-[9990] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[#1A1F2B] p-4 sm:p-6"
    >
      {/* Wall-to-wall written background repeating "I NEED FUNDING" */}
      <div
        data-testid="funding-background-wall"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 flex flex-col justify-between overflow-hidden select-none opacity-90"
      >
        {Array.from({ length: 18 }).map((_, rowIdx) => {
          const isEven = rowIdx % 2 === 0;
          return (
            <div
              key={rowIdx}
              className="whitespace-nowrap font-black uppercase tracking-widest leading-none text-[18px] sm:text-[26px]"
              style={{
                transform: `translate3d(${isEven ? '-4%' : '-12%'}, 0, 0) rotate(-3deg)`,
                color: isEven ? 'rgba(42, 157, 143, 0.16)' : 'rgba(233, 196, 106, 0.11)',
              }}
            >
              {Array.from({ length: 5 }).map((__, repeatIdx) => (
                <span key={repeatIdx} className="inline-block pr-6">
                  {WALL_PHRASES.map((phrase, pIdx) => (
                    <span
                      key={pIdx}
                      className={
                        phrase === 'I NEED FUNDING'
                          ? 'text-[#2A9D8F]/35 font-extrabold mx-2'
                          : 'text-[#FAF3E0]/15 mx-2'
                      }
                    >
                      {phrase} •
                    </span>
                  ))}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* Subtle ambient flowing water layer behind the rant card */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
        aria-hidden="true"
      />

      {/* Foreground Solo Dev Struggle & Rant Page Card */}
      <div className="relative z-10 my-auto w-full max-w-2xl rounded-2xl border border-[#2A9D8F]/35 bg-[#264653]/95 p-6 sm:p-8 text-left backdrop-blur-md shadow-[0_0_24px_rgba(42,157,143,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#E9C46A]/45 bg-[#1A1F2B]/80 px-3.5 py-1 text-xs font-bold text-[#E9C46A]">
            <Terminal className="h-3.5 w-3.5 text-[#E9C46A]" aria-hidden="true" />
            <span>SOLO DEV LOG · UNFILTERED RANT · NEED FUNDING</span>
          </div>
          <span className="rounded-lg border border-[#2A9D8F]/40 bg-[#1A1F2B]/80 px-3 py-1 text-[11px] font-semibold text-[#FAF3E0]">
            Team Size: Literally 1 Person
          </span>
        </div>

        <h2
          id="solo-dev-rant-title"
          className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FAF3E0] leading-tight"
        >
          The Struggle of a Solo Dev
        </h2>

        <div className="mt-4 space-y-3.5 text-xs sm:text-sm leading-relaxed text-[#FAF3E0]/85">
          <p className="rounded-xl border border-[#2A9D8F]/25 bg-[#1A1F2B]/70 p-3.5">
            <strong className="text-[#FAF3E0]">3:47 AM Rant — Why isn&apos;t the main site done yet?</strong>{' '}
            Because I am <span className="text-[#2A9D8F] font-semibold">one single human being</span>{' '}
            doing the job of an entire studio! I am the UI/UX designer, the frontend animation
            engineer, the backend database architect, the QA tester, and the guy writing every
            Story, Graphics, and Action game review on three hours of sleep.
          </p>

          <p className="rounded-xl border border-[#2A9D8F]/25 bg-[#1A1F2B]/70 p-3.5">
            <strong className="text-[#FAF3E0]">The Daily Grind:</strong> One hour I&apos;m hand-coding
            isometric 3D pie geometry and sloshing water jars, the next hour I&apos;m fighting CSS
            stacking contexts, and five minutes later my laptop fan sounds like it&apos;s cleared for
            takeoff. Building <strong className="text-[#FAF3E0]">Fluid Flow</strong> solo is a
            non-stop boss fight with zero checkpoints.
          </p>

          <p className="rounded-xl border border-[#E9C46A]/35 bg-[#1A1F2B]/80 p-3.5 text-[#FAF3E0]/90">
            <strong className="text-[#E9C46A]">Why the background says &ldquo;I NEED FUNDING&rdquo;:</strong>{' '}
            Servers cost money. Game copies for honest reviews cost money. Ramen and coffee cost
            money. Right now this entire project is powered by pure stubbornness, late-night
            caffeine, and a desperate need for actual funding so I can ship the full platform
            without melting my hardware.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5 rounded-xl border border-[#2A9D8F]/30 bg-[#1A1F2B]/85 p-3 text-xs">
          <div className="rounded-lg bg-[#264653]/65 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[#FAF3E0]/65">Sleep Schedule</p>
            <p className="mt-0.5 font-bold text-rose-300">404 Not Found</p>
          </div>
          <div className="rounded-lg bg-[#264653]/65 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[#FAF3E0]/65">Funding Pledged</p>
            <p
              data-testid="virtual-funding-amount"
              className="mt-0.5 font-bold text-rose-400 tabular-nums"
            >
              -$8,000 Debt
            </p>
          </div>
          <div className="rounded-lg bg-[#264653]/65 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[#FAF3E0]/65">Water Stress</p>
            <p className="mt-0.5 font-bold text-[#2A9D8F]">
              {overdrive ? 'Max Detail' : 'Balanced'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOverdrive((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                overdrive
                  ? 'border-[#2A9D8F] bg-[#2A9D8F]/20 text-[#FAF3E0]'
                  : 'border-[#2A9D8F]/30 bg-[#1A1F2B]/70 text-[#FAF3E0]/80 hover:border-[#2A9D8F]'
              }`}
            >
              {overdrive ? (
                <>
                  <Flame className="h-3.5 w-3.5 text-[#E9C46A]" aria-hidden="true" />
                  Water Detail: High
                </>
              ) : (
                <>
                  <Waves className="h-3.5 w-3.5 text-[#2A9D8F]" aria-hidden="true" />
                  Water Detail: Low
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="close-water-modal"
            className="inline-flex items-center gap-2 rounded-xl bg-[#EF4444] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#1A1F2B] hover:bg-[#F87171] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Intro Website
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#FAF3E0]/75">
          <Coffee className="h-3.5 w-3.5 text-[#E9C46A]" aria-hidden="true" />
          <span>Built with love, frustration, and zero VC money</span>
          <HeartHandshake className="h-3.5 w-3.5 text-[#2A9D8F]" aria-hidden="true" />
        </p>
      </div>
    </div>,
    document.body,
  );
}

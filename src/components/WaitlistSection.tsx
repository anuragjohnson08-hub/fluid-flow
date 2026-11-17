import { Check, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { isValidEmail } from '../utils/keywords';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setError(false);
    setSubmitted(true);
  };

  return (
    <section id="cta" className="px-4 pb-24 scroll-mt-24">
      <div
        className="reveal relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/25 px-6 py-16 sm:py-20 text-center shadow-[0_0_24px_rgba(255,255,255,0.08)]"
        style={{
          background:
            'linear-gradient(160deg,#1a1a1a 0%,#0b0b0b 52%,#000000 100%)',
        }}
      >
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000000]/90 via-[#000000]/45 to-transparent"
        />
        <div
          className="absolute left-1/2 top-[-120px] h-64 w-[520px] -translate-x-1/2 rounded-full glow-backdrop pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            One stop for every game.
            <br />
            Zero wasted hours.
            <span className="mt-2 block text-xl sm:text-2xl font-bold text-neutral-300">
              (Yet to release)
            </span>
          </h2>

          {!submitted ? (
            <form
              id="waitlist-form"
              className="mx-auto mt-9 flex max-w-md flex-col sm:flex-row gap-3"
              noValidate
              onSubmit={handleSubmit}
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Your email
              </label>
              <input
                ref={inputRef}
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Your email"
                className={`flex-1 rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder-neutral-400 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors ${
                  error ? 'border-white/70' : 'border-white/20'
                }`}
              />
              <button
                type="submit"
                className="gradient-button gradient-button--waitlist shrink-0"
              >
                <Sparkles className="gradient-button__icon" aria-hidden="true" />
                <span className="gradient-text">Join Fluid Flow</span>
              </button>
            </form>
          ) : (
            <p
              id="waitlist-success"
              className="mx-auto mt-9 flex max-w-md items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-medium text-white"
            >
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> This is just testing. Your email was not stored or sent.
            </p>
          )}

          {error && (
            <p id="waitlist-error" className="mt-3 text-xs font-medium text-neutral-200">
              Please enter a valid email address.
            </p>
          )}

          <p
            id="waitlist-disclaimer"
            className="mt-3.5 text-xs font-medium text-[var(--text-secondary)]"
          >
            Testing only: this email waitlist is just testing and does not store or send addresses.
          </p>

          <p className="mt-2.5 text-xs text-[var(--text-secondary)]">
            Free to browse &nbsp;·&nbsp; Story, Graphics &amp; Action ratings &nbsp;·&nbsp; Tailored suggestions
          </p>
        </div>
      </div>
    </section>
  );
}

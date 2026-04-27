"use client";
import { useEffect, useState } from "react";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(null), 2200);
    return () => window.clearTimeout(t);
  }, [hint]);

  const askAi = () => {
    let handled = false;
    const ev = new CustomEvent("ess:ask-ai-open", {
      detail: { ack: () => { handled = true; } },
      cancelable: true,
    });
    window.dispatchEvent(ev);
    if (!handled) setHint("Ask AI is coming soon.");
  };

  return (
    <>
      <div className="fixed z-40 flex flex-col gap-2 right-4 bottom-4 sm:right-6 sm:bottom-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-eb-navy text-white shadow-lg shadow-black/20 hover:bg-eb-charcoal transition focus:outline-none focus:ring-2 focus:ring-eb-navy focus:ring-offset-2 ${
            showTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={askAi}
          aria-label="Ask AI"
          title="Ask AI"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-eb-icewhite text-eb-charcoal border border-eb-slate/30 shadow-lg shadow-black/10 hover:bg-white hover:text-eb-navy transition focus:outline-none focus:ring-2 focus:ring-eb-navy focus:ring-offset-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      </div>
      {hint && (
        <div role="status" className="fixed z-50 px-3 py-1.5 text-sm text-white rounded-md shadow-lg right-20 bottom-20 sm:right-24 sm:bottom-24 bg-eb-navy/90">
          {hint}
        </div>
      )}
    </>
  );
}

import React, { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import AIChatPopup from "./AIChatPopup";

/**
 * Two stacked floating buttons + an Ask Elliot chat popup.
 * - Back to Top: appears after scrolling past 320px
 * - Ask Elliot: opens an inline popup that calls /api/ai-chat (Payload Vertex route)
 */
const FloatingActions: React.FC = () => {
  const [showTop, setShowTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <div className="fixed z-[150] flex flex-col gap-2 right-4 sm:right-6 bottom-4 sm:bottom-6">
        <button
          type="button"
          onClick={scrollTop}
          aria-label="Back to top"
          title="Back to top"
          className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-front-navy text-front-icewhite shadow-lg shadow-black/20 hover:bg-front-charcoal-grey transition focus:outline-none focus:ring-2 focus:ring-front-navy/60 focus:ring-offset-2 ${
            showTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <ArrowUp size={20} />
        </button>
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Ask Elliot"
          title="Ask Elliot"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-front-icewhite text-front-charcoal-grey border border-front-shadowed-slate/30 shadow-lg shadow-black/10 hover:bg-white hover:text-front-navy transition focus:outline-none focus:ring-2 focus:ring-front-navy/60 focus:ring-offset-2"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {chatOpen && <AIChatPopup onClose={() => setChatOpen(false)} />}
    </>
  );
};

export default FloatingActions;

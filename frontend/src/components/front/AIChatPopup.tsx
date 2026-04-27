import React, { useEffect, useRef, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";

const MAX_QUESTION_LENGTH = 200;

type Props = {
  onClose: () => void;
};

export const AIChatPopup: React.FC<Props> = ({ onClose }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit =
    question.trim().length > 0 && question.length <= MAX_QUESTION_LENGTH && !loading;

  const ask = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setAnswer(null);
    setError(null);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = (await res.json().catch(() => null)) as
        | { answer?: string; error?: string; persona?: string }
        | null;
      if (!res.ok || !data?.answer) {
        setError(data?.error || "Something went wrong. Please try again.");
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Ask Elliot — Essential Bali AI"
      className="fixed z-[200] bottom-[10.5rem] right-4 sm:right-6 w-[min(92vw,400px)] bg-front-icewhite rounded-2xl shadow-2xl border border-front-shadowed-slate/20 overflow-hidden flex flex-col max-h-[70vh]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-front-shadowed-slate/15 bg-front-navy text-front-icewhite">
        <div>
          <div className="font-serif text-base">Ask Elliot</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">
            Essential Bali AI
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto">
        <label
          className="text-xs font-medium text-front-shadowed-slate"
          htmlFor="ai-chat-question"
        >
          Your question
        </label>
        <textarea
          id="ai-chat-question"
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
          onKeyDown={onKeyDown}
          maxLength={MAX_QUESTION_LENGTH}
          rows={3}
          placeholder="Best warungs in Canggu? What's on this weekend? A wellness retreat in Ubud?"
          className="w-full resize-none rounded-md border border-front-shadowed-slate/25 bg-white px-3 py-2 text-sm text-front-charcoal-grey focus:outline-none focus:ring-2 focus:ring-front-navy/40"
        />
        <div className="flex items-center justify-between text-xs text-front-shadowed-slate">
          <span>
            {question.length}/{MAX_QUESTION_LENGTH}
          </span>
          <button
            type="button"
            onClick={ask}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-full bg-front-navy text-front-icewhite px-4 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-front-charcoal-grey transition"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {loading ? "Asking…" : "Ask"}
          </button>
        </div>

        <div className="border-t border-front-shadowed-slate/15 pt-3 mt-1">
          <div className="text-xs font-medium text-front-shadowed-slate mb-2">Answer</div>
          {loading && !answer && !error && (
            <div className="text-sm text-front-shadowed-slate italic">Thinking…</div>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && answer && (
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-front-charcoal-grey">
              {answer}
            </div>
          )}
          {!loading && !error && !answer && (
            <div className="text-sm text-front-shadowed-slate italic">
              Type a question above and press Ask (or Cmd/Ctrl+Enter). Answers aren’t saved.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatPopup;

import React, { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Check } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export const AdvertiseModal: React.FC<Props> = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState(
    "Hi Essential Bali team, I'd like to discuss placing an ad on your site. Could you share rates, available slots, and audience stats?",
  );
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email doesn't look right.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/advertise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="advertise-title"
      className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-8 bg-front-charcoal-grey/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg p-6 sm:p-8 bg-front-icewhite rounded-2xl shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute p-1.5 rounded-full top-3 right-3 text-front-shadowed-slate hover:bg-front-shadowed-slate/10 transition"
        >
          <X size={20} />
        </button>

        {!done ? (
          <>
            <h2
              id="advertise-title"
              className="font-serif text-front-section-title text-front-navy mb-1"
            >
              Advertise With Us
            </h2>
            <p className="mb-5 text-sm text-front-shadowed-slate">
              Tell us a bit about you. We'll reply from{" "}
              <span className="text-front-charcoal-grey">info@gaiada.com</span> with rates and availability.
            </p>

            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block mb-1 text-xs uppercase tracking-wider text-front-shadowed-slate">
                    Name *
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full px-3 py-2 text-sm bg-white border rounded border-front-shadowed-slate/25 focus:outline-none focus:ring-2 focus:ring-front-navy/30"
                    required
                  />
                </label>
                <label className="block">
                  <span className="block mb-1 text-xs uppercase tracking-wider text-front-shadowed-slate">
                    Email *
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full px-3 py-2 text-sm bg-white border rounded border-front-shadowed-slate/25 focus:outline-none focus:ring-2 focus:ring-front-navy/30"
                    required
                  />
                </label>
              </div>
              <label className="block">
                <span className="block mb-1 text-xs uppercase tracking-wider text-front-shadowed-slate">
                  Company / brand
                </span>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  className="w-full px-3 py-2 text-sm bg-white border rounded border-front-shadowed-slate/25 focus:outline-none focus:ring-2 focus:ring-front-navy/30"
                />
              </label>
              <label className="block">
                <span className="block mb-1 text-xs uppercase tracking-wider text-front-shadowed-slate">
                  Message *
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-white border rounded resize-none border-front-shadowed-slate/25 focus:outline-none focus:ring-2 focus:ring-front-navy/30"
                  required
                />
              </label>

              {error && (
                <div className="px-3 py-2 text-sm text-red-700 bg-red-50 rounded">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium border rounded-full border-front-shadowed-slate/30 text-front-charcoal-grey hover:bg-front-shadowed-slate/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium border rounded-full border-front-navy bg-front-navy text-front-icewhite hover:bg-front-charcoal-grey transition disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? "Sending…" : "Send inquiry"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 mb-4 text-green-600 bg-green-50 rounded-full">
              <Check size={28} />
            </div>
            <h2 className="font-serif text-front-section-title text-front-navy">
              Thanks — we got your inquiry
            </h2>
            <p className="mt-2 text-sm text-front-shadowed-slate">
              We'll reply to <span className="text-front-charcoal-grey">{email}</span> shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 mt-6 text-sm font-medium border rounded-full border-front-navy bg-front-navy text-front-icewhite hover:bg-front-charcoal-grey transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertiseModal;

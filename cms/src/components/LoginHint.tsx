"use client";
import React from "react";

/**
 * Discreet credentials hint shown beneath the Payload login form during dev.
 *
 * Set NEXT_PUBLIC_SHOW_LOGIN_HINT=false (or anything other than "true") to hide.
 * Once ESSENTIALBALI is live and a real human admin has logged in + changed pw,
 * disable this in cms/.env and rebuild.
 */
const LoginHint: React.FC = () => {
  const show = process.env.NEXT_PUBLIC_SHOW_LOGIN_HINT === "true";
  if (!show) return null;
  const email = process.env.NEXT_PUBLIC_LOGIN_HINT_EMAIL || "azlan@gaiada.com";
  const pass = process.env.NEXT_PUBLIC_LOGIN_HINT_PASS || "ChangeMe!2026";
  return (
    <aside
      style={{
        marginTop: "1.25rem",
        padding: "0.75rem 1rem",
        background: "rgba(0,0,0,0.04)",
        border: "1px dashed rgba(0,0,0,0.15)",
        borderRadius: "0.5rem",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.78rem",
        color: "rgba(0,0,0,0.65)",
        lineHeight: 1.55,
      }}
      aria-label="Demo credentials"
    >
      <div style={{ fontWeight: 600, marginBottom: "0.25rem", letterSpacing: "0.04em" }}>
        DEMO LOGIN
      </div>
      <div>
        <span style={{ opacity: 0.6 }}>email: </span>
        <span>{email}</span>
      </div>
      <div>
        <span style={{ opacity: 0.6 }}>pass:&nbsp; </span>
        <span>{pass}</span>
      </div>
      <div style={{ marginTop: "0.4rem", fontSize: "0.7rem", opacity: 0.55 }}>
        Change after first login. Set <code>NEXT_PUBLIC_SHOW_LOGIN_HINT=false</code> to hide.
      </div>
    </aside>
  );
};

export default LoginHint;

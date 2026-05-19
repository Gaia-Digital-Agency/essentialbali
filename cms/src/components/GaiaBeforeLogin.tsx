/**
 * Login screen hero — stacked order: GAIA CMS title → tree logo →
 * GAIA DIGITAL AGENCY tagline.
 * This is the SOLE brand on the login screen; graphics.Logo is wired to
 * a no-op so Payload's default wordmark is suppressed.
 */
import React from "react";

const GaiaBeforeLogin: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "2rem",
        gap: "0.9rem",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "1.75rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: "var(--theme-elevation-1000)",
        }}
      >
        GAIA CMS
      </h1>
      <img
        src="/gaia-tree-logo.png"
        alt="Gaia"
        style={{
          width: "140px",
          height: "140px",
          display: "block",
          borderRadius: "1.25rem",
          objectFit: "cover",
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: "0.72rem",
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--theme-elevation-500)",
        }}
      >
        Gaia Digital Agency
      </p>
    </div>
  );
};

export default GaiaBeforeLogin;

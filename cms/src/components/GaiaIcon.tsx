/**
 * Payload admin Icon — compact mark shown when the nav is collapsed.
 * Tree-of-life on yellow (image carries the yellow background).
 *
 * Wired into payload.config.ts as admin.components.graphics.Icon.
 */
import React from "react";

const GaiaIcon: React.FC = () => {
  return (
    <img
      src="/gaia-tree-icon.webp"
      alt="Gaia"
      style={{
        width: "32px",
        height: "32px",
        objectFit: "contain",
        display: "block",
        borderRadius: "0.3rem",
      }}
    />
  );
};

export default GaiaIcon;

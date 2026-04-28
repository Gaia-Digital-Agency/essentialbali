/**
 * Shared access helpers — keep behavior consistent across collections.
 *
 * Roles:
 *   admin     — full access via UI + API
 *   editor    — full access via UI + API (humans)
 *   ai-agent  — full access via API key (Elliot et al on gda-ai01)
 */
import type { Access } from "payload";

export const isStaffOrAgent: Access = ({ req }) => {
  const role = (req?.user as any)?.role;
  return role === "admin" || role === "editor" || role === "ai-agent";
};

/** Public read (anonymous). All collections currently allow this. */
export const publicRead: Access = () => true;

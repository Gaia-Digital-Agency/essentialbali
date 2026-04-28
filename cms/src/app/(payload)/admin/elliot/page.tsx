import type { Metadata } from "next";
import TalkToElliotView from "@/components/TalkToElliotView";

export const metadata: Metadata = {
  title: "Talk to Elliot",
};

/**
 * /admin/elliot route — wrapped in the (payload) route group so it inherits
 * the Payload admin chrome (sidebar, header, theming). Auth is enforced by
 * Payload's gateway middleware on (payload) routes.
 */
export default function ElliotPage() {
  return <TalkToElliotView />;
}

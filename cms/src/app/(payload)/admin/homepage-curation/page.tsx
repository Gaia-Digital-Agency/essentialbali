import type { Metadata } from "next";
import HomepageCurationView from "@/components/HomepageCurationView";

export const metadata: Metadata = {
  title: "Homepage Curation",
};

/**
 * /admin/homepage-curation — operator surface for the 5×4 homepage feed.
 * Wrapped in (payload) route group so it inherits Payload's admin chrome
 * + auth gate.
 */
export default function HomepageCurationPage() {
  return <HomepageCurationView />;
}

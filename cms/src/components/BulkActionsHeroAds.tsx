"use client";
import React from "react";
import BulkActions from "./BulkActions";

/** Wrapper for the Hero Ads list view. Wired via
 *  HeroAds.admin.components.beforeListTable.
 *
 *  Note: HeroGridView replaces the default list view, so this only
 *  shows when the list is rendered through Payload's standard UI
 *  (e.g. `/admin/collections/hero-ads?view=table` if such a path
 *  exists). It's still useful for direct-list ops via the API path.
 */
const BulkActionsHeroAds: React.FC = () => (
  <BulkActions endpoint="/api/hero-ads/bulk" noun="hero ads" />
);
export default BulkActionsHeroAds;

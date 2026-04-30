"use client";
import React from "react";
import BulkActions from "./BulkActions";

/** Wrapper for the Articles list view. Wired via
 *  Articles.admin.components.beforeListTable. */
const BulkActionsArticles: React.FC = () => (
  <BulkActions endpoint="/api/articles/bulk" noun="articles" />
);
export default BulkActionsArticles;

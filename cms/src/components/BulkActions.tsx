"use client";

/**
 * Mass-action toolbar for the Articles + Hero Ads list views.
 *
 * Renders 5 buttons above the standard list table. Reads selected row
 * ids from Payload's row checkboxes via DOM (cell-_select input[checkbox]),
 * POSTs to the matching /bulk endpoint, shows a result toast.
 *
 * Two thin wrapper components export this with the right config:
 *   • BulkActionsArticles  — endpoint = /api/articles/bulk
 *   • BulkActionsHeroAds   — endpoint = /api/hero-ads/bulk
 *
 * Why DOM-scrape selection instead of @payloadcms/ui's useSelection:
 * the ui package isn't a direct cms dep and adding it triggers the
 * server-only import chain we hit twice during this batch.
 *
 * No window.confirm — uses inline two-step confirm so the Chrome
 * automation flow can drive it (lesson learned in Push-to-all).
 */
import React, { useState } from "react";

type Action = "approve" | "reject" | "delete" | "publish" | "unpublish";

const ACTION_META: Record<
  Action,
  { label: string; color: string; description: string }
> = {
  approve: {
    label: "Approve",
    color: "#16a34a",
    description: "Articles → 'approved' (auto-publishes). Hero ads → active=true.",
  },
  publish: {
    label: "Publish",
    color: "#0ea5e9",
    description: "Articles → 'published' + stamp publishedAt. Hero ads → active=true.",
  },
  unpublish: {
    label: "Unpublish",
    color: "#737373",
    description: "Articles → 'draft' + clear publishedAt. Hero ads → active=false.",
  },
  reject: {
    label: "Reject",
    color: "#f59e0b",
    description:
      "Articles → 'rejected' (releases hash-lock; NO Elliot redo). Hero ads → active=false + clear creative.",
  },
  delete: {
    label: "Delete",
    color: "#dc2626",
    description: "Hard delete the row(s). Permanent.",
  },
};

type Props = {
  /** /api/articles/bulk or /api/hero-ads/bulk */
  endpoint: string;
  /** Plural noun for messages, e.g. 'articles' or 'hero ads' */
  noun: string;
};

function rowCheckboxes(): HTMLInputElement[] {
  if (typeof document === "undefined") return [];
  // Payload v3 list checkboxes: each row has an input[type=checkbox]
  // inside td.cell-_select. v3.84 also exposes them at the wrapper
  // as .select-row__checkbox — match both for robustness.
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'td.cell-_select input[type="checkbox"], .cell-_select input[type="checkbox"], .select-row__checkbox input[type="checkbox"]',
    ),
  );
}

function getSelectedIds(): number[] {
  // v3.84: the checkbox <input> has no value attribute; the row id
  // lives on the closest <tr data-id="NNN">. Walk up to the row.
  return rowCheckboxes()
    .filter((c) => c.checked)
    .map((c) => {
      const tr = c.closest("tr[data-id]") as HTMLElement | null;
      const fromTr = tr?.dataset?.id;
      if (fromTr) return Number(fromTr);
      // Fallback for older Payload versions that did set value=.
      return Number(c.value);
    })
    .filter((v) => Number.isInteger(v) && v > 0);
}

/**
 * Programmatically toggle every row checkbox on the current page.
 * Operator can act on every visible row without clicking each box by
 * hand. Dispatches a real `click` event so Payload's React state hook
 * updates (just setting .checked wouldn't propagate).
 */
function toggleAllVisible(target: boolean): number {
  const checks = rowCheckboxes();
  let changed = 0;
  for (const c of checks) {
    if (c.checked !== target) {
      c.click();
      changed++;
    }
  }
  return changed;
}

function countVisibleRows(): number {
  return rowCheckboxes().length;
}

const BulkActions: React.FC<Props> = ({ endpoint, noun }) => {
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<Action | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultOk, setResultOk] = useState<boolean>(true);

  const start = (action: Action) => {
    const ids = getSelectedIds();
    if (ids.length === 0) {
      setResult("Select rows first (use the checkboxes in the list).");
      setResultOk(false);
      return;
    }
    setConfirmingAction(action);
    setResult(`${action.toUpperCase()} ${ids.length} ${noun}? Click confirm to proceed.`);
    setResultOk(true);
  };

  const cancel = () => {
    setConfirmingAction(null);
    setResult(null);
  };

  const run = async () => {
    if (!confirmingAction) return;
    const action = confirmingAction;
    const ids = getSelectedIds();
    if (ids.length === 0) {
      setResult("Selection cleared. Cancelled.");
      setResultOk(false);
      setConfirmingAction(null);
      return;
    }
    setPendingAction(action);
    setConfirmingAction(null);
    setResult(`Sending ${action} for ${ids.length} ${noun}…`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        succeeded?: number;
        failed?: number;
        requested?: number;
        error?: string;
      };
      if (json.error) {
        setResult(`Failed: ${json.error}`);
        setResultOk(false);
      } else {
        setResult(
          `${action.toUpperCase()} done: ${json.succeeded}/${json.requested} ${noun}` +
            (json.failed ? `. ${json.failed} failed.` : ""),
        );
        setResultOk(!json.failed);
        // Refresh the page to update the visible list state.
        if (typeof window !== "undefined") {
          setTimeout(() => window.location.reload(), 700);
        }
      }
    } catch (e: any) {
      setResult(`Network error: ${e?.message || "unknown"}`);
      setResultOk(false);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div style={wrap}>
      <div style={titleRow}>
        <strong style={{ fontSize: "0.85rem" }}>Bulk actions</strong>
        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
          tick rows in the list (or use Select all on page below)
        </span>
      </div>
      <div style={selectRow}>
        <button
          type="button"
          onClick={() => {
            const n = toggleAllVisible(true);
            const total = countVisibleRows();
            setResult(
              n === 0
                ? `Already ticked ${total} row${total === 1 ? "" : "s"} on this page.`
                : `Ticked ${n} row${n === 1 ? "" : "s"} (now ${total} selected).`,
            );
            setResultOk(true);
          }}
          disabled={!!pendingAction || !!confirmingAction}
          style={selectBtn}
          title="Tick every row checkbox on the current page."
        >
          ☑ Select all on page
        </button>
        <button
          type="button"
          onClick={() => {
            const n = toggleAllVisible(false);
            setResult(n === 0 ? "Nothing was selected." : `Cleared ${n} selection${n === 1 ? "" : "s"}.`);
            setResultOk(true);
          }}
          disabled={!!pendingAction || !!confirmingAction}
          style={selectBtn}
          title="Untick every row checkbox on the current page."
        >
          ☐ Clear
        </button>
      </div>
      <div style={btnRow}>
        {(Object.keys(ACTION_META) as Action[]).map((a) => {
          const meta = ACTION_META[a];
          const busy = pendingAction === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => start(a)}
              disabled={!!pendingAction || !!confirmingAction}
              title={meta.description}
              style={{
                ...btn,
                background: meta.color,
                opacity: busy ? 0.6 : 1,
                cursor: pendingAction || confirmingAction ? "not-allowed" : "pointer",
              }}
            >
              {busy ? "…" : meta.label}
            </button>
          );
        })}
      </div>
      {confirmingAction && (
        <div style={confirmRow}>
          <button type="button" onClick={run} style={confirmBtn}>
            Confirm {ACTION_META[confirmingAction].label}
          </button>
          <button type="button" onClick={cancel} style={cancelBtn}>
            Cancel
          </button>
        </div>
      )}
      {result && (
        <div
          style={{
            ...resultBar,
            background: resultOk
              ? "rgba(22,163,74,0.12)"
              : "rgba(220,38,38,0.12)",
            color: resultOk ? "#16a34a" : "#dc2626",
            borderColor: resultOk ? "rgba(22,163,74,0.4)" : "rgba(220,38,38,0.4)",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
};

const selectRow: React.CSSProperties = {
  display: "flex",
  gap: "0.4rem",
  marginBottom: "0.4rem",
  flexWrap: "wrap",
};
const selectBtn: React.CSSProperties = {
  fontSize: "0.75rem",
  padding: "0.3rem 0.7rem",
  background: "transparent",
  border: "1px solid var(--theme-elevation-300)",
  color: "var(--theme-text)",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: 500,
};

const wrap: React.CSSProperties = {
  margin: "0.5rem 0 1rem",
  padding: "0.7rem 0.9rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "8px",
};
const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.7rem",
  marginBottom: "0.5rem",
  color: "var(--theme-text)",
};
const btnRow: React.CSSProperties = {
  display: "flex",
  gap: "0.4rem",
  flexWrap: "wrap",
};
const btn: React.CSSProperties = {
  padding: "0.4rem 0.9rem",
  borderRadius: "5px",
  border: "none",
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.78rem",
};
const confirmRow: React.CSSProperties = {
  marginTop: "0.6rem",
  display: "flex",
  gap: "0.4rem",
};
const confirmBtn: React.CSSProperties = {
  ...btn,
  background: "#dc2626",
};
const cancelBtn: React.CSSProperties = {
  ...btn,
  background: "transparent",
  color: "var(--theme-text)",
  border: "1px solid var(--theme-elevation-150)",
};
const resultBar: React.CSSProperties = {
  marginTop: "0.6rem",
  padding: "0.5rem 0.8rem",
  borderRadius: "6px",
  fontSize: "0.8rem",
  border: "1px solid",
};

export default BulkActions;

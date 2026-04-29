/**
 * Lexical → HTML serializer (legacy SSR support).
 *
 * Payload v3 stores rich-text as a Lexical JSON tree. The legacy Vite
 * frontend renders article body via dangerouslySetInnerHTML on the
 * `article_post` field expecting an HTML string. Pre-this-module, the
 * SSR fetcher was passing the JSON tree's stringified form (`{"root":...}`)
 * into article_post — which dangerouslySetInnerHTML rendered as raw text,
 * not HTML.
 *
 * This module converts the tree to HTML. Minimal but covers everything
 * Payload's Lexical default editor emits in this project.
 *
 * Spec coverage:
 *   - root, paragraph, heading (h1-h6), quote
 *   - list (ul / ol), listitem (with optional checked)
 *   - text with format bits (bold/italic/underline/strikethrough/code/sub/sup)
 *   - link (autolink + manual link, opens in same window unless target set)
 *   - linebreak, horizontalrule
 *   - upload (image — emits <img> with alt + size variants if present)
 *
 * Input `node` is either:
 *   - the full {root: {...}} envelope, or
 *   - a single Lexical node (for recursive calls).
 *
 * Returns HTML string. Always escapes user text. Never throws — unknown
 * node types render as their children's joined HTML or empty string.
 */

const TEXT_FORMAT_BITS = {
  1:   ["bold",          "strong"],
  2:   ["italic",        "em"],
  4:   ["strikethrough", "s"],
  8:   ["underline",     "u"],
  16:  ["code",          "code"],
  32:  ["subscript",     "sub"],
  64:  ["superscript",   "sup"],
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function renderText(node) {
  // node.format is a bitfield; wrap text with each tag whose bit is set.
  // Also handle node.style (inline color etc.) — we ignore for safety.
  let out = escapeHtml(node.text || "");
  const fmt = Number(node.format || 0);
  for (const [bitStr, [, tag]] of Object.entries(TEXT_FORMAT_BITS)) {
    const bit = Number(bitStr);
    if (fmt & bit) out = `<${tag}>${out}</${tag}>`;
  }
  return out;
}

function renderChildren(children) {
  if (!Array.isArray(children)) return "";
  return children.map((c) => renderNode(c)).join("");
}

function renderNode(node) {
  if (!node || typeof node !== "object") return "";

  // Top-level envelope `{root: ...}` — unwrap.
  if (node.root) return renderChildren(node.root.children);

  switch (node.type) {
    case "root":
      return renderChildren(node.children);

    case "paragraph": {
      const inner = renderChildren(node.children);
      // Skip empty <p></p> — Lexical emits these for blank lines.
      if (!inner.replace(/&nbsp;|\s/g, "")) return "<p>&nbsp;</p>";
      const align = node.format && typeof node.format === "string" ? ` style="text-align:${node.format}"` : "";
      return `<p${align}>${inner}</p>`;
    }

    case "heading": {
      const tag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tag) ? node.tag : "h2";
      const align = node.format && typeof node.format === "string" ? ` style="text-align:${node.format}"` : "";
      return `<${tag}${align}>${renderChildren(node.children)}</${tag}>`;
    }

    case "quote":
      return `<blockquote>${renderChildren(node.children)}</blockquote>`;

    case "list": {
      const tag = node.listType === "number" ? "ol" :
                  node.listType === "check"  ? "ul" : "ul";
      const cls = node.listType === "check" ? ' class="checklist"' : "";
      const start = node.listType === "number" && Number.isInteger(node.start) && node.start !== 1
        ? ` start="${node.start}"` : "";
      return `<${tag}${cls}${start}>${renderChildren(node.children)}</${tag}>`;
    }

    case "listitem": {
      const checked = typeof node.checked === "boolean"
        ? ` data-checked="${node.checked}"` : "";
      return `<li${checked}>${renderChildren(node.children)}</li>`;
    }

    case "linebreak":
      return "<br/>";

    case "horizontalrule":
    case "horizontalrule_node":
      return "<hr/>";

    case "link":
    case "autolink": {
      const href = escapeAttr(node.fields?.url || node.url || "#");
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${href}"${target}>${renderChildren(node.children)}</a>`;
    }

    case "text":
      return renderText(node);

    case "tab":
      return "&emsp;";

    case "upload": {
      // Payload upload-feature node. Doc may be expanded (relationTo +
      // value object) or just an id.
      const v = node.value;
      let url = "";
      let alt = "";
      if (v && typeof v === "object") {
        url = v.sizes?.card?.url || v.url || "";
        alt = v.alt || "";
      }
      if (!url) return "";
      return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" loading="lazy" />`;
    }

    case "block":
      // Payload block-content. Out of scope for this lightweight serializer —
      // emit a marker comment so downstream renderers can detect.
      return `<!-- lexical block: ${escapeAttr(node.fields?.blockType || "unknown")} -->`;

    default:
      // Unknown node — render its children if any, else empty.
      if (Array.isArray(node.children) && node.children.length) {
        return renderChildren(node.children);
      }
      if (typeof node.text === "string") return renderText(node);
      return "";
  }
}

/**
 * Public entry — accepts the full Payload `body` value (either a Lexical
 * `{root: ...}` object, a stringified JSON of one, or already-HTML string).
 * Returns HTML.
 */
export function lexicalToHtml(input) {
  if (input == null) return "";
  // Already plain HTML string?
  if (typeof input === "string") {
    const trimmed = input.trim();
    // Heuristic: starts with `{` -> JSON tree to parse.
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return renderNode(parsed);
      } catch {
        return input; // give up, return as-is
      }
    }
    return input;
  }
  if (typeof input === "object") return renderNode(input);
  return String(input);
}

export default lexicalToHtml;

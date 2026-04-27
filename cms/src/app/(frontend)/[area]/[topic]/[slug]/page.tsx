import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchArticleBySlug } from "@/lib/payload";
import type { Metadata } from "next";

export const revalidate = 300;

type Params = { params: Promise<{ area: string; topic: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { area, topic, slug } = await params;
  const article = await fetchArticleBySlug(area, topic, slug);
  if (!article) return {};
  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.subTitle,
    openGraph: article.hero?.url
      ? { images: [{ url: article.hero.url, alt: article.hero.alt }] }
      : undefined,
  };
}

/**
 * Lexical → minimal HTML rendering. For Phase E we just walk the root node
 * and stringify paragraphs / headings. A proper LexicalToHtml renderer can
 * replace this incrementally without touching the rest of the page.
 */
function renderLexical(body: any): string {
  if (!body || !body.root) return "";
  const lines: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "paragraph" && Array.isArray(node.children)) {
      lines.push(`<p>${node.children.map((c: any) => c.text || "").join("")}</p>`);
      return;
    }
    if (node.type === "heading" && Array.isArray(node.children)) {
      const tag = node.tag || "h2";
      lines.push(`<${tag}>${node.children.map((c: any) => c.text || "").join("")}</${tag}>`);
      return;
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };
  walk(body.root);
  return lines.join("\n");
}

export default async function ArticlePage({ params }: Params) {
  const { area, topic, slug } = await params;
  const article = await fetchArticleBySlug(area, topic, slug);
  if (!article) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-xs uppercase tracking-wider text-eb-slate mb-3">
        <Link href="/" className="hover:text-eb-navy">Home</Link>
        <span className="mx-2">·</span>
        <Link href={`/${article.area?.slug}`} className="hover:text-eb-navy">{article.area?.name}</Link>
        <span className="mx-2">·</span>
        <Link href={`/${article.area?.slug}/${article.topic?.slug}`} className="hover:text-eb-navy">{article.topic?.name}</Link>
      </nav>

      <h1 className="font-display text-3xl sm:text-4xl text-eb-navy leading-tight">
        {article.title}
      </h1>
      {article.subTitle && (
        <p className="mt-2 text-eb-slate text-lg">{article.subTitle}</p>
      )}
      <div className="mt-3 text-xs text-eb-slate/70 flex items-center gap-x-2">
        {article.persona?.name && <span>By {article.persona.name}</span>}
        {article.publishedAt && (
          <>
            <span>·</span>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </time>
          </>
        )}
      </div>

      {article.hero?.url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={article.hero.url}
          alt={article.hero.alt || article.title}
          className="mt-6 w-full aspect-[16/9] object-cover rounded-md"
        />
      )}

      <div
        className="mt-8 prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-eb-navy [&_p]:text-eb-charcoal [&_p]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderLexical(article.body) }}
      />
    </article>
  );
}

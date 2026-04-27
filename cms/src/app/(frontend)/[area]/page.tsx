import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchAreaBySlug,
  fetchTopics,
  fetchArticles,
  AREA_ORDER,
} from "@/lib/payload";
import type { Metadata } from "next";

export const revalidate = 300;

type Params = { params: Promise<{ area: string }> };

export async function generateStaticParams() {
  return AREA_ORDER.map((area) => ({ area }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { area: areaSlug } = await params;
  const area = await fetchAreaBySlug(areaSlug);
  if (!area) return {};
  return {
    title: `${area.name}`,
    description: area.intro || `Essential Bali — events, dine, wellness, and more in ${area.name}.`,
  };
}

export default async function AreaPage({ params }: Params) {
  const { area: areaSlug } = await params;
  const area = await fetchAreaBySlug(areaSlug);
  if (!area) notFound();

  const [topics, articles] = await Promise.all([
    fetchTopics(),
    fetchArticles({ areaSlug, limit: 12 }),
  ]);

  return (
    <div>
      <section className="border-b border-eb-slate/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <nav className="text-xs uppercase tracking-wider text-eb-slate mb-2">
            <Link href="/" className="hover:text-eb-navy">Home</Link>
            <span className="mx-2">·</span>
            <span className="text-eb-charcoal">{area.name}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl text-eb-navy">{area.name}</h1>
          {area.intro && <p className="mt-3 text-eb-slate max-w-2xl">{area.intro}</p>}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display text-lg text-eb-navy mb-4">Topics in {area.name}</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/${area.slug}/${t.slug}`}
                className="block rounded border border-eb-slate/15 px-3 py-2.5 text-sm text-eb-charcoal hover:border-eb-coral hover:text-eb-coral transition-colors"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {articles.docs.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h2 className="font-display text-lg text-eb-navy mb-4">
            Latest in {area.name}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.docs.map((a: any) => (
              <li key={a.id}>
                <Link href={`/${a.area?.slug}/${a.topic?.slug}/${a.slug}`} className="group block">
                  {a.hero?.url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={a.hero.url} alt={a.hero.alt || a.title}
                      className="w-full aspect-[16/9] object-cover rounded-md" />
                  )}
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wider text-eb-slate/70">
                      {a.topic?.name}
                    </div>
                    <h3 className="mt-1 font-display text-eb-navy text-lg group-hover:text-eb-sea">
                      {a.title}
                    </h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-eb-slate text-sm">
            New stories about {area.name} arriving soon.
          </p>
        </section>
      )}
    </div>
  );
}

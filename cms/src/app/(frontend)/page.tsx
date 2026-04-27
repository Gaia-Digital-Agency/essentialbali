import Link from "next/link";
import {
  fetchAreas,
  fetchTopics,
  fetchArticles,
  SITE,
} from "@/lib/payload";

export const revalidate = 300; // ISR — 5 min

export default async function Home() {
  const [areas, topics, latest] = await Promise.all([
    fetchAreas(),
    fetchTopics(),
    fetchArticles({ limit: 6 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-eb-slate/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h1 className="font-display text-3xl sm:text-5xl text-eb-navy leading-tight">
            {SITE.name}
          </h1>
          <p className="mt-4 text-eb-slate text-base sm:text-lg max-w-2xl mx-auto">
            {SITE.tagline}
          </p>
        </div>
      </section>

      {/* Areas grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl text-eb-navy mb-6">Explore by area</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {areas.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/${a.slug}`}
                className="block group rounded-lg border border-eb-slate/15 hover:border-eb-sea hover:shadow-sm transition-all p-4"
              >
                <div className="font-display text-eb-navy text-lg group-hover:text-eb-sea">
                  {a.name}
                </div>
                {a.intro && (
                  <p className="mt-1 text-xs text-eb-slate line-clamp-2">{a.intro}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Topics list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="font-display text-xl text-eb-navy mb-4">Topics</h2>
        <ul className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/topic/${t.slug}`}
                className="inline-block px-3 py-1.5 rounded-full border border-eb-slate/20 text-sm text-eb-charcoal hover:border-eb-coral hover:text-eb-coral transition-colors"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Latest articles */}
      {latest.docs.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="font-display text-xl text-eb-navy mb-6">Latest stories</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.docs.map((a: any) => (
              <li key={a.id}>
                <Link
                  href={`/${a.area?.slug}/${a.topic?.slug}/${a.slug}`}
                  className="group block"
                >
                  {a.hero?.url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={a.hero.url}
                      alt={a.hero.alt || a.title}
                      className="w-full aspect-[16/9] object-cover rounded-md"
                    />
                  )}
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wider text-eb-slate/70">
                      {a.area?.name} · {a.topic?.name}
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
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-eb-slate text-sm">
            New stories arriving soon. Pick an area or topic above to start exploring.
          </p>
        </section>
      )}
    </div>
  );
}

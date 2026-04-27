import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchTopicBySlug,
  fetchAreas,
  fetchArticles,
  TOPIC_ORDER,
} from "@/lib/payload";
import type { Metadata } from "next";

export const revalidate = 300;

type Params = { params: Promise<{ topic: string }> };

export async function generateStaticParams() {
  return TOPIC_ORDER.map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { topic: topicSlug } = await params;
  const topic = await fetchTopicBySlug(topicSlug);
  if (!topic) return {};
  return {
    title: topic.name,
    description: `${topic.name} stories across all of Bali`,
  };
}

export default async function TopicLandingPage({ params }: Params) {
  const { topic: topicSlug } = await params;
  const topic = await fetchTopicBySlug(topicSlug);
  if (!topic) notFound();

  const [areas, articles] = await Promise.all([
    fetchAreas(),
    fetchArticles({ topicSlug, limit: 24 }),
  ]);

  return (
    <div>
      <section className="border-b border-eb-slate/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <nav className="text-xs uppercase tracking-wider text-eb-slate mb-2">
            <Link href="/" className="hover:text-eb-navy">Home</Link>
            <span className="mx-2">·</span>
            <span>Topic</span>
            <span className="mx-2">·</span>
            <span className="text-eb-charcoal">{topic.name}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl text-eb-navy">{topic.name}</h1>
          {topic.intro && <p className="mt-3 text-eb-slate max-w-2xl">{topic.intro}</p>}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display text-lg text-eb-navy mb-4">{topic.name} by area</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {areas.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/${a.slug}/${topic.slug}`}
                className="block rounded border border-eb-slate/15 px-3 py-2.5 text-sm text-eb-charcoal hover:border-eb-coral hover:text-eb-coral transition-colors"
              >
                {a.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {articles.docs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h2 className="font-display text-lg text-eb-navy mb-4">Latest {topic.name.toLowerCase()}</h2>
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
                    <div className="text-xs uppercase tracking-wider text-eb-slate/70">{a.area?.name}</div>
                    <h3 className="mt-1 font-display text-eb-navy text-lg group-hover:text-eb-sea">
                      {a.title}
                    </h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

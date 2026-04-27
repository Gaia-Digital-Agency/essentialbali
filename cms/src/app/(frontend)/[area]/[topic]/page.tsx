import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchAreaBySlug,
  fetchTopicBySlug,
  fetchArticles,
  AREA_ORDER,
  TOPIC_ORDER,
} from "@/lib/payload";
import HeroAd from "@/components/HeroAd";
import type { Metadata } from "next";

export const revalidate = 300;

type Params = { params: Promise<{ area: string; topic: string }> };

export async function generateStaticParams() {
  const out: Array<{ area: string; topic: string }> = [];
  for (const a of AREA_ORDER) for (const t of TOPIC_ORDER) out.push({ area: a, topic: t });
  return out;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { area: areaSlug, topic: topicSlug } = await params;
  const [area, topic] = await Promise.all([
    fetchAreaBySlug(areaSlug),
    fetchTopicBySlug(topicSlug),
  ]);
  if (!area || !topic) return {};
  return {
    title: `${topic.name} in ${area.name}`,
    description: `${topic.name} stories in ${area.name} — Essential Bali`,
  };
}

export default async function TopicPage({ params }: Params) {
  const { area: areaSlug, topic: topicSlug } = await params;
  const [area, topic] = await Promise.all([
    fetchAreaBySlug(areaSlug),
    fetchTopicBySlug(topicSlug),
  ]);
  if (!area || !topic) notFound();

  const articles = await fetchArticles({ areaSlug, topicSlug, limit: 24 });

  return (
    <div>
      <section className="border-b border-eb-slate/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <nav className="text-xs uppercase tracking-wider text-eb-slate mb-2">
            <Link href="/" className="hover:text-eb-navy">Home</Link>
            <span className="mx-2">·</span>
            <Link href={`/${area.slug}`} className="hover:text-eb-navy">{area.name}</Link>
            <span className="mx-2">·</span>
            <span className="text-eb-charcoal">{topic.name}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl text-eb-navy">
            {topic.name} in {area.name}
          </h1>
        </div>
      </section>

      {/* Hero ad slot — placeholder until Activate=true in Payload */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <HeroAd
          areaId={area.id}
          topicId={topic.id}
          areaName={area.name}
          topicName={topic.name}
        />
      </section>

      {articles.docs.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
                    <h3 className="font-display text-eb-navy text-lg group-hover:text-eb-sea">
                      {a.title}
                    </h3>
                    {a.subTitle && (
                      <p className="mt-1 text-sm text-eb-slate line-clamp-2">{a.subTitle}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-eb-slate text-sm">
            New {topic.name.toLowerCase()} stories in {area.name} arriving soon.
          </p>
        </section>
      )}
    </div>
  );
}

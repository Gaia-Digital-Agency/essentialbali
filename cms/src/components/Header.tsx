import Link from "next/link";
import { fetchAreas, fetchTopics, SITE } from "@/lib/payload";

export default async function Header() {
  const [areas, topics] = await Promise.all([fetchAreas(), fetchTopics()]);

  return (
    <header className="border-b border-eb-slate/15 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-eb-navy hover:text-eb-sea transition-colors"
        >
          {SITE.name}
        </Link>
        <nav className="hidden md:flex items-center gap-x-5 text-sm text-eb-charcoal">
          {topics.slice(0, 6).map((t) => (
            <Link
              key={t.slug}
              href={`/topic/${t.slug}`}
              className="hover:text-eb-sea transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </nav>
      </div>
      <nav
        aria-label="Areas"
        className="border-t border-eb-slate/10 bg-eb-icewhite"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-x-5 overflow-x-auto text-[13px] text-eb-slate">
          {areas.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.slug}`}
              className="whitespace-nowrap hover:text-eb-navy transition-colors"
            >
              {a.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

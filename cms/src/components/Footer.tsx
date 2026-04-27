import Link from "next/link";
import { fetchAreas, fetchTopics, SITE } from "@/lib/payload";

export default async function Footer() {
  const [areas, topics] = await Promise.all([fetchAreas(), fetchTopics()]);

  return (
    <footer className="mt-16 border-t border-eb-slate/15 bg-eb-icewhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-display text-eb-navy mb-3">Areas</h4>
            <ul className="space-y-1.5">
              {areas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/${a.slug}`}
                    className="text-eb-slate hover:text-eb-navy transition-colors"
                  >
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-eb-navy mb-3">Topics</h4>
            <ul className="space-y-1.5">
              {topics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/topic/${t.slug}`}
                    className="text-eb-slate hover:text-eb-navy transition-colors"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="font-display text-eb-navy mb-3">{SITE.name}</h4>
            <p className="text-eb-slate leading-relaxed max-w-md">
              {SITE.tagline}
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-eb-slate/15 flex flex-col items-center gap-1.5 text-center">
          <p className="text-xs text-eb-slate">
            Copyright &copy; {new Date().getFullYear()} {SITE.name}
          </p>
          <Link
            href="/admin"
            className="text-[10px] uppercase tracking-wider text-eb-slate/60 hover:text-eb-navy transition-colors"
            aria-label="Admin"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

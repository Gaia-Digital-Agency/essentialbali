import { fetchHeroAd } from "@/lib/payload";

export default async function HeroAd({
  areaId,
  topicId,
  areaName,
  topicName,
}: {
  areaId: any;
  topicId: any;
  areaName: string;
  topicName: string;
}) {
  const ad = await fetchHeroAd(areaId, topicId);
  const isActive = ad?.active && ad?.creative;

  if (isActive) {
    const creative = (ad.creative as any) || {};
    const link = ad?.linkUrl || "#";
    return (
      <a
        href={link}
        target="_blank"
        rel="sponsored noopener"
        className="block relative w-full overflow-hidden rounded-lg border border-eb-slate/15"
        aria-label={`Sponsored: ${ad.client || ""}`}
      >
        {creative.url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={creative.url}
            alt={creative.alt || `${areaName} ${topicName} ad`}
            className="w-full h-auto object-cover"
          />
        )}
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/85 text-eb-slate">
          Sponsored
        </span>
      </a>
    );
  }

  // Placeholder
  return (
    <div className="hero-ad-placeholder w-full rounded-lg border border-dashed border-eb-slate/30 px-4 py-8 sm:py-12 flex items-center justify-center text-center">
      <p className="text-sm text-eb-slate/70">
        <span className="uppercase tracking-wider text-[10px]">Ads space</span>
        <span className="mx-2">{">"}</span>
        <span className="font-medium text-eb-charcoal">{areaName}</span>
        <span className="mx-2">{">"}</span>
        <span className="font-medium text-eb-charcoal">{topicName}</span>
      </p>
    </div>
  );
}

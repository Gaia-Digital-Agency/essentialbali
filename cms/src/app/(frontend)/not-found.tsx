import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-wider text-eb-slate mb-3">404</p>
      <h1 className="font-display text-3xl sm:text-4xl text-eb-navy">
        Page not found
      </h1>
      <p className="mt-3 text-eb-slate">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded bg-eb-navy text-white hover:bg-eb-charcoal transition-colors"
        >
          Back to Essential Bali
        </Link>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import Button from "./Button";
import { subscribeNewsletter } from "../../services/newsletter.service";
import { useNotification } from "../../context/NotificationContext";
import { useContent } from "../../context/ContentContext";
import apiClient from "../../api";

/**
 * Newsletter sign-up block — appears at the bottom of every public
 * page (home, all 64 listing pages, every article).
 *
 * Copy + button text + success messages come from the CMS-managed
 * `newsletter-notice` Global, NOT from constants here. Editors edit
 * one record in the admin and every page updates.
 *
 * If the global has `active=false`, the block hides itself sitewide.
 *
 * Distinct from "Subscriber Communication" (the `newsletters`
 * collection), which manages outbound broadcast emails. Those
 * are sent to people who sign up *here*.
 */

type NoticeData = {
  active?: boolean;
  headline?: string;
  subline?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  alreadySubscribedMessage?: string;
  errorMessage?: string;
  backgroundImage?: { url?: string | null } | null;
};

// Hard-coded fallback so the section renders even if the global fetch
// fails (network blip, brief CMS restart). Mirrors the global's defaults.
const FALLBACK: Required<Omit<NoticeData, "backgroundImage">> & { backgroundImage: null } = {
  active: true,
  headline: "Get The Essential",
  subline:
    "The Essential guide to Bali's modern landscape. We bring you curated News and Events, while exploring hidden Destinations and unique Stays.",
  placeholder: "Enter your email",
  buttonText: "Subscribe Now",
  successMessage: "Thanks for subscribing to our newsletter!",
  alreadySubscribedMessage: "You're already subscribed — thanks!",
  errorMessage: "Something went wrong. Please try again.",
  backgroundImage: null,
};

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const { initialData } = useContent();
  const { setNotification } = useNotification();

  // Hydration order:
  //   1. Server-rendered initialData.initialNewsletterNotice (if present
  //      — backend SSR fetched the global before rendering, so the very
  //      first paint shows the live editor copy, not FALLBACK).
  //   2. Otherwise FALLBACK (offline / SSR fetch failure).
  // Then useEffect refreshes from /api/globals/newsletter-notice in
  // case the editor changed it between SSR cache and the visit.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ssrNotice = (initialData as any)?.initialNewsletterNotice as NoticeData | undefined;
  const [notice, setNotice] = useState<NoticeData>(
    ssrNotice ? { ...FALLBACK, ...ssrNotice } : FALLBACK,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get("globals/newsletter-notice");
        if (!cancelled && res?.data && typeof res.data === "object") {
          setNotice({ ...FALLBACK, ...res.data });
        }
      } catch {
        /* keep current state on network failure */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (notice.active === false) return null;

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const clickHandler = async () => {
    try {
      const res = await subscribeNewsletter(email);
      // Server-side message wins (it knows whether the row was new or
      // reactivated). Falls back to the global's success copy.
      setNotification({
        message:
          res?.data?.message ?? notice.successMessage ?? FALLBACK.successMessage,
        type: "neutral",
      });
      setEmail("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("subscribe failed:", error);
      setNotification({
        message:
          (error instanceof Error && error.message) ||
          notice.errorMessage ||
          FALLBACK.errorMessage,
        type: "fail",
      });
    }
  };

  const bg = notice.backgroundImage?.url
    ? { backgroundImage: `url(${notice.backgroundImage.url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  return (
    <section id="newsletter" className="container bg-front-icewhite">
      <div
        className="md:container bg-gradient-to-b md:bg-gradient-to-r from-[#0B1D2B] to-[#4A6D8C] py-8 md:py-16 rounded-[10px]"
        style={bg}
      >
        <div className="container grid grid-cols-12 items-center md:items-end">
          <div className="col-span-12 mb-8 text-center wrapper-kiri md:mb-0 md:col-span-6 md:text-left">
            <div className="mb-5 title-wrapper">
              <p className="font-serif text-3xl leading-8 md:text-front-section-title text-front-dustly-slate">
                {notice.headline}
              </p>
            </div>
            <div className="description-wrapper">
              <p className="font-sans font-light text-base leading-[26px] text-front-icewhite md:text-front-body">
                {notice.subline}
              </p>
            </div>
          </div>

          <div className="col-span-12 wrapper-kanan md:col-span-6">
            <div className="flex flex-col gap-y-6 items-center inner md:flex-row md:pl-10 md:gap-y-0 md:gap-x-4 md:items-end">
              <div className="w-full input-wrapper">
                <input
                  placeholder={notice.placeholder}
                  className="w-full border-b border-[#A3B1C2] h-full pt-4 pb-2 text-center md:text-left text-front-icewhite bg-transparent outline-none"
                  onChange={changeHandler}
                  type="email"
                  value={email}
                  suppressHydrationWarning={true}
                />
              </div>
              <div className="w-full button md:w-auto">
                <Button
                  text={notice.buttonText || FALLBACK.buttonText}
                  onClick={clickHandler}
                  bigger={true}
                  type="primary-white"
                  className="justify-center w-full whitespace-nowrap md:w-auto md:inline-flex py-3! md:py-4!"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

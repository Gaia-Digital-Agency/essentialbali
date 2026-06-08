import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL;

type ImageProps = {
  url?: string;
  ratio?: string;
  mobileRatio?: string;
  link?: string;
  overlay?: boolean;
  alt?: string;
  isLazy?: boolean;
  fetchPriority?: "high" | "auto" | "low" | undefined;
  fit?: "cover" | "contain";
  noRatio?: boolean;
  width?: string;
  height?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Image = forwardRef<any, ImageProps>(
  (
    {
      url,
      ratio = "78%",
      mobileRatio,
      link,
      overlay = false,
      alt = "",
      isLazy = true,
      fetchPriority = "low",
      fit = "cover",
      noRatio = false,
      width,
      height,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (imgRef.current) imgRef.current.style.transform = "scale(1.1)";
      },
      zoomOut: () => {
        if (imgRef.current) imgRef.current.style.transform = "scale(1)";
      },
    }));

    const theUrl = url ?? `${IMAGE_URL}/logo.png`;

    useEffect(() => {
      const imageEl = containerRef.current;
      if (!imageEl) return;

      const applyPadding = () => {
        if (noRatio) {
          imageEl.style.paddingTop = "";
          return;
        }
        const isMobile = window.innerWidth < 768;
        imageEl.style.paddingTop = (isMobile ? mobileRatio || ratio : ratio) as string;
      };

      applyPadding();
      window.addEventListener("resize", applyPadding);
      return () => window.removeEventListener("resize", applyPadding);
    }, [mobileRatio, ratio, url]);

    useEffect(() => {
      const imageEl = containerRef.current;
      if (imageEl) imageEl.style.aspectRatio = "auto";
    }, []);

    const onMouseEnter = link
      ? () => { if (imgRef.current) imgRef.current.style.transform = "scale(1.1)"; }
      : undefined;

    const onMouseLeave = link
      ? () => { if (imgRef.current) imgRef.current.style.transform = "scale(1)"; }
      : undefined;

    const theImage = () => (
      <img
        src={theUrl}
        {...({ fetchpriority: fetchPriority } as any)}
        width={width ?? undefined}
        height={height ?? undefined}
        style={{ objectFit: fit }}
        loading={isLazy ? "lazy" : "eager"}
        // power3.out ≈ cubic-bezier(0.215,0.61,0.355,1)
        className="absolute inset-0 w-full h-full z-[1] rounded-[10px] transition-transform duration-[400ms] ease-[cubic-bezier(0.215,0.61,0.355,1)]"
        alt={alt}
        ref={imgRef}
      />
    );

    const content = () => (
      <div
        ref={containerRef}
        className="image-container relative overflow-hidden rounded-[10px]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          paddingTop: noRatio ? undefined : ratio,
          aspectRatio: width && height ? `${width} / ${height}` : undefined,
        }}
      >
        <div
          className="overlay absolute inset-0 w-full h-full bg-front-navy z-[2]"
          style={{ opacity: overlay ? 0.6 : 0 }}
        />
        {theImage()}
      </div>
    );

    return link ? (
      <Link aria-label={alt} to={link}>
        {content()}
      </Link>
    ) : (
      content()
    );
  },
);

export default Image;

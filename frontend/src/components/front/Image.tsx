// import React, { useRef, useEffect } from "react";
import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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

// const Image: React.FC<ImageProps> = ({
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
    // const containerRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (imgRef.current) {
          gsap.to(imgRef.current, {
            scale: 1.1,
            duration: 0.4,
            ease: "power3.out",
          });
        }
      },
      zoomOut: () => {
        if (imgRef.current) {
          gsap.to(imgRef.current, {
            scale: 1,
            duration: 0.4,
            ease: "power3.out",
          });
        }
      },
    }));

    const { contextSafe } = useGSAP({ scope: containerRef });
    const theUrl = url ?? `${IMAGE_URL}/logo.png`;
    // const isUrl = url != `${IMAGE_URL}/uploads/placeholder.png`

    const onMouseEnter = contextSafe(() => {
      const imageEl = containerRef.current;
      if (imageEl) {
        // gsap.to(imageEl.querySelector(".overlay"), {
        //     opacity: overlay ? 0.6 : 0.4
        // })

        gsap.to(imageEl.querySelector("img"), {
          scale: 1.1,
          duration: 0.4,
          ease: "power3.out",
        });
      }
    });

    const onMouseLeave = contextSafe(() => {
      const imageEl = containerRef.current;
      if (imageEl) {
        //   gsap.to(imageEl.querySelector(".overlay"), {
        //     opacity: overlay ? 0.4 : 0,
        //   });
        gsap.to(imageEl.querySelector("img"), {
          scale: 1,
          duration: 0.4,
          ease: "power3.out",
        });
      }
    });

    useEffect(() => {
      const imageEl = containerRef.current;
      if (!imageEl) return;

      const applyPadding = () => {
        if (noRatio) {
          gsap.set(imageEl, { paddingTop: "unset" });
          return;
        }
        const isMobile = window.innerWidth < 768;
        const targetPadding = isMobile ? mobileRatio || ratio : ratio;
        gsap.set(imageEl, { paddingTop: targetPadding });
      };

      applyPadding();
      window.addEventListener("resize", applyPadding);
      return () => window.removeEventListener("resize", applyPadding);
    }, [mobileRatio, ratio, url]);

    useEffect(() => {
      const imageEl = containerRef.current;
      if (imageEl) {
        imageEl.style.aspectRatio = "auto";
      }
    }, []);

    const theImage = () => {
      return (
        <img
          src={theUrl}
          {...({ fetchpriority: fetchPriority } as any)}
          width={width ?? undefined}
          height={height ?? undefined}
          style={{ objectFit: fit }}
          loading={isLazy ? "lazy" : "eager"}
          className={`absolute inset-0 w-full h-full z-[1] rounded-[10px]`}
          alt={alt}
          ref={imgRef}
        />
      );
    };

    const content = () => {
      return (
        <div
          ref={containerRef}
          // className="image-container relative"
          className="image-container relative overflow-hidden rounded-[10px]"
          onMouseEnter={link ? onMouseEnter : undefined}
          onMouseLeave={link ? onMouseLeave : undefined}
          style={{
            aspectRatio: width && height ? `${width} / ${height}` : undefined,
          }}
        >
          <div
            className="overlay absolute inset-0 w-full h-full bg-front-navy z-[2]"
            style={{ opacity: overlay ? 0.6 : 0 }}
          ></div>
          {theImage()}
        </div>
      );
    };

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

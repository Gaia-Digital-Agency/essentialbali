import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
const IMAGE_URL = "https://storage.googleapis.com/gda-s01-bucket/essentialbali";
const Image = ({ url, ratio = "78%", mobileRatio, link, overlay = false, alt = "", isLazy = true, fetchPriority = "low", fit = "cover", noRatio = false, width, height }) => {
  const imageRef = useRef(null);
  const { contextSafe } = useGSAP({ scope: imageRef });
  const theUrl = url ?? `${IMAGE_URL}/logo.png`;
  const onMouseEnter = contextSafe(() => {
    const imageEl = imageRef.current;
    if (imageEl) {
      gsap.to(imageEl.querySelector(".overlay"), {
        opacity: overlay ? 0.6 : 0.4
      });
    }
  });
  const onMouseLeave = contextSafe(() => {
    const imageEl = imageRef.current;
    if (imageEl) {
      gsap.to(imageEl.querySelector(".overlay"), {
        opacity: overlay ? 0.4 : 0
      });
    }
  });
  useEffect(() => {
    const imageEl = imageRef.current;
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
    const imageEl = imageRef.current;
    if (imageEl) {
      imageEl.style.aspectRatio = "auto";
    }
  }, []);
  const theImage = () => {
    return /* @__PURE__ */ jsx("img", { src: theUrl, fetchPriority, width: width ?? void 0, height: height ?? void 0, style: { objectFit: fit }, loading: isLazy ? "lazy" : "eager", className: `absolute inset-0 w-full h-full z-[1]`, alt });
  };
  const content = () => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: imageRef,
        className: "image-container relative",
        onMouseEnter: link ? onMouseEnter : void 0,
        onMouseLeave: link ? onMouseLeave : void 0,
        style: { aspectRatio: width && height ? `${width} / ${height}` : void 0 },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "overlay absolute inset-0 w-full h-full bg-black z-[2]",
              style: { opacity: overlay ? 0.4 : 0 }
            }
          ),
          theImage()
        ]
      }
    );
  };
  return link ? /* @__PURE__ */ jsx(Link, { "aria-label": alt, to: link, children: content() }) : content();
};
export {
  Image as I
};

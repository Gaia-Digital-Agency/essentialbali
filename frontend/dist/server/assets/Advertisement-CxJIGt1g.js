import { jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const Advertisement = ({ ratio = "horizontal" }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    if (!isClient) return;
    const ads = document.querySelectorAll(".adsbygoogle");
    ads.forEach((ad) => {
      if (ad.getAttribute("data-adsbygoogle-status") !== "done") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    });
  }, [isClient]);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx("div", { className: "", children: /* @__PURE__ */ jsx("div", { className: `ads relative w-full bg-[#d9d9d9] ${ratio == "vertical" ? "pt-[260%]" : "pt-[16%]"}`, children: /* @__PURE__ */ jsx(
    "ins",
    {
      className: "adsbygoogle absolute top-0 w-full h-full",
      style: { display: "block" },
      "data-ad-client": "ca-pub-XXXXXXXXXXXXXXXX",
      "data-ad-slot": "1"
    }
  ) }) }) }) });
};
export {
  Advertisement as A
};

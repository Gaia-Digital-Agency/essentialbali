import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import * as React from "react";
import { useState, useEffect } from "react";
import { g as getTotalSubscriber } from "./newsletter.service-BbHT4ENG.js";
import { a as getTotalArticles, b as getArticleByFields, c as getTop10TrendingArticle } from "./article.service-DlhMD6VX.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import { u as useArticle } from "./useArticle-m4fjTi_P.js";
import { e as useAuth } from "./TimeContext-B5j8j_GZ.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { Link } from "react-router";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const SvgFile = (props) => /* @__PURE__ */ React.createElement("svg", { className: "fill-current", width: "1em", height: "1em", viewBox: "0 0 25 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M19.8335 19.75C19.8335 20.9926 18.8261 22 17.5835 22H7.0835C5.84086 22 4.8335 20.9926 4.8335 19.75V9.62105C4.8335 9.02455 5.07036 8.45247 5.49201 8.03055L10.8597 2.65951C11.2817 2.23725 11.8542 2 12.4512 2H17.5835C18.8261 2 19.8335 3.00736 19.8335 4.25V19.75ZM17.5835 20.5C17.9977 20.5 18.3335 20.1642 18.3335 19.75V4.25C18.3335 3.83579 17.9977 3.5 17.5835 3.5H12.5815L12.5844 7.49913C12.5853 8.7424 11.5776 9.75073 10.3344 9.75073H6.3335V19.75C6.3335 20.1642 6.66928 20.5 7.0835 20.5H17.5835ZM7.39262 8.25073L11.0823 4.55876L11.0844 7.5002C11.0847 7.91462 10.7488 8.25073 10.3344 8.25073H7.39262ZM8.5835 14.5C8.5835 14.0858 8.91928 13.75 9.3335 13.75H15.3335C15.7477 13.75 16.0835 14.0858 16.0835 14.5C16.0835 14.9142 15.7477 15.25 15.3335 15.25H9.3335C8.91928 15.25 8.5835 14.9142 8.5835 14.5ZM8.5835 17.5C8.5835 17.0858 8.91928 16.75 9.3335 16.75H12.3335C12.7477 16.75 13.0835 17.0858 13.0835 17.5C13.0835 17.9142 12.7477 18.25 12.3335 18.25H9.3335C8.91928 18.25 8.5835 17.9142 8.5835 17.5Z", fill: "currentColor" }));
const SvgGroup = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8.80443 5.60156C7.59109 5.60156 6.60749 6.58517 6.60749 7.79851C6.60749 9.01185 7.59109 9.99545 8.80443 9.99545C10.0178 9.99545 11.0014 9.01185 11.0014 7.79851C11.0014 6.58517 10.0178 5.60156 8.80443 5.60156ZM5.10749 7.79851C5.10749 5.75674 6.76267 4.10156 8.80443 4.10156C10.8462 4.10156 12.5014 5.75674 12.5014 7.79851C12.5014 9.84027 10.8462 11.4955 8.80443 11.4955C6.76267 11.4955 5.10749 9.84027 5.10749 7.79851ZM4.86252 15.3208C4.08769 16.0881 3.70377 17.0608 3.51705 17.8611C3.48384 18.0034 3.5211 18.1175 3.60712 18.2112C3.70161 18.3141 3.86659 18.3987 4.07591 18.3987H13.4249C13.6343 18.3987 13.7992 18.3141 13.8937 18.2112C13.9797 18.1175 14.017 18.0034 13.9838 17.8611C13.7971 17.0608 13.4132 16.0881 12.6383 15.3208C11.8821 14.572 10.6899 13.955 8.75042 13.955C6.81096 13.955 5.61877 14.572 4.86252 15.3208ZM3.8071 14.2549C4.87163 13.2009 6.45602 12.455 8.75042 12.455C11.0448 12.455 12.6292 13.2009 13.6937 14.2549C14.7397 15.2906 15.2207 16.5607 15.4446 17.5202C15.7658 18.8971 14.6071 19.8987 13.4249 19.8987H4.07591C2.89369 19.8987 1.73504 18.8971 2.05628 17.5202C2.28015 16.5607 2.76117 15.2906 3.8071 14.2549ZM15.3042 11.4955C14.4702 11.4955 13.7006 11.2193 13.0821 10.7533C13.3742 10.3314 13.6054 9.86419 13.7632 9.36432C14.1597 9.75463 14.7039 9.99545 15.3042 9.99545C16.5176 9.99545 17.5012 9.01185 17.5012 7.79851C17.5012 6.58517 16.5176 5.60156 15.3042 5.60156C14.7039 5.60156 14.1597 5.84239 13.7632 6.23271C13.6054 5.73284 13.3741 5.26561 13.082 4.84371C13.7006 4.37777 14.4702 4.10156 15.3042 4.10156C17.346 4.10156 19.0012 5.75674 19.0012 7.79851C19.0012 9.84027 17.346 11.4955 15.3042 11.4955ZM19.9248 19.8987H16.3901C16.7014 19.4736 16.9159 18.969 16.9827 18.3987H19.9248C20.1341 18.3987 20.2991 18.3141 20.3936 18.2112C20.4796 18.1175 20.5169 18.0034 20.4837 17.861C20.2969 17.0607 19.913 16.088 19.1382 15.3208C18.4047 14.5945 17.261 13.9921 15.4231 13.9566C15.2232 13.6945 14.9995 13.437 14.7491 13.1891C14.5144 12.9566 14.262 12.7384 13.9916 12.5362C14.3853 12.4831 14.8044 12.4549 15.2503 12.4549C17.5447 12.4549 19.1291 13.2008 20.1936 14.2549C21.2395 15.2906 21.7206 16.5607 21.9444 17.5202C22.2657 18.8971 21.107 19.8987 19.9248 19.8987Z", fill: "currentColor" }));
function FirstSection() {
  const [totalActiveSubscriber, setTotalActiveSubscriber] = useState(0);
  const [totalPublishedArticle, setTotalPublishedArticle] = useState(0);
  useEffect(() => {
    const countSubscribers = async () => {
      const getData = await getTotalSubscriber();
      if (getData) {
        const dataSubscriber = getData.data;
        const subsActive = dataSubscriber.active;
        setTotalActiveSubscriber(subsActive);
      }
    };
    const countArticles = async () => {
      const getData = await getTotalArticles();
      if (getData) {
        const dataArticle = getData.data;
        const nPublished = dataArticle.published;
        setTotalPublishedArticle(nPublished ?? 0);
      }
    };
    countSubscribers();
    countArticles();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800", children: /* @__PURE__ */ jsx(SvgGroup, { className: "text-gray-800 size-6 dark:text-white/90" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-end justify-between mt-5", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Newsletter Subscribers" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90", children: totalActiveSubscriber })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800", children: /* @__PURE__ */ jsx(SvgFile, { className: "text-gray-800 size-6 dark:text-white/90" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-end justify-between mt-5", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Articles Published" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90", children: totalPublishedArticle })
      ] }) })
    ] })
  ] });
}
const sizeClasses = {
  xsmall: "h-6 w-6 max-w-6",
  small: "h-8 w-8 max-w-8",
  medium: "h-10 w-10 max-w-10",
  large: "h-12 w-12 max-w-12",
  xlarge: "h-14 w-14 max-w-14",
  xxlarge: "h-16 w-16 max-w-16"
};
const statusSizeClasses = {
  xsmall: "h-1.5 w-1.5 max-w-1.5",
  small: "h-2 w-2 max-w-2",
  medium: "h-2.5 w-2.5 max-w-2.5",
  large: "h-3 w-3 max-w-3",
  xlarge: "h-3.5 w-3.5 max-w-3.5",
  xxlarge: "h-4 w-4 max-w-4"
};
const statusColorClasses = {
  online: "bg-success-500",
  offline: "bg-error-400",
  busy: "bg-warning-500"
};
const Avatar = ({
  src,
  alt = "User Avatar",
  size = "medium",
  status = "none"
}) => {
  return /* @__PURE__ */ jsxs("div", { className: `relative  rounded-full ${sizeClasses[size]}`, children: [
    /* @__PURE__ */ jsx("img", { src, alt, className: "object-cover rounded-full" }),
    status !== "none" && /* @__PURE__ */ jsx(
      "span",
      {
        className: `absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 ${statusSizeClasses[size]} ${statusColorClasses[status] || ""}`
      }
    )
  ] });
};
const API_URL$1 = "http://34.124.244.233/essentialbali";
const PinnedArticles = () => {
  const [dataArticle, setDataArticle] = useState([]);
  const { userDetails } = useAuth();
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  useEffect(() => {
    const fetchDataArticles = async () => {
      const urlParams = new URLSearchParams();
      urlParams.append("pinned", "1");
      try {
        const vaData = await getArticleByFields(
          {
            id_country: userDetails == null ? void 0 : userDetails.id_country,
            id_city: userDetails == null ? void 0 : userDetails.id_city
            // pinned: true,
          },
          urlParams
        );
        if (vaData) {
          const vaArticle = vaData.articles;
          console.log(vaArticle);
          setDataArticle(vaArticle);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataArticles();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };
  const generateImageUrl = (image, isFlag = false, id = 0) => {
    if (image) {
      return `${API_URL$1}/${image}`;
    }
    if (isFlag) {
      return `/images/country/flag.svg`;
    } else {
      return `https://picsum.photos/id/${id * 10}/1920/1080`;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-white/90", children: "Pinned Articles" }) }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-full overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { className: "border-gray-100 dark:border-gray-800 border-y", children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
            children: "#"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
            children: "Title"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Category"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Bali Area"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Author"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Date of Publish"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Actions"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { className: "divide-y divide-gray-100 dark:divide-gray-800", children: dataArticle == null ? void 0 : dataArticle.map((article, index) => /* @__PURE__ */ jsxs(TableRow, { className: "", children: [
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-theme-sm dark:text-gray-400", children: ++index }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-[50px] w-[50px] overflow-hidden rounded-md", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: getFeaturedImageUrl(article),
              className: "h-[50px] w-[50px]",
              alt: article.title
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800 text-theme-sm dark:text-white/90", children: article.title }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-theme-xs dark:text-gray-400", children: article.sub_title })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400", children: article.category_name }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsxs("div", { className: "gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-2 flex items-center justify-center", children: /* @__PURE__ */ jsx(
            Avatar,
            {
              src: generateImageUrl(
                article.country_flag,
                true,
                article.id
              ),
              size: "xsmall",
              alt: article.name_country
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-theme-xs dark:text-gray-400", children: article.name_country }) })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsx(Badge, { size: "sm", color: "primary", children: article.author_name }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsx(Badge, { size: "sm", color: "success", children: formatDate(article.publishedAt) }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: "View" }) }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: /* @__PURE__ */ jsx(Link, { to: `/admin/mst_article/edit/${article.id}`, children: "Edit" }) })
        ] }) })
      ] }, article.id)) })
    ] }) })
  ] });
};
const API_URL = "http://34.124.244.233/essentialbali";
function TrendingArticleTable() {
  const [dataArticle, setDataArticle] = useState([]);
  useEffect(() => {
    const fetchDataArticles = async () => {
      try {
        const vaData = await getTop10TrendingArticle();
        if (vaData) {
          const vaArticle = vaData.articles;
          setDataArticle(vaArticle);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataArticles();
  }, []);
  const generateImageUrl = (image, isFlag = false, id = 0) => {
    if (image) {
      return `${API_URL}/${image}`;
    }
    if (isFlag) {
      return `/images/country/flag.svg`;
    } else {
      return `https://picsum.photos/id/${id * 10}/1920/1080`;
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-white/90", children: "Trending Articles" }) }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-full overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { className: "border-gray-100 dark:border-gray-800 border-y", children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
            children: "#"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
            children: "Title"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Category"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Bali Area"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Author"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400",
            children: "Date of Publish"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { className: "divide-y divide-gray-100 dark:divide-gray-800", children: dataArticle == null ? void 0 : dataArticle.map((article, index) => /* @__PURE__ */ jsxs(TableRow, { className: "", children: [
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-theme-sm dark:text-gray-400", children: ++index }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-[50px] w-[50px] overflow-hidden rounded-md", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: generateImageUrl(
                article.featured_image_url,
                false,
                article.id
              ),
              className: "h-[50px] w-[50px]",
              alt: article.title
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800 text-theme-sm dark:text-white/90", children: article.title }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-theme-xs dark:text-gray-400", children: article.sub_title })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400", children: article.category_name }),
        /* @__PURE__ */ jsxs(TableCell, { className: "py-3 text-gray-500 text-theme-sm dark:text-gray-400", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-2 flex items-center justify-center", children: /* @__PURE__ */ jsx(
            Avatar,
            {
              src: generateImageUrl(article.country_flag, true),
              size: "xsmall",
              alt: article.name_country
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-theme-xs dark:text-gray-400", children: article.name_country }) })
        ] }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsx(Badge, { size: "sm", color: "primary", children: article.author_name }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsx(Badge, { size: "sm", color: "success", children: formatDate(article.publishedAt) }) })
      ] }, article.id)) })
    ] }) })
  ] });
}
function Home() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali - Admin Dashboard",
        description: "essentialbali - Admin Dashboard"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-4 md:gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-12 space-y-6 xl:col-span-12", children: /* @__PURE__ */ jsx(FirstSection, {}) }),
      /* @__PURE__ */ jsx("div", { className: "col-span-12", children: /* @__PURE__ */ jsx(PinnedArticles, {}) }),
      /* @__PURE__ */ jsx("div", { className: "col-span-12", children: /* @__PURE__ */ jsx(TrendingArticleTable, {}) }),
      /* @__PURE__ */ jsx("div", { className: "col-span-5" })
    ] })
  ] });
}
export {
  Home as default
};

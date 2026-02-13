import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React__default, { useState, useEffect } from "react";
import { e as useAuth, m as getAllCategory, w as getLocationByID, y as getLocationsByParentID } from "./TimeContext-B5j8j_GZ.js";
import { useOutletContext, useParams, useSearchParams, useNavigate, Link } from "react-router";
import { b as getArticleByFields, d as deleteArticle } from "./article.service-DlhMD6VX.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { S as Select } from "./Select-BNFsiCfR.js";
import { g as generatePagination } from "./pagination-DggO-1UD.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const CustomVerticalTabsChild = ({ children }) => {
  return /* @__PURE__ */ jsx(Fragment, { children });
};
const CustomVerticalTabs = ({ children, onClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const levels = ["pl-0", "pl-2", "pl-4"];
  const childArray = React__default.Children.toArray(children).filter(
    (child) => React__default.isValidElement(child)
  );
  return /* @__PURE__ */ jsx("div", { className: "p-6 border border-gray-200 rounded-xl dark:border-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 sm:flex-row sm:gap-8", children: [
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto pb-2 sm:w-[200px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-100 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5", children: /* @__PURE__ */ jsx("nav", { className: "flex flex-row w-full sm:flex-col sm:space-y-2", children: childArray.map((child, index) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `w-full block ${levels[child.props.level ?? 0]}`,
        children: /* @__PURE__ */ jsx(
          "button",
          {
            className: `inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out sm:p-3 ${activeIndex === index ? "text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50" : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`,
            onClick: () => {
              setActiveIndex(index);
              onClick();
            },
            children: child.props.title
          }
        )
      },
      `vertical-tab-${index}`
    )) }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1", children: childArray[activeIndex] })
  ] }) });
};
const RenderPages = ({ page, onClick, currentPage }) => {
  return /* @__PURE__ */ jsx("div", { className: `px-4 py-2 font-medium ${typeof page == "string" ? "" : "cursor-pointer"} ${currentPage == page ? "text-front-red" : ""}`, onClick: () => {
    if (typeof page == "string" || typeof page == "object") return;
    onClick(page);
  }, children: page });
};
const RenderPagination = ({ page, currentPage, onClick }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "prev-button cursor-pointer", onClick: () => {
      onClick(currentPage - 1);
    }, children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "12", viewBox: "0 0 8 12", fill: "none", style: { rotate: "180deg" }, children: /* @__PURE__ */ jsx("path", { d: "M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z", fill: "black" }) }) }),
    typeof page == "object" && page.map((pag) => /* @__PURE__ */ jsx(RenderPages, { page: pag, currentPage, onClick })),
    /* @__PURE__ */ jsx("div", { className: "next-button cursor-pointer", onClick: () => {
      onClick(currentPage + 1);
    }, children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "12", viewBox: "0 0 8 12", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z", fill: "black" }) }) })
  ] });
};
const RenderArticle = ({ article, onClick, category }) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "article-post p-6 shadow rounded flex justify-between items-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "inner", children: [
      /* @__PURE__ */ jsx("div", { className: "title-wrap", children: /* @__PURE__ */ jsx("p", { className: "text-xl", children: article.title }) }),
      /* @__PURE__ */ jsx("div", { className: "attr-wrap", children: /* @__PURE__ */ jsxs("p", { className: "text-md", children: [
        article.name_country,
        " / ",
        article == null ? void 0 : article.name_city,
        " / ",
        article == null ? void 0 : article.name_region,
        " - ",
        /* @__PURE__ */ jsx("span", { className: "text-sm text-front-gray", children: article.status })
      ] }) }),
      category && /* @__PURE__ */ jsx("div", { className: "category-wrap", children: /* @__PURE__ */ jsx("p", { className: "text-md text-front-red", children: category.title }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "action flex items-center gap-x-4", children: [
      /* @__PURE__ */ jsx(Button, { className: "bg-red-600", onClick, children: "Remove" }),
      /* @__PURE__ */ jsx(Link, { className: "px-5 py-3.5 text-sm inline-flex items-center justify-center gap-2 rounded-lg transition bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300", to: `/admin/mst_article/edit/${article.id}`, children: "Edit" })
    ] })
  ] }) });
};
const FormArticle = () => {
  const { setPageAdminButtonText } = useOutletContext();
  const [stateCountry, setStateCountry] = useState();
  const [cities, setCities] = useState([]);
  const { country } = useParams();
  const [availableCategories, setAvailableCategories] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  const searchPage = searchParams.get("page");
  const currentPage = searchPage ? parseInt(searchPage) : 1;
  const LIMIT = 25;
  useEffect(() => {
    setPageAdminButtonText("Add Article");
    if (!country) return;
    const urlCat = searchParams.get("category");
    let category = void 0;
    if (urlCat) {
      category = typeof urlCat == "string" ? parseInt(urlCat) : urlCat;
    }
    const fetchAllData = async () => {
      var _a;
      try {
        const countryRes = await getLocationByID("country", parseInt(country));
        if (countryRes.status_code !== 200 || !countryRes.data) {
          return;
        }
        const dataCountry = countryRes.data;
        const getArticleFromCountry = await getArticleByFields({ id_country: parseInt(country), status: ["draft", "published"], category, page: currentPage, limit: LIMIT });
        if (getArticleFromCountry == null ? void 0 : getArticleFromCountry.articles) {
          setStateCountry({ id: dataCountry.id, name: dataCountry.name, slug: dataCountry.slug, articles: getArticleFromCountry.articles, totalPages: (_a = getArticleFromCountry.pagination) == null ? void 0 : _a.totalPages });
        } else {
          setStateCountry({ id: dataCountry.id, name: dataCountry.name, slug: dataCountry.slug, articles: [] });
        }
        const cityRes = await getLocationsByParentID("city", parseInt(country));
        if (cityRes.status_code !== 200 || !cityRes.data) {
          return;
        }
        const initialCities = cityRes.data;
        const cityDataPromises = initialCities.map(async (city) => {
          var _a2;
          const regionsPromise = getLocationsByParentID("region", city.id);
          const cityArticlesPromise = getArticleByFields({ id_city: city.id, id_country: parseInt(country), status: ["draft", "published"], category, limit: LIMIT, page: currentPage });
          const [regionsRes, cityArticlesRes] = await Promise.all([regionsPromise, cityArticlesPromise]);
          let regions = [];
          if (regionsRes.status_code === 200 && regionsRes.data) {
            const regionsWithArticlesPromises = regionsRes.data.map(async (region) => {
              var _a3;
              const regionArticlesRes = await getArticleByFields({
                id_city: city.id,
                id_region: region.id,
                id_country: parseInt(country),
                status: ["draft", "published"],
                category,
                limit: LIMIT,
                page: currentPage
              });
              return {
                ...region,
                articles: (regionArticlesRes == null ? void 0 : regionArticlesRes.articles) || [],
                totalPages: (_a3 = regionArticlesRes == null ? void 0 : regionArticlesRes.pagination) == null ? void 0 : _a3.totalPages
              };
            });
            regions = await Promise.all(regionsWithArticlesPromises);
          }
          return {
            ...city,
            articles: (cityArticlesRes == null ? void 0 : cityArticlesRes.articles) || [],
            totalPages: (_a2 = cityArticlesRes == null ? void 0 : cityArticlesRes.pagination) == null ? void 0 : _a2.totalPages,
            child: regions
          };
        });
        const finalCitiesData = await Promise.all(cityDataPromises);
        setCities(finalCitiesData);
      } catch (e) {
        console.log(e);
      }
    };
    fetchAllData();
  }, [country, searchParams]);
  useEffect(() => {
    if (userDetails) {
      if (userDetails.user_level == "super_admin") return;
      if (userDetails.id_country && `${userDetails.id_country}` !== country) {
        navigate(`/admin/mst_article/${userDetails.id_country}`);
      }
    }
  }, [userDetails]);
  useEffect(() => {
    (async () => {
      try {
        const getCategory = await getAllCategory();
        if (getCategory.data) {
          setAvailableCategories(getCategory.data);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);
  const resetPage = () => {
    setSearchParams("page=");
  };
  const removeArticleHandler = async (id) => {
    try {
      const article = await deleteArticle(id);
      if (article) {
        const copyCities = [...cities];
        setCities(copyCities.map((city) => {
          var _a, _b;
          const newChild = (_a = city.child) == null ? void 0 : _a.map((child) => {
            var _a2;
            return { ...child, articles: (_a2 = child.articles) == null ? void 0 : _a2.filter((artic) => artic.id != id) };
          });
          return { ...city, articles: (_b = city.articles) == null ? void 0 : _b.filter((art) => art.id != id), child: newChild };
        }));
        setStateCountry((prev) => {
          var _a;
          if (!prev) return;
          return { ...prev, articles: (_a = prev.articles) == null ? void 0 : _a.filter((art) => art.id != id) };
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const clickPagingHandler = (page) => {
    setSearchParams(`page=${page}`);
  };
  const tabComponents = () => {
    return cities.reduce((acc, city) => {
      var _a;
      acc.push(
        /* @__PURE__ */ jsxs(CustomVerticalTabsChild, { level: 1, title: city.name, children: [
          (_a = city.articles) == null ? void 0 : _a.map((val) => /* @__PURE__ */ jsx(RenderArticle, { onClick: () => {
            removeArticleHandler(val.id);
          }, article: val, category: availableCategories == null ? void 0 : availableCategories.filter((cat) => cat.id == val.category_id)[0] }, val.id)),
          /* @__PURE__ */ jsx("div", { className: "pagination-wrapper flex justify-center gap-x-4 py-8 items-center", children: /* @__PURE__ */ jsx(RenderPagination, { page: generatePagination(currentPage, city.totalPages), currentPage, onClick: clickPagingHandler }) })
        ] }, city.id)
      );
      if (city.child) {
        const regionTabs = city.child.map((region) => {
          var _a2;
          return /* @__PURE__ */ jsxs(CustomVerticalTabsChild, { level: 2, title: region.name, children: [
            (_a2 = region.articles) == null ? void 0 : _a2.map((reg) => /* @__PURE__ */ jsx(RenderArticle, { onClick: () => {
              removeArticleHandler(reg.id);
            }, article: reg, category: availableCategories == null ? void 0 : availableCategories.filter((cat) => cat.id == reg.category_id)[0] }, reg.id)),
            /* @__PURE__ */ jsx("div", { className: "pagination-wrapper flex justify-center gap-x-4 py-8 items-center", children: /* @__PURE__ */ jsx(RenderPagination, { page: generatePagination(currentPage, region.totalPages), currentPage, onClick: clickPagingHandler }) })
          ] }, `${city.id}-${region.id}`);
        });
        acc.push(...regionTabs);
      }
      return acc;
    }, []);
  };
  const categoryChangeHandler = (val) => {
    if (val) {
      setSearchParams(`?category=${val}`);
    } else {
      setSearchParams("");
    }
  };
  const renderArticleFromState = () => {
    var _a;
    if (stateCountry == null ? void 0 : stateCountry.articles) {
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        (_a = stateCountry == null ? void 0 : stateCountry.articles) == null ? void 0 : _a.map((article) => {
          return /* @__PURE__ */ jsx(RenderArticle, { onClick: () => {
            removeArticleHandler(article.id);
          }, article, category: availableCategories == null ? void 0 : availableCategories.filter((cat) => cat.id == article.category_id)[0] });
        }),
        /* @__PURE__ */ jsx("div", { className: "pagination-wrapper flex justify-center gap-x-4 py-8 items-center", children: /* @__PURE__ */ jsx(RenderPagination, { page: generatePagination(currentPage, stateCountry.totalPages), currentPage, onClick: clickPagingHandler }) })
      ] });
    }
    return /* @__PURE__ */ jsx("p", { children: "No article Found" });
  };
  if (cities) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12", children: /* @__PURE__ */ jsx("div", { className: "col-span-4", children: /* @__PURE__ */ jsx("div", { className: "category-select", children: availableCategories && /* @__PURE__ */ jsx(Select, { placeholder: "Select a Category", options: availableCategories.map((cat) => ({ label: cat.title, value: cat.id })), onChange: categoryChangeHandler }) }) }) }),
      /* @__PURE__ */ jsxs(CustomVerticalTabs, { onClick: resetPage, children: [
        /* @__PURE__ */ jsx(CustomVerticalTabsChild, { level: 0, title: (stateCountry == null ? void 0 : stateCountry.name) ?? "", children: renderArticleFromState() }),
        ...tabComponents()
      ] })
    ] });
  } else {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
};
export {
  FormArticle as default
};

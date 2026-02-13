var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a, _b;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import React__default, { createContext, useContext, useState, useEffect, lazy, Suspense, Component } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import fastCompare from "react-fast-compare";
import invariant from "invariant";
import shallowEqual from "shallowequal";
const ENV_API_URL = "http://34.124.244.233/essentialbali".replace(/\/$/, "");
const API_URL = ENV_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
const apiClient = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : "/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
  // MANDATORY: So that cookies are sent automatically
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    var _a2;
    const originalRequest = error.config;
    if (((_a2 = error.response) == null ? void 0 : _a2.status) === 491 && (originalRequest == null ? void 0 : originalRequest.url) !== "/auth/refresh-token") {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }
      isRefreshing = true;
      try {
        await axios.post("/auth/refresh-token", null, {
          baseURL: apiClient.defaults.baseURL,
          withCredentials: true
        });
        processQueue(null);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
const getAllLocationByType = async (type) => {
  try {
    const response = await apiClient.get(`/location/${type}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const createLocation = async (type, location) => {
  try {
    const response = await apiClient.post(`/location/${type}`, location);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const getLocationByID = async (type, id) => {
  try {
    const response = await apiClient.get(`/location/${type}/${id}`);
    const resData = response.data;
    resData.data.typeLoc = type;
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const editLocation = async (id, typeLoc, location) => {
  try {
    const response = await apiClient.put(`/location/${typeLoc}/${id}`, location);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const deleteLocation = async (id, typeLoc) => {
  try {
    return await apiClient.delete(`/location/${typeLoc}/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
const getLocationsByParentID = async (type, id) => {
  try {
    const response = await apiClient.get(`/location/${type}?id_parent=${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const createCategory = async (category) => {
  try {
    const response = await apiClient.post(
      "/category",
      category
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};
const getCategoryWithFields = async (cat, props) => {
  try {
    const filtered = Object.entries(props).filter((prop) => prop[1]).join("&").replaceAll(",", "=");
    const params = new URLSearchParams(filtered).toString();
    const response = await apiClient.get(
      `/category/${cat}?${params}`
    );
    if (response.data) {
      return response.data.data;
    }
  } catch (e) {
    console.log(e);
  }
};
const getAllCategory = async () => {
  try {
    const response = await apiClient.get("/category");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
const getCategoryByID = async (id) => {
  try {
    const response = await apiClient.get(
      `/category/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};
const deleteCategory = async (id) => {
  try {
    await apiClient.delete(`/category/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
const editCategory = async (id, category) => {
  try {
    await apiClient.put(`/category/${id}`, category);
  } catch (error) {
    console.error("Error editing category:", error);
    throw error;
  }
};
const getCategoryDescByLocation = async (type, idLocation, idCategory) => {
  try {
    const response = await apiClient.get(
      `/category/location/${type}/${idLocation}/${idCategory}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};
const fetchData = {
  taxonomies: async () => {
    const getCountry = await getAllLocationByType("country");
    const getCities = await getAllLocationByType("city");
    const getRegions = await getAllLocationByType("region");
    const getCategories = await getAllCategory();
    return {
      countries: getCountry.status_code == 200 ? getCountry.data : void 0,
      cities: getCities.status_code == 200 ? getCities.data : void 0,
      regions: getRegions.status_code == 200 ? getRegions.data : void 0,
      categories: getCategories.data ?? void 0
    };
  }
};
const TaxonomyContext = createContext(
  {
    taxonomies: { countries: void 0, cities: void 0, regions: void 0, categories: void 0 },
    adminTaxonomies: { countries: void 0, cities: void 0, regions: void 0 },
    setAdminTaxonomies: () => {
    },
    loading: true,
    getCategoryById: () => {
      return void 0;
    },
    getCountryById: () => {
      return void 0;
    },
    getCityById: () => {
      return void 0;
    },
    getRegionById: () => {
      return void 0;
    },
    generateUrlLocations: () => {
      return "";
    }
  }
);
const TaxonomyProvider = ({ children, initialData }) => {
  var _a2, _b2, _c, _d;
  const hasInitialTaxonomies = !!initialData && !!(((_a2 = initialData == null ? void 0 : initialData.countries) == null ? void 0 : _a2.length) || ((_b2 = initialData == null ? void 0 : initialData.cities) == null ? void 0 : _b2.length) || ((_c = initialData == null ? void 0 : initialData.regions) == null ? void 0 : _c.length) || ((_d = initialData == null ? void 0 : initialData.categories) == null ? void 0 : _d.length));
  const [taxonomies, setTaxonomies] = useState(
    hasInitialTaxonomies ? initialData : { countries: void 0, cities: void 0, regions: void 0, categories: void 0 }
  );
  const [adminTaxonomies, setStateAdminTaxonomies] = useState({ countries: void 0, cities: void 0, regions: void 0 });
  const [loading, setLoading] = useState(!hasInitialTaxonomies);
  useEffect(() => {
    if (hasInitialTaxonomies) return;
    fetchData.taxonomies().then((data) => {
      setTaxonomies(data);
      setLoading(false);
    });
  }, [hasInitialTaxonomies]);
  const setAdminTaxonomies = (taxonomy) => {
    setStateAdminTaxonomies(taxonomy);
  };
  const getRegionById = (id) => {
    var _a3;
    return (_a3 = taxonomies == null ? void 0 : taxonomies.regions) == null ? void 0 : _a3.find((reg) => reg.id == id);
  };
  const getCityById = (id) => {
    var _a3;
    return (_a3 = taxonomies == null ? void 0 : taxonomies.cities) == null ? void 0 : _a3.find((cit) => cit.id == id);
  };
  const getCountryById = (id) => {
    var _a3;
    return (_a3 = taxonomies == null ? void 0 : taxonomies.countries) == null ? void 0 : _a3.find((cou) => cou.id == id);
  };
  const getCategoryById = (id) => {
    var _a3;
    return (_a3 = taxonomies == null ? void 0 : taxonomies.categories) == null ? void 0 : _a3.find((cat) => id == cat.id);
  };
  const generateUrlLocations = (id, locationType) => {
    var _a3, _b3, _c2;
    if (!taxonomies.countries || !taxonomies.cities || !taxonomies.regions) return "";
    let url = [];
    url.push((_a3 = taxonomies.countries.find((tax) => tax.id == id)) == null ? void 0 : _a3.slug);
    if (locationType == "city" || locationType == "region") url.push((_b3 = taxonomies.cities.find((tax) => tax.id == id)) == null ? void 0 : _b3.slug);
    if (locationType == "region") url.push((_c2 = taxonomies.regions.find((tax) => tax.id == id)) == null ? void 0 : _c2.slug);
    return url.join("/");
  };
  return /* @__PURE__ */ jsx(TaxonomyContext.Provider, { value: { taxonomies, adminTaxonomies, setAdminTaxonomies, loading, getCategoryById, getCityById, getCountryById, getRegionById, generateUrlLocations }, children });
};
const useTaxonomies = () => useContext(TaxonomyContext);
const ContentContext = createContext({ initialData: {} });
const ContentProvider = ({ children, initialData }) => {
  return /* @__PURE__ */ jsx(ContentContext.Provider, { value: { initialData }, children });
};
const useContent = () => useContext(ContentContext);
const RouteContext = createContext({ actualRoute: { country: void 0, city: void 0, region: void 0 }, setActualRoute: () => {
}, routeType: "", setRouteType: () => {
}, clientChange: false, setClientChange: () => {
}, getLocationRouteUrl: () => "", generateLocationRouteUrl: () => "" });
const RouteProvider = ({ children, initialData }) => {
  const [actualRoute, setStateActualRoute] = useState((initialData == null ? void 0 : initialData.listingParams) ?? {});
  const [routeType, setStateRouteType] = useState((initialData == null ? void 0 : initialData.type) ?? "LOADING");
  const [clientChange, setStateClientChange] = useState(false);
  const setActualRoute = (params) => {
    setStateActualRoute((prev) => ({ ...prev, ...params }));
  };
  const setRouteType = (type) => {
    setStateRouteType(type);
  };
  const setClientChange = (val) => {
    setStateClientChange(val);
  };
  const getLocationRouteUrl = () => {
    return `${actualRoute.country ? `/${actualRoute.country.slug}` : ""}${actualRoute.city ? `/${actualRoute.city.slug}` : ""}${actualRoute.region ? `/${actualRoute.region.slug}` : ""}`;
  };
  const generateLocationRouteUrl = ({ country, city, region, category }) => {
    let res = [];
    if (country) res.push(country.slug);
    if (city) res.push(city.slug);
    if (region) res.push(region.slug);
    if (category) res.push(category.slug_title);
    return "/" + res.join("/");
  };
  return /* @__PURE__ */ jsx(RouteContext.Provider, { value: { actualRoute, setActualRoute, routeType, setRouteType, clientChange, setClientChange, getLocationRouteUrl, generateLocationRouteUrl }, children });
};
const useRoute = () => useContext(RouteContext);
const login = async (credentials) => {
  try {
    const response = await apiClient.post(
      "/auth/login",
      credentials
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
const logout = async (token) => {
  try {
    const response = await apiClient.post(
      "/auth/logout",
      token
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
const getAllUser = async () => {
  try {
    const response = await apiClient.get("/auth/admin/users");
    return response.data;
  } catch (error) {
    console.error("Error Get All User:", error);
    throw error;
  }
};
const registerUser = async (payload) => {
  try {
    const response = await apiClient.post(
      "/auth/admin/register",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
const updateUserStatus = async (id, data) => {
  try {
    const response = await apiClient.put(
      `/auth/admin/user/${id}/status`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
const changePassword = async (payload) => {
  try {
    const response = await apiClient.patch(
      "/auth/admin/change-password",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
const updateInfoUser = async (payload) => {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);
    if (payload.profile_picture) {
      formData.append("profile_picture", payload.profile_picture);
    }
    const response = await apiClient.put(
      "/auth/admin/user",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update Info User Failed : ", error);
    throw error;
  }
};
const getUserProfilePicture = async () => {
  try {
    const response = await apiClient.get(`/auth/profile-picture`, {
      responseType: "blob"
    });
    const imageBlob = response.data;
    const imageUrl = URL.createObjectURL(imageBlob);
    return imageUrl;
  } catch {
    return "";
  }
};
const getDataDetailUser = async () => {
  try {
    const response = await apiClient.get("/auth/admin/user");
    return response.data;
  } catch {
    return false;
  }
};
const deleteProfilePicture = async () => {
  try {
    const response = await apiClient.delete(
      "/auth/profile-picture"
    );
    return response.data;
  } catch (error) {
    console.error("Delete Profile Picture Failed:", error);
    throw error;
  }
};
const SvgClose = (props) => /* @__PURE__ */ React.createElement("svg", { className: "size-6       ", width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z", fill: "currentColor" }));
const NotificationContext = createContext({
  setNotification: () => {
  }
});
const NotificationElement = ({
  message,
  type,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5e3);
    return () => clearTimeout(timer);
  }, []);
  const className = "pl-10 pr-6 py-4 flex gap-x-4 items-center relative rounded shadow-lg " + (type === "fail" ? "bg-front-red text-white" : "bg-front-black text-white");
  return /* @__PURE__ */ jsxs("div", { className, children: [
    message,
    /* @__PURE__ */ jsx(SvgClose, { className: "cursor-pointer", onClick: onClose })
  ] });
};
const NotificationProvider = ({ children }) => {
  const [list, setList] = useState([]);
  const setNotification = ({ message, type }) => {
    setList((prev) => [
      ...prev,
      {
        id: Date.now(),
        message,
        type
      }
    ]);
  };
  const removeNotification = (id) => {
    setList((prev) => prev.filter((n) => n.id !== id));
  };
  return /* @__PURE__ */ jsxs(NotificationContext.Provider, { value: { setNotification }, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-8 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-3", children: list.map((notif) => /* @__PURE__ */ jsx(
      NotificationElement,
      {
        ...notif,
        onClose: () => removeNotification(notif.id)
      },
      notif.id
    )) })
  ] });
};
const useNotification = () => useContext(NotificationContext);
const AuthContext = createContext({ userDetails: null, setUserDetails: (userDetails) => {
  if (userDetails) return;
} });
const AuthProvider = ({ children, initialData }) => {
  const [userDetails, setStateUserDetails] = useState(initialData ?? void 0);
  const { clientChange } = useRoute();
  const setUserDetails = (userDetail) => {
    setStateUserDetails(userDetail);
  };
  useEffect(() => {
    if (initialData || !clientChange) return;
    (async () => {
      const getUser = await getDataDetailUser();
      if (getUser) {
        if ((getUser == null ? void 0 : getUser.data) && (getUser == null ? void 0 : getUser.status_code) == 200) {
          setUserDetails(getUser.data[0]);
        } else {
          setUserDetails(void 0);
        }
      } else {
        setUserDetails(void 0);
      }
    })();
  }, []);
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { userDetails, setUserDetails }, children });
};
const useAuth = () => useContext(AuthContext);
const ProtectedRoute = ({ children, allowedUserLevel = ["super_admin", "admin_country", "admin_city"] }) => {
  const { userDetails, setUserDetails } = useAuth();
  const { setAdminTaxonomies, taxonomies } = useTaxonomies();
  const [forbiddenLevel, setForbiddenLevel] = useState(false);
  const { setNotification } = useNotification();
  const navigate = useNavigate();
  const getUser = async () => {
    const user = await getDataDetailUser();
    if (user) {
      if (user.status_code == 200 && user.data.length) {
        setUserDetails(user.data[0]);
        return true;
      } else {
        setUserDetails(void 0);
        return false;
      }
    } else {
      setUserDetails(void 0);
      return false;
    }
  };
  const determineTaxonomy = () => {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
    if (!taxonomies) return;
    const USER_COUNTRY_ID = (userDetails == null ? void 0 : userDetails.id_country) ?? 1;
    const USER_CITY_ID = (userDetails == null ? void 0 : userDetails.id_city) ?? 1;
    const USER_REGION_ID = (userDetails == null ? void 0 : userDetails.id_region) ?? 1;
    const prev = taxonomies;
    if ((userDetails == null ? void 0 : userDetails.user_level) == "super_admin") {
      setAdminTaxonomies(taxonomies);
      return;
    } else if ((userDetails == null ? void 0 : userDetails.user_level) == "admin_country") {
      const newCountry = (_a2 = prev.countries) == null ? void 0 : _a2.filter((coun) => coun.id == USER_COUNTRY_ID);
      const newCity = (_b2 = prev.cities) == null ? void 0 : _b2.filter((cit) => cit.id_parent == USER_COUNTRY_ID);
      const newRegion = (_c = prev.regions) == null ? void 0 : _c.filter((reg) => {
        return newCity == null ? void 0 : newCity.find((cit) => cit.id == reg.id_parent);
      });
      setAdminTaxonomies({ countries: newCountry, cities: newCity, regions: newRegion });
    } else if ((userDetails == null ? void 0 : userDetails.user_level) == "admin_city") {
      const newCountry = (_d = prev.countries) == null ? void 0 : _d.filter((coun) => coun.id == USER_COUNTRY_ID);
      const newCity = (_e = prev.cities) == null ? void 0 : _e.filter((cit) => cit.id == USER_CITY_ID);
      const newRegion = (_f = prev.regions) == null ? void 0 : _f.filter((reg) => reg.id_parent == USER_CITY_ID);
      setAdminTaxonomies({ countries: newCountry, cities: newCity, regions: newRegion });
    } else if ((userDetails == null ? void 0 : userDetails.user_level) == "admin_region") {
      const newCountry = (_g = prev.countries) == null ? void 0 : _g.filter((coun) => coun.id == USER_COUNTRY_ID);
      const newCity = (_h = prev.cities) == null ? void 0 : _h.filter((cit) => cit.id == USER_CITY_ID);
      const newRegion = (_i = prev.regions) == null ? void 0 : _i.filter((reg) => reg.id == USER_REGION_ID);
      setAdminTaxonomies({ countries: newCountry, cities: newCity, regions: newRegion });
    }
  };
  useEffect(() => {
    if (!forbiddenLevel) return;
    setNotification({ message: "You are not allowed to access the page", type: "fail" });
    navigate("/admin");
    setForbiddenLevel(false);
  }, [forbiddenLevel]);
  const params = useParams();
  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) {
        navigate("/signin");
      }
    })();
  }, [params]);
  useEffect(() => {
    if (userDetails) {
      determineTaxonomy();
    }
  }, [userDetails]);
  if (userDetails === null) {
    return /* @__PURE__ */ jsx(Fragment, {});
  } else {
    if (userDetails === void 0) {
      navigate("/signin");
      return /* @__PURE__ */ jsx(Fragment, {});
    }
    if (userDetails && typeof userDetails.user_level == "string") {
      if (allowedUserLevel.includes(userDetails.user_level)) {
        return /* @__PURE__ */ jsx(Fragment, { children });
      } else {
        setForbiddenLevel(true);
        return /* @__PURE__ */ jsx(Fragment, {});
      }
    }
  }
};
const ArticleAdmin = lazy(() => import("./ArticleAdmin-DiI6Eh1j.js"));
const TemplateLayout = lazy(() => import("./TemplateLayout-BqHcxjV5.js"));
const AppLayout = lazy(() => import("./AppLayout-rNId1h0q.js"));
const Home = lazy(() => import("./Home-DgSIJrqv.js"));
const SettingPage = lazy(() => import("./SettingPage-DRFxfScJ.js"));
const SocmedSettingPage = lazy(() => import("./SocmedSettingPage-CJJjwpnt.js"));
const ConfigSMTP = lazy(() => import("./ConfigSMTP-y0eq3m7x.js"));
const MstCategories = lazy(() => import("./MstCategories-DVvt1RoY.js"));
const MstTags = lazy(() => import("./MstTags-B-bC_jFL.js"));
const MstLocations = lazy(() => import("./MstLocations-D124xMZ3.js"));
const MstTemplates = lazy(() => import("./MstTemplates-CX6am46E.js"));
const GeneralTemplate = lazy(() => import("./GeneralTemplate-CI1HQ3oW.js"));
const AboutTemplate = lazy(() => import("./AboutTemplate-bPv3piBE.js"));
const LocationTemplateExp = lazy(() => import("./LocationTemplateExp-CFj7X0M1.js"));
const MstArticle = lazy(() => import("./MstArticle-OV3ZfWdN.js"));
const FormArticle = lazy(() => import("./FormArticle-DtG8gTrC.js"));
const EditArticle = lazy(() => import("./EditArticle-Dv3rAQFF.js"));
const Users = lazy(() => import("./Users-BA7GyuDw.js"));
const Registration = lazy(() => import("./Registration-DDi9njib.js"));
const UserProfiles = lazy(() => import("./UserProfiles--eDYdhLL.js"));
const MediaForm = lazy(() => import("./MediaForm-pn_2Hilv.js"));
const MediaLibrary = lazy(() => import("./MediaLibrary-gJlvcj96.js"));
const JobApplicant = lazy(() => import("./JobApplicant-DSfIvHHm.js"));
const Subscribers = lazy(() => import("./Subscribers-EEGlJ9pp.js"));
const Blank = lazy(() => import("./Blank-BLnqJ14h.js"));
const FormElements = lazy(() => import("./FormElements-BmbpxuES.js"));
const SignIn = lazy(() => import("./SignIn-DHDfF031.js"));
const adminRoutes = [
  { path: "/signin", element: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(SignIn, {}) }) },
  {
    path: "/admin",
    element: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(AppLayout, {}) }),
    children: [
      {
        index: true,
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(Home, {}) })
      },
      {
        path: "setting",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(SettingPage, {}) })
      },
      {
        path: "mst_locations",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(MstLocations, {}) })
      },
      {
        path: "mst_categories",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(MstCategories, {}) })
      },
      {
        path: "mst_tags",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(MstTags, {}) })
      },
      {
        path: "mst_templates",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(TemplateLayout, {}) }),
        children: [
          {
            index: true,
            element: /* @__PURE__ */ jsx(MstTemplates, {})
          },
          // { path: "edit-exp", element: <LocationTemplate /> },
          { path: "edit", element: /* @__PURE__ */ jsx(LocationTemplateExp, {}) },
          {
            path: "about",
            element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(AboutTemplate, {}) })
          },
          {
            path: "general",
            element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(GeneralTemplate, {}) })
          }
        ]
      },
      {
        path: "mst_article",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(ArticleAdmin, {}) }),
        children: [
          { index: true, element: /* @__PURE__ */ jsx(MstArticle, {}) },
          { path: "add", element: /* @__PURE__ */ jsx(EditArticle, { action: "add" }) },
          { path: "edit/:id", element: /* @__PURE__ */ jsx(EditArticle, { action: "edit" }) },
          { path: ":country", element: /* @__PURE__ */ jsx(FormArticle, {}) }
        ]
      },
      {
        path: "users",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(Users, {}) })
      },
      {
        path: "registration",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(Registration, {}) })
      },
      { path: "profile", element: /* @__PURE__ */ jsx(UserProfiles, {}) },
      { path: "add_media", element: /* @__PURE__ */ jsx(MediaForm, {}) },
      { path: "media_library", element: /* @__PURE__ */ jsx(MediaLibrary, {}) },
      { path: "blank", element: /* @__PURE__ */ jsx(Blank, {}) },
      { path: "form-elements", element: /* @__PURE__ */ jsx(FormElements, {}) },
      {
        path: "subscriber_list",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedUserLevel: ["super_admin"], children: /* @__PURE__ */ jsx(Subscribers, {}) })
      },
      { path: "socmed", element: /* @__PURE__ */ jsx(SocmedSettingPage, {}) },
      { path: "configSMTP", element: /* @__PURE__ */ jsx(ConfigSMTP, {}) },
      { path: "job_applicant", element: /* @__PURE__ */ jsx(JobApplicant, {}) }
    ]
  }
];
var TAG_NAMES = /* @__PURE__ */ ((TAG_NAMES2) => {
  TAG_NAMES2["BASE"] = "base";
  TAG_NAMES2["BODY"] = "body";
  TAG_NAMES2["HEAD"] = "head";
  TAG_NAMES2["HTML"] = "html";
  TAG_NAMES2["LINK"] = "link";
  TAG_NAMES2["META"] = "meta";
  TAG_NAMES2["NOSCRIPT"] = "noscript";
  TAG_NAMES2["SCRIPT"] = "script";
  TAG_NAMES2["STYLE"] = "style";
  TAG_NAMES2["TITLE"] = "title";
  TAG_NAMES2["FRAGMENT"] = "Symbol(react.fragment)";
  return TAG_NAMES2;
})(TAG_NAMES || {});
var SEO_PRIORITY_TAGS = {
  link: { rel: ["amphtml", "canonical", "alternate"] },
  script: { type: ["application/ld+json"] },
  meta: {
    charset: "",
    name: ["generator", "robots", "description"],
    property: [
      "og:type",
      "og:title",
      "og:url",
      "og:image",
      "og:image:alt",
      "og:description",
      "twitter:url",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "twitter:image:alt",
      "twitter:card",
      "twitter:site"
    ]
  }
};
var VALID_TAG_NAMES = Object.values(TAG_NAMES);
var REACT_TAG_MAP = {
  accesskey: "accessKey",
  charset: "charSet",
  class: "className",
  contenteditable: "contentEditable",
  contextmenu: "contextMenu",
  "http-equiv": "httpEquiv",
  itemprop: "itemProp",
  tabindex: "tabIndex"
};
var HTML_TAG_MAP = Object.entries(REACT_TAG_MAP).reduce(
  (carry, [key, value]) => {
    carry[value] = key;
    return carry;
  },
  {}
);
var HELMET_ATTRIBUTE = "data-rh";
var HELMET_PROPS = {
  DEFAULT_TITLE: "defaultTitle",
  DEFER: "defer",
  ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
  ON_CHANGE_CLIENT_STATE: "onChangeClientState",
  TITLE_TEMPLATE: "titleTemplate",
  PRIORITIZE_SEO_TAGS: "prioritizeSeoTags"
};
var getInnermostProperty = (propsList, property) => {
  for (let i = propsList.length - 1; i >= 0; i -= 1) {
    const props = propsList[i];
    if (Object.prototype.hasOwnProperty.call(props, property)) {
      return props[property];
    }
  }
  return null;
};
var getTitleFromPropsList = (propsList) => {
  let innermostTitle = getInnermostProperty(
    propsList,
    "title"
    /* TITLE */
  );
  const innermostTemplate = getInnermostProperty(propsList, HELMET_PROPS.TITLE_TEMPLATE);
  if (Array.isArray(innermostTitle)) {
    innermostTitle = innermostTitle.join("");
  }
  if (innermostTemplate && innermostTitle) {
    return innermostTemplate.replace(/%s/g, () => innermostTitle);
  }
  const innermostDefaultTitle = getInnermostProperty(propsList, HELMET_PROPS.DEFAULT_TITLE);
  return innermostTitle || innermostDefaultTitle || void 0;
};
var getOnChangeClientState = (propsList) => getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) || (() => {
});
var getAttributesFromPropsList = (tagType, propsList) => propsList.filter((props) => typeof props[tagType] !== "undefined").map((props) => props[tagType]).reduce((tagAttrs, current) => ({ ...tagAttrs, ...current }), {});
var getBaseTagFromPropsList = (primaryAttributes, propsList) => propsList.filter((props) => typeof props[
  "base"
  /* BASE */
] !== "undefined").map((props) => props[
  "base"
  /* BASE */
]).reverse().reduce((innermostBaseTag, tag) => {
  if (!innermostBaseTag.length) {
    const keys = Object.keys(tag);
    for (let i = 0; i < keys.length; i += 1) {
      const attributeKey = keys[i];
      const lowerCaseAttributeKey = attributeKey.toLowerCase();
      if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && tag[lowerCaseAttributeKey]) {
        return innermostBaseTag.concat(tag);
      }
    }
  }
  return innermostBaseTag;
}, []);
var warn = (msg) => console && typeof console.warn === "function" && console.warn(msg);
var getTagsFromPropsList = (tagName, primaryAttributes, propsList) => {
  const approvedSeenTags = {};
  return propsList.filter((props) => {
    if (Array.isArray(props[tagName])) {
      return true;
    }
    if (typeof props[tagName] !== "undefined") {
      warn(
        `Helmet: ${tagName} should be of type "Array". Instead found type "${typeof props[tagName]}"`
      );
    }
    return false;
  }).map((props) => props[tagName]).reverse().reduce((approvedTags, instanceTags) => {
    const instanceSeenTags = {};
    instanceTags.filter((tag) => {
      let primaryAttributeKey;
      const keys2 = Object.keys(tag);
      for (let i = 0; i < keys2.length; i += 1) {
        const attributeKey = keys2[i];
        const lowerCaseAttributeKey = attributeKey.toLowerCase();
        if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && !(primaryAttributeKey === "rel" && tag[primaryAttributeKey].toLowerCase() === "canonical") && !(lowerCaseAttributeKey === "rel" && tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet")) {
          primaryAttributeKey = lowerCaseAttributeKey;
        }
        if (primaryAttributes.indexOf(attributeKey) !== -1 && (attributeKey === "innerHTML" || attributeKey === "cssText" || attributeKey === "itemprop")) {
          primaryAttributeKey = attributeKey;
        }
      }
      if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
        return false;
      }
      const value = tag[primaryAttributeKey].toLowerCase();
      if (!approvedSeenTags[primaryAttributeKey]) {
        approvedSeenTags[primaryAttributeKey] = {};
      }
      if (!instanceSeenTags[primaryAttributeKey]) {
        instanceSeenTags[primaryAttributeKey] = {};
      }
      if (!approvedSeenTags[primaryAttributeKey][value]) {
        instanceSeenTags[primaryAttributeKey][value] = true;
        return true;
      }
      return false;
    }).reverse().forEach((tag) => approvedTags.push(tag));
    const keys = Object.keys(instanceSeenTags);
    for (let i = 0; i < keys.length; i += 1) {
      const attributeKey = keys[i];
      const tagUnion = {
        ...approvedSeenTags[attributeKey],
        ...instanceSeenTags[attributeKey]
      };
      approvedSeenTags[attributeKey] = tagUnion;
    }
    return approvedTags;
  }, []).reverse();
};
var getAnyTrueFromPropsList = (propsList, checkedTag) => {
  if (Array.isArray(propsList) && propsList.length) {
    for (let index = 0; index < propsList.length; index += 1) {
      const prop = propsList[index];
      if (prop[checkedTag]) {
        return true;
      }
    }
  }
  return false;
};
var reducePropsToState = (propsList) => ({
  baseTag: getBaseTagFromPropsList([
    "href"
    /* HREF */
  ], propsList),
  bodyAttributes: getAttributesFromPropsList("bodyAttributes", propsList),
  defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
  encode: getInnermostProperty(propsList, HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),
  htmlAttributes: getAttributesFromPropsList("htmlAttributes", propsList),
  linkTags: getTagsFromPropsList(
    "link",
    [
      "rel",
      "href"
      /* HREF */
    ],
    propsList
  ),
  metaTags: getTagsFromPropsList(
    "meta",
    [
      "name",
      "charset",
      "http-equiv",
      "property",
      "itemprop"
      /* ITEM_PROP */
    ],
    propsList
  ),
  noscriptTags: getTagsFromPropsList("noscript", [
    "innerHTML"
    /* INNER_HTML */
  ], propsList),
  onChangeClientState: getOnChangeClientState(propsList),
  scriptTags: getTagsFromPropsList(
    "script",
    [
      "src",
      "innerHTML"
      /* INNER_HTML */
    ],
    propsList
  ),
  styleTags: getTagsFromPropsList("style", [
    "cssText"
    /* CSS_TEXT */
  ], propsList),
  title: getTitleFromPropsList(propsList),
  titleAttributes: getAttributesFromPropsList("titleAttributes", propsList),
  prioritizeSeoTags: getAnyTrueFromPropsList(propsList, HELMET_PROPS.PRIORITIZE_SEO_TAGS)
});
var flattenArray = (possibleArray) => Array.isArray(possibleArray) ? possibleArray.join("") : possibleArray;
var checkIfPropsMatch = (props, toMatch) => {
  const keys = Object.keys(props);
  for (let i = 0; i < keys.length; i += 1) {
    if (toMatch[keys[i]] && toMatch[keys[i]].includes(props[keys[i]])) {
      return true;
    }
  }
  return false;
};
var prioritizer = (elementsList, propsToMatch) => {
  if (Array.isArray(elementsList)) {
    return elementsList.reduce(
      (acc, elementAttrs) => {
        if (checkIfPropsMatch(elementAttrs, propsToMatch)) {
          acc.priority.push(elementAttrs);
        } else {
          acc.default.push(elementAttrs);
        }
        return acc;
      },
      { priority: [], default: [] }
    );
  }
  return { default: elementsList, priority: [] };
};
var without = (obj, key) => {
  return {
    ...obj,
    [key]: void 0
  };
};
var SELF_CLOSING_TAGS = [
  "noscript",
  "script",
  "style"
  /* STYLE */
];
var encodeSpecialCharacters = (str, encode = true) => {
  if (encode === false) {
    return String(str);
  }
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
var generateElementAttributesAsString = (attributes) => Object.keys(attributes).reduce((str, key) => {
  const attr = typeof attributes[key] !== "undefined" ? `${key}="${attributes[key]}"` : `${key}`;
  return str ? `${str} ${attr}` : attr;
}, "");
var generateTitleAsString = (type, title, attributes, encode) => {
  const attributeString = generateElementAttributesAsString(attributes);
  const flattenedTitle = flattenArray(title);
  return attributeString ? `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeString}>${encodeSpecialCharacters(
    flattenedTitle,
    encode
  )}</${type}>` : `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(
    flattenedTitle,
    encode
  )}</${type}>`;
};
var generateTagsAsString = (type, tags, encode = true) => tags.reduce((str, t) => {
  const tag = t;
  const attributeHtml = Object.keys(tag).filter(
    (attribute) => !(attribute === "innerHTML" || attribute === "cssText")
  ).reduce((string, attribute) => {
    const attr = typeof tag[attribute] === "undefined" ? attribute : `${attribute}="${encodeSpecialCharacters(tag[attribute], encode)}"`;
    return string ? `${string} ${attr}` : attr;
  }, "");
  const tagContent = tag.innerHTML || tag.cssText || "";
  const isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;
  return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${isSelfClosing ? `/>` : `>${tagContent}</${type}>`}`;
}, "");
var convertElementAttributesToReactProps = (attributes, initProps = {}) => Object.keys(attributes).reduce((obj, key) => {
  const mapped = REACT_TAG_MAP[key];
  obj[mapped || key] = attributes[key];
  return obj;
}, initProps);
var generateTitleAsReactComponent = (_type, title, attributes) => {
  const initProps = {
    key: title,
    [HELMET_ATTRIBUTE]: true
  };
  const props = convertElementAttributesToReactProps(attributes, initProps);
  return [React__default.createElement("title", props, title)];
};
var generateTagsAsReactComponent = (type, tags) => tags.map((tag, i) => {
  const mappedTag = {
    key: i,
    [HELMET_ATTRIBUTE]: true
  };
  Object.keys(tag).forEach((attribute) => {
    const mapped = REACT_TAG_MAP[attribute];
    const mappedAttribute = mapped || attribute;
    if (mappedAttribute === "innerHTML" || mappedAttribute === "cssText") {
      const content = tag.innerHTML || tag.cssText;
      mappedTag.dangerouslySetInnerHTML = { __html: content };
    } else {
      mappedTag[mappedAttribute] = tag[attribute];
    }
  });
  return React__default.createElement(type, mappedTag);
});
var getMethodsForTag = (type, tags, encode = true) => {
  switch (type) {
    case "title":
      return {
        toComponent: () => generateTitleAsReactComponent(type, tags.title, tags.titleAttributes),
        toString: () => generateTitleAsString(type, tags.title, tags.titleAttributes, encode)
      };
    case "bodyAttributes":
    case "htmlAttributes":
      return {
        toComponent: () => convertElementAttributesToReactProps(tags),
        toString: () => generateElementAttributesAsString(tags)
      };
    default:
      return {
        toComponent: () => generateTagsAsReactComponent(type, tags),
        toString: () => generateTagsAsString(type, tags, encode)
      };
  }
};
var getPriorityMethods = ({ metaTags, linkTags, scriptTags, encode }) => {
  const meta = prioritizer(metaTags, SEO_PRIORITY_TAGS.meta);
  const link = prioritizer(linkTags, SEO_PRIORITY_TAGS.link);
  const script = prioritizer(scriptTags, SEO_PRIORITY_TAGS.script);
  const priorityMethods = {
    toComponent: () => [
      ...generateTagsAsReactComponent("meta", meta.priority),
      ...generateTagsAsReactComponent("link", link.priority),
      ...generateTagsAsReactComponent("script", script.priority)
    ],
    toString: () => (
      // generate all the tags as strings and concatenate them
      `${getMethodsForTag("meta", meta.priority, encode)} ${getMethodsForTag(
        "link",
        link.priority,
        encode
      )} ${getMethodsForTag("script", script.priority, encode)}`
    )
  };
  return {
    priorityMethods,
    metaTags: meta.default,
    linkTags: link.default,
    scriptTags: script.default
  };
};
var mapStateOnServer = (props) => {
  const {
    baseTag,
    bodyAttributes,
    encode = true,
    htmlAttributes,
    noscriptTags,
    styleTags,
    title = "",
    titleAttributes,
    prioritizeSeoTags
  } = props;
  let { linkTags, metaTags, scriptTags } = props;
  let priorityMethods = {
    toComponent: () => {
    },
    toString: () => ""
  };
  if (prioritizeSeoTags) {
    ({ priorityMethods, linkTags, metaTags, scriptTags } = getPriorityMethods(props));
  }
  return {
    priority: priorityMethods,
    base: getMethodsForTag("base", baseTag, encode),
    bodyAttributes: getMethodsForTag("bodyAttributes", bodyAttributes, encode),
    htmlAttributes: getMethodsForTag("htmlAttributes", htmlAttributes, encode),
    link: getMethodsForTag("link", linkTags, encode),
    meta: getMethodsForTag("meta", metaTags, encode),
    noscript: getMethodsForTag("noscript", noscriptTags, encode),
    script: getMethodsForTag("script", scriptTags, encode),
    style: getMethodsForTag("style", styleTags, encode),
    title: getMethodsForTag("title", { title, titleAttributes }, encode)
  };
};
var server_default = mapStateOnServer;
var instances = [];
var isDocument = !!(typeof window !== "undefined" && window.document && window.document.createElement);
var HelmetData = class {
  constructor(context, canUseDOM) {
    __publicField(this, "instances", []);
    __publicField(this, "canUseDOM", isDocument);
    __publicField(this, "context");
    __publicField(this, "value", {
      setHelmet: (serverState) => {
        this.context.helmet = serverState;
      },
      helmetInstances: {
        get: () => this.canUseDOM ? instances : this.instances,
        add: (instance) => {
          (this.canUseDOM ? instances : this.instances).push(instance);
        },
        remove: (instance) => {
          const index = (this.canUseDOM ? instances : this.instances).indexOf(instance);
          (this.canUseDOM ? instances : this.instances).splice(index, 1);
        }
      }
    });
    this.context = context;
    this.canUseDOM = canUseDOM || false;
    if (!canUseDOM) {
      context.helmet = server_default({
        baseTag: [],
        bodyAttributes: {},
        htmlAttributes: {},
        linkTags: [],
        metaTags: [],
        noscriptTags: [],
        scriptTags: [],
        styleTags: [],
        title: "",
        titleAttributes: {}
      });
    }
  }
};
var defaultValue = {};
var Context = React__default.createContext(defaultValue);
var HelmetProvider = (_a = class extends Component {
  constructor(props) {
    super(props);
    __publicField(this, "helmetData");
    this.helmetData = new HelmetData(this.props.context || {}, _a.canUseDOM);
  }
  render() {
    return /* @__PURE__ */ React__default.createElement(Context.Provider, { value: this.helmetData.value }, this.props.children);
  }
}, __publicField(_a, "canUseDOM", isDocument), _a);
var updateTags = (type, tags) => {
  const headElement = document.head || document.querySelector(
    "head"
    /* HEAD */
  );
  const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
  const oldTags = [].slice.call(tagNodes);
  const newTags = [];
  let indexToDelete;
  if (tags && tags.length) {
    tags.forEach((tag) => {
      const newElement = document.createElement(type);
      for (const attribute in tag) {
        if (Object.prototype.hasOwnProperty.call(tag, attribute)) {
          if (attribute === "innerHTML") {
            newElement.innerHTML = tag.innerHTML;
          } else if (attribute === "cssText") {
            if (newElement.styleSheet) {
              newElement.styleSheet.cssText = tag.cssText;
            } else {
              newElement.appendChild(document.createTextNode(tag.cssText));
            }
          } else {
            const attr = attribute;
            const value = typeof tag[attr] === "undefined" ? "" : tag[attr];
            newElement.setAttribute(attribute, value);
          }
        }
      }
      newElement.setAttribute(HELMET_ATTRIBUTE, "true");
      if (oldTags.some((existingTag, index) => {
        indexToDelete = index;
        return newElement.isEqualNode(existingTag);
      })) {
        oldTags.splice(indexToDelete, 1);
      } else {
        newTags.push(newElement);
      }
    });
  }
  oldTags.forEach((tag) => {
    var _a2;
    return (_a2 = tag.parentNode) == null ? void 0 : _a2.removeChild(tag);
  });
  newTags.forEach((tag) => headElement.appendChild(tag));
  return {
    oldTags,
    newTags
  };
};
var updateAttributes = (tagName, attributes) => {
  const elementTag = document.getElementsByTagName(tagName)[0];
  if (!elementTag) {
    return;
  }
  const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
  const helmetAttributes = helmetAttributeString ? helmetAttributeString.split(",") : [];
  const attributesToRemove = [...helmetAttributes];
  const attributeKeys = Object.keys(attributes);
  for (const attribute of attributeKeys) {
    const value = attributes[attribute] || "";
    if (elementTag.getAttribute(attribute) !== value) {
      elementTag.setAttribute(attribute, value);
    }
    if (helmetAttributes.indexOf(attribute) === -1) {
      helmetAttributes.push(attribute);
    }
    const indexToSave = attributesToRemove.indexOf(attribute);
    if (indexToSave !== -1) {
      attributesToRemove.splice(indexToSave, 1);
    }
  }
  for (let i = attributesToRemove.length - 1; i >= 0; i -= 1) {
    elementTag.removeAttribute(attributesToRemove[i]);
  }
  if (helmetAttributes.length === attributesToRemove.length) {
    elementTag.removeAttribute(HELMET_ATTRIBUTE);
  } else if (elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(",")) {
    elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(","));
  }
};
var updateTitle = (title, attributes) => {
  if (typeof title !== "undefined" && document.title !== title) {
    document.title = flattenArray(title);
  }
  updateAttributes("title", attributes);
};
var commitTagChanges = (newState, cb) => {
  const {
    baseTag,
    bodyAttributes,
    htmlAttributes,
    linkTags,
    metaTags,
    noscriptTags,
    onChangeClientState,
    scriptTags,
    styleTags,
    title,
    titleAttributes
  } = newState;
  updateAttributes("body", bodyAttributes);
  updateAttributes("html", htmlAttributes);
  updateTitle(title, titleAttributes);
  const tagUpdates = {
    baseTag: updateTags("base", baseTag),
    linkTags: updateTags("link", linkTags),
    metaTags: updateTags("meta", metaTags),
    noscriptTags: updateTags("noscript", noscriptTags),
    scriptTags: updateTags("script", scriptTags),
    styleTags: updateTags("style", styleTags)
  };
  const addedTags = {};
  const removedTags = {};
  Object.keys(tagUpdates).forEach((tagType) => {
    const { newTags, oldTags } = tagUpdates[tagType];
    if (newTags.length) {
      addedTags[tagType] = newTags;
    }
    if (oldTags.length) {
      removedTags[tagType] = tagUpdates[tagType].oldTags;
    }
  });
  if (cb) {
    cb();
  }
  onChangeClientState(newState, addedTags, removedTags);
};
var _helmetCallback = null;
var handleStateChangeOnClient = (newState) => {
  if (_helmetCallback) {
    cancelAnimationFrame(_helmetCallback);
  }
  if (newState.defer) {
    _helmetCallback = requestAnimationFrame(() => {
      commitTagChanges(newState, () => {
        _helmetCallback = null;
      });
    });
  } else {
    commitTagChanges(newState);
    _helmetCallback = null;
  }
};
var client_default = handleStateChangeOnClient;
var HelmetDispatcher = class extends Component {
  constructor() {
    super(...arguments);
    __publicField(this, "rendered", false);
  }
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(nextProps, this.props);
  }
  componentDidUpdate() {
    this.emitChange();
  }
  componentWillUnmount() {
    const { helmetInstances } = this.props.context;
    helmetInstances.remove(this);
    this.emitChange();
  }
  emitChange() {
    const { helmetInstances, setHelmet } = this.props.context;
    let serverState = null;
    const state = reducePropsToState(
      helmetInstances.get().map((instance) => {
        const props = { ...instance.props };
        delete props.context;
        return props;
      })
    );
    if (HelmetProvider.canUseDOM) {
      client_default(state);
    } else if (server_default) {
      serverState = server_default(state);
    }
    setHelmet(serverState);
  }
  // componentWillMount will be deprecated
  // for SSR, initialize on first render
  // constructor is also unsafe in StrictMode
  init() {
    if (this.rendered) {
      return;
    }
    this.rendered = true;
    const { helmetInstances } = this.props.context;
    helmetInstances.add(this);
    this.emitChange();
  }
  render() {
    this.init();
    return null;
  }
};
var Helmet = (_b = class extends Component {
  shouldComponentUpdate(nextProps) {
    return !fastCompare(without(this.props, "helmetData"), without(nextProps, "helmetData"));
  }
  mapNestedChildrenToProps(child, nestedChildren) {
    if (!nestedChildren) {
      return null;
    }
    switch (child.type) {
      case "script":
      case "noscript":
        return {
          innerHTML: nestedChildren
        };
      case "style":
        return {
          cssText: nestedChildren
        };
      default:
        throw new Error(
          `<${child.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`
        );
    }
  }
  flattenArrayTypeChildren(child, arrayTypeChildren, newChildProps, nestedChildren) {
    return {
      ...arrayTypeChildren,
      [child.type]: [
        ...arrayTypeChildren[child.type] || [],
        {
          ...newChildProps,
          ...this.mapNestedChildrenToProps(child, nestedChildren)
        }
      ]
    };
  }
  mapObjectTypeChildren(child, newProps, newChildProps, nestedChildren) {
    switch (child.type) {
      case "title":
        return {
          ...newProps,
          [child.type]: nestedChildren,
          titleAttributes: { ...newChildProps }
        };
      case "body":
        return {
          ...newProps,
          bodyAttributes: { ...newChildProps }
        };
      case "html":
        return {
          ...newProps,
          htmlAttributes: { ...newChildProps }
        };
      default:
        return {
          ...newProps,
          [child.type]: { ...newChildProps }
        };
    }
  }
  mapArrayTypeChildrenToProps(arrayTypeChildren, newProps) {
    let newFlattenedProps = { ...newProps };
    Object.keys(arrayTypeChildren).forEach((arrayChildName) => {
      newFlattenedProps = {
        ...newFlattenedProps,
        [arrayChildName]: arrayTypeChildren[arrayChildName]
      };
    });
    return newFlattenedProps;
  }
  warnOnInvalidChildren(child, nestedChildren) {
    invariant(
      VALID_TAG_NAMES.some((name) => child.type === name),
      typeof child.type === "function" ? `You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.` : `Only elements types ${VALID_TAG_NAMES.join(
        ", "
      )} are allowed. Helmet does not support rendering <${child.type}> elements. Refer to our API for more information.`
    );
    invariant(
      !nestedChildren || typeof nestedChildren === "string" || Array.isArray(nestedChildren) && !nestedChildren.some((nestedChild) => typeof nestedChild !== "string"),
      `Helmet expects a string as a child of <${child.type}>. Did you forget to wrap your children in braces? ( <${child.type}>{\`\`}</${child.type}> ) Refer to our API for more information.`
    );
    return true;
  }
  mapChildrenToProps(children, newProps) {
    let arrayTypeChildren = {};
    React__default.Children.forEach(children, (child) => {
      if (!child || !child.props) {
        return;
      }
      const { children: nestedChildren, ...childProps } = child.props;
      const newChildProps = Object.keys(childProps).reduce((obj, key) => {
        obj[HTML_TAG_MAP[key] || key] = childProps[key];
        return obj;
      }, {});
      let { type } = child;
      if (typeof type === "symbol") {
        type = type.toString();
      } else {
        this.warnOnInvalidChildren(child, nestedChildren);
      }
      switch (type) {
        case "Symbol(react.fragment)":
          newProps = this.mapChildrenToProps(nestedChildren, newProps);
          break;
        case "link":
        case "meta":
        case "noscript":
        case "script":
        case "style":
          arrayTypeChildren = this.flattenArrayTypeChildren(
            child,
            arrayTypeChildren,
            newChildProps,
            nestedChildren
          );
          break;
        default:
          newProps = this.mapObjectTypeChildren(child, newProps, newChildProps, nestedChildren);
          break;
      }
    });
    return this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
  }
  render() {
    const { children, ...props } = this.props;
    let newProps = { ...props };
    let { helmetData } = props;
    if (children) {
      newProps = this.mapChildrenToProps(children, newProps);
    }
    if (helmetData && !(helmetData instanceof HelmetData)) {
      const data = helmetData;
      helmetData = new HelmetData(data.context, true);
      delete newProps.helmetData;
    }
    return helmetData ? /* @__PURE__ */ React__default.createElement(HelmetDispatcher, { ...newProps, context: helmetData.value }) : /* @__PURE__ */ React__default.createElement(Context.Consumer, null, (context) => /* @__PURE__ */ React__default.createElement(HelmetDispatcher, { ...newProps, context }));
  }
}, __publicField(_b, "defaultProps", {
  defer: true,
  encodeSpecialCharacters: true,
  prioritizeSeoTags: false
}), _b);
const pkg = { Helmet, HelmetProvider };
const HeaderContentContext = createContext({ initialData: {} });
const HeaderContentProvider = ({ children, initialData }) => {
  return /* @__PURE__ */ jsx(HeaderContentContext.Provider, { value: { initialData }, children });
};
const useHeaderContent = () => useContext(HeaderContentContext);
const TimeContext = createContext({ initialData: null });
const TimeProvider = ({ children, initialData }) => {
  return /* @__PURE__ */ jsx(TimeContext.Provider, { value: { initialData }, children });
};
const useTime = () => useContext(TimeContext);
export {
  AuthProvider as A,
  updateUserStatus as B,
  ContentProvider as C,
  registerUser as D,
  updateInfoUser as E,
  changePassword as F,
  deleteProfilePicture as G,
  HeaderContentProvider as H,
  useContent as I,
  useTime as J,
  getCategoryWithFields as K,
  Helmet as L,
  NotificationProvider as N,
  ProtectedRoute as P,
  RouteProvider as R,
  TimeProvider as T,
  adminRoutes as a,
  TaxonomyProvider as b,
  useTaxonomies as c,
  useHeaderContent as d,
  useAuth as e,
  logout as f,
  getDataDetailUser as g,
  getUserProfilePicture as h,
  useNotification as i,
  apiClient as j,
  getAllLocationByType as k,
  login as l,
  getAllCategory as m,
  editCategory as n,
  createCategory as o,
  pkg as p,
  getCategoryDescByLocation as q,
  getCategoryByID as r,
  deleteCategory as s,
  createLocation as t,
  useRoute as u,
  editLocation as v,
  getLocationByID as w,
  deleteLocation as x,
  getLocationsByParentID as y,
  getAllUser as z
};

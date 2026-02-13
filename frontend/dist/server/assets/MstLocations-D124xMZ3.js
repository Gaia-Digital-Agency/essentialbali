import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { S as SvgDownload } from "./download-DnjrKIYZ.js";
import { u as useAutoDismiss } from "./useTimedMessage-Dt1cSUu_.js";
import { S as Select } from "./Select-BNFsiCfR.js";
import { c as useTaxonomies, t as createLocation, v as editLocation, w as getLocationByID, x as deleteLocation } from "./TimeContext-B5j8j_GZ.js";
import { t as toSlug } from "./slugify-Cun7DOoN.js";
import { u as useModal } from "./useModal-C9BZm3Uo.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import { M as ModalTimezoneTable, g as getTimezones } from "./ModalTimezoneTable-CguQiHA-.js";
import { u as useNavigationPrompt } from "./useNavigationPrompt-DiFBqK8C.js";
import { A as AdminFeaturedImage } from "./FeaturedImage-756EfM0U.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { d as deleteTemplate } from "./template.service-BkOXTsSh.js";
import "react-router";
import "tailwind-merge";
import "clsx";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "slugify";
import "./index-CqfhKOI8.js";
import "react-router-dom";
import "./media.service-Bg8ZwuBl.js";
import "./MediaForm-pn_2Hilv.js";
import "react-dropzone";
import "lucide-react";
const API_URL = "http://34.124.244.233/essentialbali";
const parentMap = {
  country: null,
  // country nggak punya parent
  city: "country",
  region: "city"
};
function FormLocations({
  selectedLocations,
  onRefresh
}) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [idToEdit, setIdToEdit] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [slug, setSlug] = useState("");
  const [typeLocation, setTypeLocation] = useState("");
  const [optParentLocation, setOptParentLocation] = useState([]);
  const [parentLocation, setParentLocation] = useState();
  const [timezone, setTimezone] = useState("");
  const [vaDataTimezone, setDataTimezone] = useState(
    []
  );
  const [vaDataOptTimezone, setDataOptTimezone] = useState([]);
  const [featuredImage, setFeaturedImage] = useState();
  const [flagIcon, setFlagIcon] = useState();
  const { closeModal, openModal } = useModal(false);
  const { setBlock } = useNavigationPrompt();
  const { adminTaxonomies } = useTaxonomies();
  const PLURAL_TAXONOMY_NAME = {
    country: "countries",
    city: "cities",
    region: "regions"
  };
  const {
    isOpen: isOpenModalTimezone,
    openModal: openModalTimezone,
    closeModal: closeModalTimezone
  } = useModal();
  const optTypeLocation = [
    { key: "country", value: "country", label: "Area" },
    { key: "city", value: "city", label: "Sub Area (City)" },
    { key: "region", value: "region", label: "Sub Area (Region)" }
  ];
  const handleTypeLocation = (value) => {
    setTypeLocation(`${value}`);
  };
  const handleParentLocation = (value) => {
    setParentLocation(Number(value));
  };
  const handleOptTimezone = (value) => {
    setTimezone(String(value));
  };
  const showModalTimezone = () => {
    openModalTimezone();
  };
  useEffect(() => {
    const fetchDataTimezone = async () => {
      try {
        const vaData = await getTimezones();
        const vaTimezones = vaData.data;
        const begin = { key: 0, value: 0, label: "Select Timezone" };
        const optDataTimezone = (vaTimezones == null ? void 0 : vaTimezones.map((timezone2) => ({
          key: timezone2.id,
          value: timezone2.timezone_name,
          label: timezone2.timezone_name + " - [" + timezone2.utc_offset + "]"
        }))) ?? [];
        setDataOptTimezone([begin, ...optDataTimezone]);
        setDataTimezone(vaTimezones);
      } catch (error2) {
        console.error(error2);
      }
    };
    fetchDataTimezone();
  }, []);
  useEffect(() => {
    const fetchParentOptions = async () => {
      var _a;
      try {
        const parentType = parentMap[typeLocation];
        const data = (_a = adminTaxonomies == null ? void 0 : adminTaxonomies[PLURAL_TAXONOMY_NAME[parentType]]) == null ? void 0 : _a.map((coun) => ({
          key: coun.id,
          value: coun.id,
          label: coun.name
        }));
        setOptParentLocation(data ?? []);
      } catch (err) {
        console.error("Failed to fetch parent locations:", err);
        setOptParentLocation([]);
      }
    };
    fetchParentOptions();
  }, [typeLocation]);
  useEffect(() => {
    if (selectedLocations) {
      const vaData = selectedLocations;
      setIdToEdit(vaData.id ?? 0);
      setParentLocation(vaData.id_parent ?? 0);
      setLocationName(vaData.name ?? "");
      setTypeLocation(vaData.typeLoc ?? "");
      setSlug(vaData.slug ?? "");
      setFeaturedImage({ id: vaData.site_logo_id, url: `${API_URL}/${vaData.site_logo}` });
      setFlagIcon({ id: vaData.flag_icon_id, url: `${API_URL}/${vaData.flag_icon}` });
      setTimezone(vaData.timezone ?? "");
      setIsEdit(true);
    }
  }, [selectedLocations]);
  useAutoDismiss(success, setSuccess);
  useAutoDismiss(error, setError);
  const initForm = () => {
    setLocationName("");
    setSlug("");
    setTimezone("");
    setFeaturedImage({ url: "", id: void 0 });
    setFlagIcon({ url: "", id: void 0 });
  };
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    const vaData = {
      id_parent: parentLocation,
      name: locationName,
      slug: toSlug(slug),
      timezone,
      site_logo: featuredImage == null ? void 0 : featuredImage.id,
      flag_icon: flagIcon == null ? void 0 : flagIcon.id
    };
    try {
      if (!isEdit) {
        if (!typeLocation) {
          setError("Please select type location");
          return;
        }
        await createLocation(typeLocation, vaData);
        setSuccess(locationName + " is Created Successfully");
      } else {
        await editLocation(idToEdit, typeLocation, vaData);
        setSuccess(locationName + " is Edited Successfully");
      }
      initForm();
      onRefresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setError(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
    }
  };
  const handleNameChange = (e) => {
    const cName = e.target.value;
    const cSlug = isEdit ? slug : toSlug(cName);
    setLocationName(e.target.value);
    setSlug(cSlug);
  };
  const InputWrapper = ({
    label,
    children
  }) => {
    return /* @__PURE__ */ jsxs("div", { className: "input-wrapper", children: [
      /* @__PURE__ */ jsx(Label, { children: label }),
      children
    ] });
  };
  const featuredImageHandler = (file) => {
    setFeaturedImage({ url: `${API_URL}/${file.path}`, id: file.id });
    closeModal();
    setBlock(true);
  };
  const flagIconHandler = (file) => {
    setFlagIcon({ url: `${API_URL}/${file.path}`, id: file.id });
    closeModal();
    setBlock(true);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(ComponentCard, { title: "Area Form", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-5", children: error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }),
      /* @__PURE__ */ jsx("div", { className: "mb-5", children: success && /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Success", message: success }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 space-x-6 grid grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Area Type" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                options: optTypeLocation,
                value: typeLocation,
                placeholder: "Select area type",
                onChange: handleTypeLocation,
                className: "dark:bg-dark-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Parent" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                options: optParentLocation ?? [],
                placeholder: "Select Parent",
                value: parentLocation,
                onChange: handleParentLocation,
                className: "dark:bg-dark-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "cName", children: "Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              id: "cName",
              onChange: handleNameChange,
              value: locationName,
              placeholder: "Seminyak"
            }
          )
        ] }),
        typeLocation === "country" && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            /* @__PURE__ */ jsx("span", { className: "mr-2", children: "Time Zone" }),
            /* @__PURE__ */ jsx(Badge, { color: "info", onClick: showModalTimezone, children: "?" })
          ] }),
          /* @__PURE__ */ jsx(
            Select,
            {
              options: vaDataOptTimezone,
              value: timezone,
              placeholder: "Select Timezone...",
              onChange: handleOptTimezone,
              className: "dark:bg-dark-900"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "cSlug", children: "Slug" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              id: "cSlug",
              onChange: (e) => setSlug(e.target.value),
              value: slug,
              placeholder: "seminyak"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-50 h-50", children: /* @__PURE__ */ jsx(InputWrapper, { label: "Site Logo", children: /* @__PURE__ */ jsx(
          AdminFeaturedImage,
          {
            url: (featuredImage == null ? void 0 : featuredImage.url) ? `${featuredImage == null ? void 0 : featuredImage.url}` : "#",
            onClick: openModal,
            onSave: featuredImageHandler
          }
        ) }) }),
        typeLocation === "country" && /* @__PURE__ */ jsx("div", { className: "w-50 h-50", children: /* @__PURE__ */ jsx(InputWrapper, { label: "Flag Icon", children: /* @__PURE__ */ jsx(
          AdminFeaturedImage,
          {
            url: (flagIcon == null ? void 0 : flagIcon.url) ? `${flagIcon == null ? void 0 : flagIcon.url}` : "#",
            onClick: openModal,
            onSave: flagIconHandler
          }
        ) }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6 space-x-6 flex justify-end", children: /* @__PURE__ */ jsx(
          Button,
          {
            startIcon: /* @__PURE__ */ jsx(SvgDownload, { className: "size-5" }),
            className: "w-1/4",
            children: "Save"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ModalTimezoneTable,
      {
        isOpen: isOpenModalTimezone,
        onCLose: closeModalTimezone,
        timezonesData: vaDataTimezone
      }
    )
  ] });
}
function TableLocations({
  onEditLocation,
  onRefresh,
  refreshKey
}) {
  const [locType, setLocType] = useState("");
  const [dataLocation, setDataLocation] = useState([]);
  const { adminTaxonomies, generateUrlLocations } = useTaxonomies();
  const PLURAL_TAXONOMY_NAME = {
    country: "countries",
    city: "cities",
    region: "regions"
  };
  const optTypeLocation = [
    { key: "country", value: "country", label: "Area" },
    { key: "city", value: "city", label: "Sub Area (City)" },
    { key: "region", value: "region", label: "Sub Area (Region)" }
  ];
  const handleTypeLocation = (value) => {
    setLocType(String(value));
  };
  const handleEditButtonClick = async (type, id) => {
    const vaData = await getLocationByID(type, id);
    if (id === 999) {
      withReactContent(Swal).fire({
        title: "Oops",
        text: "This is a default location, you can't edit it",
        icon: "info"
      });
    } else {
      onEditLocation(vaData.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleDeleteButtonClick = async (id, locType2) => {
    try {
      await deleteLocation(id, locType2);
      await deleteTemplate(
        `/${generateUrlLocations(id, locType2)}`
      );
      onRefresh();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const showSwal = (tagTitle, id) => {
    withReactContent(Swal).fire({
      title: `Are you sure to Delete ${tagTitle}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        const doHandle = await handleDeleteButtonClick(id, locType);
        if (doHandle) {
          withReactContent(Swal).fire({
            title: "Deleted!",
            text: "Tag has been deleted.",
            icon: "success"
          });
        } else {
          withReactContent(Swal).fire({
            title: "Warning",
            text: "Sorry, you can not delete this data",
            icon: "warning"
          });
        }
      }
    });
  };
  useEffect(() => {
    const getDataLocations = async () => {
      if (!locType) setLocType("country");
      setDataLocation(
        adminTaxonomies[PLURAL_TAXONOMY_NAME[locType]] ?? []
      );
    };
    getDataLocations();
  }, [locType, refreshKey]);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(ComponentCard, { title: "Bali Areas", children: [
    /* @__PURE__ */ jsx("div", { className: "space-y-3 space-x-6 grid grid-cols-2", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Area Type" }),
      /* @__PURE__ */ jsx(
        Select,
        {
          options: optTypeLocation,
          placeholder: "Filter area type...",
          onChange: handleTypeLocation,
          className: "dark:bg-dark-900"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]", children: /* @__PURE__ */ jsx("div", { className: "max-w-full overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { className: "border-b border-l-amber-800 dark:border-white/[0.05]", children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[10px]",
            children: "#"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[10px]",
            children: "Name"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Parent"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Slug"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Edit?"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Delete"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { className: "divide-y divide-gray-100 dark:divide-white/[0.05]", children: dataLocation == null ? void 0 : dataLocation.map((loc, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: index + 1 }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: loc.name }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: loc.name_parent ? loc.name_parent : "-" }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: loc.slug ? loc.slug : "-" }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => handleEditButtonClick(locType, loc.id),
            size: "sm",
            className: "bg-green-600 hover:bg-green-700",
            children: "Edit"
          }
        ) }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => showSwal(loc.name, loc.id),
            size: "sm",
            className: "bg-red-400 hover:bg-red-700",
            children: "Delete"
          }
        ) })
      ] }, loc.id)) })
    ] }) }) })
  ] }) });
}
function MstLocations() {
  const [selectedLocations, setSelectedLocations] = useState();
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | Bali Areas",
        description: "Manage Bali areas and their CMS pages."
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Bali Areas" }),
      /* @__PURE__ */ jsx(
        FormLocations,
        {
          selectedLocations,
          onRefresh: handleRefresh
        }
      ),
      /* @__PURE__ */ jsx(
        TableLocations,
        {
          onEditLocation: setSelectedLocations,
          refreshKey,
          onRefresh: handleRefresh
        }
      )
    ] }) })
  ] });
}
export {
  MstLocations as default
};

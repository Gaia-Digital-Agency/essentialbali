import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { u as useModal } from "./useModal-C9BZm3Uo.js";
import { M as Modal } from "./index-CqfhKOI8.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { useState, useEffect } from "react";
import { g as getDataDetailUser, h as getUserProfilePicture, E as updateInfoUser, F as changePassword, G as deleteProfilePicture } from "./TimeContext-B5j8j_GZ.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { F as FileInput } from "./FileInput-BU42CnHt.js";
import Swal from "sweetalert2";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import "react-router";
import "tailwind-merge";
import "clsx";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isOpenModalChangePassword,
    openModal: openModalChangePassword,
    closeModal: closeModalChangePassword
  } = useModal();
  const {
    isOpen: isOpenConfirmationModal,
    openModal: openConfirmationModal,
    closeModal: closeConfirmationModal
  } = useModal();
  const {
    isOpen: isOpenProfilePicFullModal,
    openModal: openProfilePicFullModal,
    closeModal: closeProfilePicFullModal
  } = useModal();
  const [error, setError] = useState("");
  const [myName, setMyName] = useState("");
  const [myNameForm, setMyNameForm] = useState("");
  const [myEmail, setMyEmail] = useState("");
  const [myEmailForm, setMyEmailForm] = useState("");
  const [myCity, setMyCity] = useState("");
  const [myCountry, setMyCountry] = useState("");
  const [myRole, setMyRole] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [myProfilePicture, setMyProfilePicture] = useState("");
  const [uplProfilePicture, setUplProfilePicture] = useState(null);
  const [isErrorEmail, setIsErrorEmail] = useState(false);
  const [errMessageEmail, setErrMessageEmail] = useState("");
  const validateEmail = (value) => {
    const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setIsErrorEmail(false);
    setErrMessageEmail("");
    if (!isValidEmail) {
      setIsErrorEmail(true);
      setErrMessageEmail("Please input a valid email address");
    }
    return isValidEmail;
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setMyEmailForm(value);
    validateEmail(value);
  };
  const handleFileChange = (event) => {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (file) {
      setUplProfilePicture(file);
    }
  };
  const token = localStorage.getItem("authToken");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vaData = await getDataDetailUser();
        if (vaData) {
          setMyName(vaData.data[0].name ?? "");
          setMyEmail(vaData.data[0].email ?? "");
          setMyCountry(vaData.data[0].name_country ?? "");
          setMyCity(vaData.data[0].name_city ?? "");
          setMyRole(vaData.data[0].user_level ?? "");
        } else {
          setMyName("");
          setMyEmail("");
          setMyCountry("");
          setMyCity("");
          setMyRole("");
        }
      } catch (error2) {
        console.error("Error decoding token:", error2);
      }
    };
    fetchData();
  }, [token]);
  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const url = await getUserProfilePicture();
        setMyProfilePicture(url);
      } catch (err) {
        console.error(err);
      }
    };
    loadProfilePicture();
    return () => {
      if (myProfilePicture) URL.revokeObjectURL(myProfilePicture);
    };
  }, []);
  const handleSubmitEditProfile = async (e) => {
    var _a, _b;
    e.preventDefault();
    try {
      const vaData = {
        name: myNameForm || myName,
        email: myEmailForm || myEmail,
        profile_picture: uplProfilePicture
      };
      const formattedVaData = {
        ...vaData,
        profile_picture: vaData.profile_picture === null ? void 0 : vaData.profile_picture
      };
      await updateInfoUser(formattedVaData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setError(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
      console.error(error);
    }
    closeModal();
    window.location.reload();
  };
  const handleSubmitChangePassword = async (e) => {
    var _a, _b;
    e.preventDefault();
    try {
      const vaData = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword
      };
      let errMsg = "";
      if (!currentPassword) {
        errMsg = "Please Input Your Current Password!";
        new Error();
        throw Error(errMsg);
      }
      const response = await changePassword(vaData);
      return response;
    } catch (err) {
      closeConfirmationModal();
      if (err instanceof Error) {
        setError(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setError(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
      console.error(error);
    }
  };
  const removeProfilePicture = async () => {
    closeProfilePicFullModal();
    Swal.fire({
      title: "Are you sure to Remove you Profile Picture?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteProfilePicture();
        window.location.reload();
      } else {
        openProfilePicFullModal();
      }
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center w-full gap-6 xl:flex-row", children: [
        myProfilePicture ? /* @__PURE__ */ jsx("div", { className: "w-24 h-24 overflow-hidden rounded-full xl:order-1 bg-amber-400", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: myProfilePicture,
            alt: "Avatar",
            className: "w-full h-full object-cover hover:cursor-pointer",
            onClick: openProfilePicFullModal
          }
        ) }) : /* @__PURE__ */ jsx("div", { className: "text-6xl text-white w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex justify-center align-middle items-center bg-blue-400", children: /* @__PURE__ */ jsx("h1", { children: myName.charAt(0).toUpperCase() }) }),
        /* @__PURE__ */ jsxs("div", { className: "order-3 xl:order-2", children: [
          /* @__PURE__ */ jsx("h4", { className: "mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left", children: myName }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left", children: [
            /* @__PURE__ */ jsx("div", { className: "hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
              myCity,
              ", ",
              myCountry
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: openModalChangePassword,
          className: "flex\n            w-full\n            items-center\n            justify-center\n            gap-2\n            rounded-full\n            border\n            border-orange-300\n            bg-orange-500\n            px-4\n            py-3\n            text-sm\n            font-medium\n            text-orange-100\n            shadow-theme-xs\n            hover:bg-orange-600\n            hover:text-orange-200\n            dark:border-gray-700\n            dark:bg-gray-800\n            dark:text-gray-400\n            dark:hover:bg-white/[0.03]\n            dark:hover:text-gray-200\n            lg:inline-flex\n            lg:w-auto",
          children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "fill-current",
                width: "18",
                height: "18",
                viewBox: "0 0 18 18",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    d: "M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z",
                    fill: ""
                  }
                )
              }
            ),
            "Change Password"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6", children: "Personal Information" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400", children: "Your Name" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-800 dark:text-white/90", children: myName })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400", children: "Email address" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-800 dark:text-white/90", children: myEmail })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400", children: "Your Role" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-800 dark:text-white/90", children: myRole })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openModal,
            className: "flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto",
            children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "fill-current",
                  width: "18",
                  height: "18",
                  viewBox: "0 0 18 18",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      fillRule: "evenodd",
                      clipRule: "evenodd",
                      d: "M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z",
                      fill: ""
                    }
                  )
                }
              ),
              "Edit"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Modal,
        {
          isOpen,
          onClose: closeModal,
          className: "max-w-[700px] m-4",
          children: /* @__PURE__ */ jsxs("div", { className: "no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11", children: [
            /* @__PURE__ */ jsxs("div", { className: "px-2 pr-14", children: [
              /* @__PURE__ */ jsx("h4", { className: "mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90", children: "Edit Personal Information" }),
              /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7", children: "Update your details to keep your profile up-to-date." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mb-5", children: error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }),
            /* @__PURE__ */ jsxs("form", { className: "flex flex-col", onSubmit: handleSubmitEditProfile, children: [
              /* @__PURE__ */ jsx("div", { className: "custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3", children: /* @__PURE__ */ jsxs("div", { className: "mt-7", children: [
                /* @__PURE__ */ jsx("h5", { className: "mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6", children: "Personal Information" }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "col-span-1", children: [
                    /* @__PURE__ */ jsx(Label, { children: "Your Name" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "text",
                        placeholder: myName,
                        onChange: (e) => setMyNameForm(e.target.value)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "", children: [
                    /* @__PURE__ */ jsx(Label, { children: "Email Address" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "email",
                        placeholder: myEmail,
                        onChange: handleEmailChange,
                        error: isErrorEmail,
                        hint: isErrorEmail ? errMessageEmail : ""
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { children: "Photo Profile" }),
                    /* @__PURE__ */ jsx(
                      FileInput,
                      {
                        onChange: handleFileChange,
                        className: "custom-class"
                      }
                    )
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-2 mt-6 lg:justify-end", children: [
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Close" }),
                /* @__PURE__ */ jsx(Button, { size: "sm", children: "Save Changes" })
              ] })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        Modal,
        {
          isOpen: isOpenModalChangePassword,
          onClose: closeModalChangePassword,
          className: "max-w-[700px] m-4",
          children: /* @__PURE__ */ jsxs("div", { className: "no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11", children: [
            /* @__PURE__ */ jsxs("div", { className: "px-2 pr-14", children: [
              /* @__PURE__ */ jsx("h4", { className: "mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90", children: "Change Password" }),
              /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7", children: "Update your password to keep your profile secure." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3", children: /* @__PURE__ */ jsxs("div", { className: "mt-7", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-5", children: error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
                /* @__PURE__ */ jsxs("div", { className: "col-span-1", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Current Password" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "password",
                      value: currentPassword,
                      onChange: (e) => setCurrentPassword(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "", children: [
                  /* @__PURE__ */ jsx(Label, { children: "New Password" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "password",
                      value: newPassword,
                      onChange: (e) => setNewPassword(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Confirm New Password" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "password",
                      value: confirmNewPassword,
                      onChange: (e) => setConfirmNewPassword(e.target.value)
                    }
                  )
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-2 mt-6 lg:justify-end", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: closeModalChangePassword,
                  children: "Close"
                }
              ),
              /* @__PURE__ */ jsx(Button, { size: "sm", onClick: openConfirmationModal, children: "Save Changes" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        Modal,
        {
          isOpen: isOpenConfirmationModal,
          onClose: closeConfirmationModal,
          className: "max-w-[600px] p-5 lg:p-10",
          children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-center z-1 mb-7", children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "fill-warning-50 dark:fill-warning-500/15",
                  width: "90",
                  height: "90",
                  viewBox: "0 0 90 90",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      d: "M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z",
                      fill: "",
                      fillOpacity: ""
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2", children: /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "fill-warning-600 dark:fill-orange-400",
                  width: "38",
                  height: "38",
                  viewBox: "0 0 38 38",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      fillRule: "evenodd",
                      clipRule: "evenodd",
                      d: "M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z",
                      fill: ""
                    }
                  )
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx("h4", { className: "mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm", children: "Warning!" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-gray-500 dark:text-gray-400", children: "You need re-login, after password changed successfully" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center w-full gap-3 mt-7", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: closeConfirmationModal,
                  children: "Close"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: handleSubmitChangePassword,
                  className: "flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600 sm:w-auto",
                  children: "Okay, Got It"
                }
              )
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs(
        Modal,
        {
          isOpen: isOpenProfilePicFullModal,
          onClose: closeProfilePicFullModal,
          className: "max-w-[600px] p-5 lg:p-10",
          children: [
            /* @__PURE__ */ jsx("img", { src: myProfilePicture, alt: "Profile Picture" }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full my-3 py-3", children: /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                onClick: removeProfilePicture,
                className: "border-red-300 bg-red-500 hover:bg-red-700",
                children: "Remove Image"
              }
            ) })
          ]
        }
      )
    ] })
  ] });
}
function UserProfiles() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | User Profile",
        description: "This is User Profile Dashboard page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: [
      /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Profile" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-12", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7", children: "Profile" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsx(UserMetaCard, {}) })
      ] }) })
    ] })
  ] });
}
export {
  UserProfiles as default
};

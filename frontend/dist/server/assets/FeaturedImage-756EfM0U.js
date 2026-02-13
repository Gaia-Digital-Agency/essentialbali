import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { M as Modal } from "./index-CqfhKOI8.js";
import { useState, useCallback, useEffect } from "react";
import { u as uploadMediaBulk, g as getAllMedia } from "./media.service-Bg8ZwuBl.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import MediaForm from "./MediaForm-pn_2Hilv.js";
import { useDropzone } from "react-dropzone";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { u as useAutoDismiss } from "./useTimedMessage-Dt1cSUu_.js";
import { AxiosError } from "axios";
import { u as useModal } from "./useModal-C9BZm3Uo.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import { ImageIcon } from "lucide-react";
const API_URL$1 = "http://34.124.244.233/essentialbali";
const MEDIA_PER_PAGE = 12;
const Media = ({ onClick, onSave }) => {
  const [availableMedia, setAvailableMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  useAutoDismiss(error, setError, 5e3);
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const validateFiles = (filesToValidate) => {
    const validationErrors = [];
    filesToValidate.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(
          `${file.name} exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB)`
        );
      }
    });
    return validationErrors;
  };
  const handleUpload = async (files) => {
    var _a, _b;
    if (files.length === 0) return;
    const originalFileNames = files.map((f) => f.name);
    try {
      const res = await uploadMediaBulk(files);
      const data = res.data;
      if (data.length) {
        fetchMedia();
      }
      const uploadedNames = originalFileNames;
      setUploadingFiles(
        (prev) => prev.filter((file) => !uploadedNames.includes(file.name))
      );
    } catch (err) {
      console.error("Upload failed", err);
      if (err instanceof AxiosError) {
        setError([((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Upload failed"]);
      } else {
        setError(["Unexpected error occurred"]);
      }
      setUploadingFiles(
        (prev) => prev.map((file) => ({
          ...file,
          error: "Upload Failed"
          // Marking an error on the preview file
        }))
      );
      setTimeout(() => {
        setUploadingFiles([]);
      }, 5e3);
    }
  };
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      const rejectionErrors = rejectedFiles.map((rejected) => {
        const error2 = rejected.errors[0];
        if (error2.code === "file-too-large") {
          return `${rejected.file.name} exceeds 10MB limit.`;
        }
        return `${rejected.file.name}: ${error2.message}`;
      });
      const validationErrors = validateFiles(acceptedFiles);
      const allErrors = [...rejectionErrors, ...validationErrors];
      if (allErrors.length > 0) {
        setError(allErrors.join("\n"));
        return;
      }
      const newFiles = acceptedFiles.map(
        (file) => Object.assign(file, {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          preview: URL.createObjectURL(file),
          uploaded: false,
          progress: 0
        })
      );
      setUploadingFiles((prev) => [...prev, ...newFiles]);
      handleUpload(newFiles);
    },
    []
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    maxSize: MAX_FILE_SIZE
  });
  const fetchMedia = async () => {
    const response = await getAllMedia({ page: 1, limit: MEDIA_PER_PAGE });
    if (response && response.data) {
      setAvailableMedia((prev) => {
        const newUniqueMedia = response.data.filter(
          (newMedia2) => !prev.some((prevMedia) => prevMedia.id === newMedia2.id)
        );
        const newMedia = newUniqueMedia.map((media) => ({ ...media }));
        return [...newMedia, ...prev];
      });
      setHasMore((response == null ? void 0 : response.hasMore) ?? false);
      setPage(2);
      setIsLoading(false);
    } else {
      setAvailableMedia([]);
      setHasMore(false);
    }
  };
  useEffect(() => {
    (async () => {
      await fetchMedia();
    })();
  }, []);
  const handleLoadMore = async () => {
    if (isMoreLoading || !hasMore) return;
    setIsMoreLoading(true);
    setError(null);
    try {
      const response = await getAllMedia({ page, limit: MEDIA_PER_PAGE });
      if (response && response.data) {
        setAvailableMedia((prevMedia) => [...prevMedia, ...response.data]);
        setHasMore((response == null ? void 0 : response.hasMore) ?? false);
        setPage((prevPage) => prevPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e, "error wowowowowo");
      setError("Error loading more media.");
    } finally {
      setIsMoreLoading(false);
    }
  };
  const clickHandler = (file) => {
    setSelectedMedia(file);
    if (onClick) onClick(file);
  };
  const onSaveHandler = () => {
    if (selectedMedia) onSave(selectedMedia);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx(ComponentCard, { title: "Media Library", children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center h-[500px]", children: /* @__PURE__ */ jsx("p", { children: "Loading media..." }) }) });
  }
  if (error && availableMedia.length === 0) {
    return /* @__PURE__ */ jsx(ComponentCard, { title: "Media Library", children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center h-[500px]", children: /* @__PURE__ */ jsx("p", { className: "text-red-500", children: error }) }) });
  }
  if (availableMedia.length === 0 && uploadingFiles.length === 0) {
    return /* @__PURE__ */ jsx(MediaForm, {});
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(
    ComponentCard,
    {
      title: "Media Library",
      desc: "Select a file from your media gallery, or just drag and drop your image here to upload instantly.",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "custom-scrollbar h-110 overflow-y-auto relative", children: [
          /* @__PURE__ */ jsxs("div", { ...getRootProps(), children: [
            /* @__PURE__ */ jsx("input", { ...getInputProps(), className: "pointer-events-none" }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `absolute flex justify-center items-center inset-0 transition border-[10px] border-blue-500 ${isDragActive ? "opacity-100 text-3xl text-white" : "opacity-0"}`,
                style: {
                  backgroundColor: "rgba(43,127,255,.4)",
                  pointerEvents: "none",
                  zIndex: isDragActive ? 10 : 0
                  // 🆕 Add zIndex
                },
                children: /* @__PURE__ */ jsx("p", { children: "Drop Files here" })
              }
            ),
            uploadingFiles.map((file) => /* @__PURE__ */ jsx(
              "div",
              {
                className: `inline-flex rounded mb-2 mr-2 w-44 h-44 p-1 box-border transition-all bg-gray-300 relative`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 overflow-hidden items-center justify-center align-middle relative", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: file.preview,
                      alt: file.name || "File being uploaded",
                      className: "block w-auto h-full object-cover opacity-50"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white", children: file.error ? /* @__PURE__ */ jsx("p", { className: "text-red-400 text-center", children: "❌ Failed" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs(
                      "svg",
                      {
                        className: "animate-spin h-5 w-5 text-white",
                        viewBox: "0 0 24 24",
                        children: [
                          /* @__PURE__ */ jsx(
                            "circle",
                            {
                              className: "opacity-25",
                              cx: "12",
                              cy: "12",
                              r: "10",
                              stroke: "currentColor",
                              strokeWidth: "4"
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "path",
                            {
                              className: "opacity-75",
                              fill: "currentColor",
                              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: "Uploading..." })
                  ] }) })
                ] })
              },
              file.id
            )),
            availableMedia.map((file) => {
              const isSelected = file.id === (selectedMedia == null ? void 0 : selectedMedia.id);
              return /* @__PURE__ */ jsx(
                "div",
                {
                  onClick: () => clickHandler(file),
                  className: `inline-flex rounded mb-2 mr-2 w-44 h-44 p-1 box-border cursor-pointer transition-all bg-gray-200 ${isSelected ? "border-blue-600 border-4" : "border-gray-300 border hover:border-gray-500"}`,
                  children: /* @__PURE__ */ jsx("div", { className: "flex min-w-0 overflow-hidden items-center justify-center align-middle", children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: `${API_URL$1}/${file.path}`,
                      alt: file.alt_text || file.filename || "Media asset",
                      className: "block w-auto h-full object-cover hover:scale-110 transition duration-500 ease-in-out"
                    }
                  ) })
                },
                file.id
              );
            })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-4 mb-2", children: hasMore && /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleLoadMore,
              disabled: isMoreLoading || uploadingFiles.length > 0,
              variant: "outline",
              size: "sm",
              children: isMoreLoading ? "Loading..." : "Load More"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-4 pt-4 border-t", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1", children: error && /* @__PURE__ */ jsx("div", { className: "mb-0 pr-4", children: /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }) }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
            Button,
            {
              disabled: !selectedMedia || uploadingFiles.length > 0,
              onClick: onSaveHandler,
              children: "Select"
            }
          ) })
        ] })
      ]
    }
  ) });
};
const API_URL = "http://34.124.244.233/essentialbali";
const FeaturedImage = ({
  url,
  alt = "",
  ratio = "16/9"
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-gray-50 group",
      style: { aspectRatio: ratio },
      children: url && url !== "#" ? /* @__PURE__ */ jsx(
        "img",
        {
          src: url,
          alt,
          className: "absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        }
      ) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-3 rounded-full bg-gray-200", children: /* @__PURE__ */ jsx(ImageIcon, { className: "h-6 w-6 text-gray-400" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "No Image" })
      ] })
    }
  );
};
const AdminFeaturedImage = ({ url, alt, onSave, ratio, width = "100%" }) => {
  const { isOpen, closeModal, openModal } = useModal(false);
  const saveHandler = (file) => {
    closeModal();
    onSave(file);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative group cursor-pointer",
        style: { width },
        onClick: openModal,
        children: [
          /* @__PURE__ */ jsx(FeaturedImage, { url: String(url).startsWith(API_URL) ? url : API_URL + "/" + url, alt, ratio, width }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] rounded-2xl", children: /* @__PURE__ */ jsx(
            Badge,
            {
              size: "md",
              children: "Edit"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Modal,
      {
        className: "mx-8 lg:mx-32 p-6 lg:p-10",
        isOpen,
        onClose: closeModal,
        children: /* @__PURE__ */ jsx(Media, { onSave: saveHandler })
      }
    )
  ] });
};
export {
  AdminFeaturedImage as A,
  Media as M
};

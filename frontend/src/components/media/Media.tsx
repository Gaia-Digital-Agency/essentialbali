import React, { useState, useEffect, useCallback } from "react";
import { getAllMedia } from "../../services/media.service";
import { AssetMedia } from "../../types/media.type";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";
import MediaForm from "../../pages/Media/MediaForm";
import { FileRejection, useDropzone } from "react-dropzone";
import { uploadMediaBulk } from "../../services/media.service";
import Alert from "../ui/alert/Alert";
import useTimedMessage from "../../hooks/useTimedMessage";
import { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

const MEDIA_PER_PAGE = 12;

type MediaProps = {
  onClick?: (file: AssetMedia) => void;
  onSave: (file: AssetMedia) => void;
};

interface PreviewFile extends File {
  id: string | number;
  preview: string;
  uploaded?: boolean;
  error?: string;
  progress?: number;
}

const Media: React.FC<MediaProps> = ({ onClick, onSave }) => {
  const [availableMedia, setAvailableMedia] = useState<AssetMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<AssetMedia | undefined>();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [error, setError] = useState<string | null | string[]>(null);
  const [uploadingFiles, setUploadingFiles] = useState<PreviewFile[]>([]);

  useTimedMessage(error, setError, 5000);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const validateFiles = (filesToValidate: File[]): string[] => {
    const validationErrors: string[] = [];

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

  const handleUpload = async (files: PreviewFile[]) => {
    if (files.length === 0) return;
    // const fileIdsToUpload = files.map(f => f.id);
    const originalFileNames = files.map((f) => f.name);
    try {
      // 🆕 MARK UPLOAD START: Set progress/status in local state (not necessary as it's already done in onDrop)
      // If you have a progress mechanism in `uploadMediaBulk`, you would update it here.

      const res = await uploadMediaBulk(files);
      const data = res.data;
      if (data.length) {
        fetchMedia();
      }

      // 🆕 MARK UPLOAD COMPLETE: Remove the successfully uploaded file from the `uploadingFiles` state
      // const uploadedNames = res.data.map((f: AssetMedia) => f.filename);
      const uploadedNames = originalFileNames;
      setUploadingFiles((prev) =>
        prev.filter((file) => !uploadedNames.includes(file.name))
      );

      // const uploadedNames = res.data.map((f) => f.filename);
    } catch (err: unknown) {
      console.error("Upload failed", err);
      if (err instanceof AxiosError) {
        setError([err.response?.data?.message || "Upload failed"]);
      } else {
        setError(["Unexpected error occurred"]);
      }

      // 🆕 MARK UPLOAD FAILED: Remove all failed files (or provide an error indication)
      setUploadingFiles((prev) =>
        prev.map((file) => ({
          ...file,
          error: "Upload Failed", // Marking an error on the preview file
        }))
      );

      // Since we are using `useTimedMessage`, we only need to delete the failed upload after a while.
      setTimeout(() => {
        setUploadingFiles([]);
      }, 5000);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      const rejectionErrors = rejectedFiles.map((rejected) => {
        const error = rejected.errors[0];
        // Check if the error is a file size issue that should be handled by validateFiles
        if (error.code === "file-too-large") {
          return `${rejected.file.name} exceeds 10MB limit.`; // Replacing the default message
        }
        return `${rejected.file.name}: ${error.message}`;
      });

      const validationErrors = validateFiles(acceptedFiles);
      const allErrors = [...rejectionErrors, ...validationErrors];

      if (allErrors.length > 0) {
        // Show all errors
        setError(allErrors.join("\n"));
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          preview: URL.createObjectURL(file),
          uploaded: false,
          progress: 0,
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
    maxSize: MAX_FILE_SIZE,
  });

  const fetchMedia = async () => {
    const response = await getAllMedia({ page: 1, limit: MEDIA_PER_PAGE });
    if (response && response.data) {
      setAvailableMedia((prev) => {
        const newUniqueMedia = response.data.filter(
          (newMedia) => !prev.some((prevMedia) => prevMedia.id === newMedia.id)
        );
        const newMedia = newUniqueMedia.map((media) => ({ ...media }));
        return [...newMedia, ...prev];
      });
      setHasMore(response?.hasMore ?? false);
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
      const response = await getAllMedia({ page: page, limit: MEDIA_PER_PAGE });

      if (response && response.data) {
        setAvailableMedia((prevMedia) => [...prevMedia, ...response.data]);
        setHasMore(response?.hasMore ?? false);
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

  const clickHandler = (file: AssetMedia) => {
    setSelectedMedia(file);
    if (onClick) onClick(file);
  };

  const onSaveHandler = () => {
    if (selectedMedia) onSave(selectedMedia);
  };

  if (isLoading) {
    return (
      <ComponentCard title="Media Library">
        <div className="flex justify-center items-center h-[500px]">
          <p>Loading media...</p>
        </div>
      </ComponentCard>
    );
  }

  if (error && availableMedia.length === 0) {
    return (
      <ComponentCard title="Media Library">
        <div className="flex justify-center items-center h-[500px]">
          <p className="text-red-500">{error}</p>
        </div>
      </ComponentCard>
    );
  }

  // if (availableMedia.length === 0) {
  //   return <MediaForm />;
  // }

  if (availableMedia.length === 0 && uploadingFiles.length === 0) {
    return <MediaForm />;
  }

  return (
    <>
      <ComponentCard
        title="Media Library"
        desc="Select a file from your media gallery, or just drag and drop your image here to upload instantly."
      >
        <div className="custom-scrollbar h-110 overflow-y-auto relative">
          <div {...getRootProps()}>
            <input {...getInputProps()} className="pointer-events-none" />
            <div
              className={`absolute flex justify-center items-center inset-0 transition border-[10px] border-blue-500 ${
                isDragActive ? "opacity-100 text-3xl text-white" : "opacity-0"
              }`}
              style={{
                backgroundColor: "rgba(43,127,255,.4)",
                pointerEvents: "none",
                zIndex: isDragActive ? 10 : 0, // 🆕 Add zIndex
              }}
            >
              <p>Drop Files here</p>
            </div>

            {/* 🆕 DISPLAY OF FILES BEING UPLOADED */}
            {uploadingFiles.map((file) => (
              <div
                key={file.id}
                className={`inline-flex rounded mb-2 mr-2 w-44 h-44 p-1 box-border transition-all bg-gray-300 relative`}
              >
                <div className="flex min-w-0 overflow-hidden items-center justify-center align-middle relative">
                  <img
                    src={file.preview}
                    alt={file.name || "File being uploaded"}
                    className="block w-auto h-full object-cover opacity-50" // Opacity to show status
                  />
                  {/* Loading indicator overlay */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white">
                    {file.error ? (
                      <p className="text-red-400 text-center">❌ Failed</p>
                    ) : (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                        >
                          {/* Simple Svg Spinner */}
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <p className="mt-2 text-sm">Uploading...</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {availableMedia.map((file) => {
              const isSelected = file.id === selectedMedia?.id;
              return (
                <div
                  key={file.id}
                  onClick={() => clickHandler(file)}
                  className={`inline-flex rounded mb-2 mr-2 w-44 h-44 p-1 box-border cursor-pointer transition-all bg-gray-200 ${
                    isSelected
                      ? "border-blue-600 border-4"
                      : "border-gray-300 border hover:border-gray-500"
                  }`}
                >
                  <div className="flex min-w-0 overflow-hidden items-center justify-center align-middle">
                    <img
                      src={`${API_URL}/${file.path}`}
                      alt={file.alt_text || file.filename || "Media asset"}
                      className="block w-auto h-full object-cover hover:scale-110 transition duration-500 ease-in-out"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-4 mb-2">
            {hasMore && (
              <Button
                onClick={handleLoadMore}
                disabled={isMoreLoading || uploadingFiles.length > 0}
                variant="outline"
                size="sm"
              >
                {isMoreLoading ? "Loading..." : "Load More"}
              </Button>
            )}
          </div>

          {/* {error && availableMedia.length > 0 && (
            <div className="flex justify-center mt-2">
              <p className="text-red-500">{error}</p>
            </div>
          )} */}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex-1">
            {error && (
              <div className="mb-0 pr-4">
                <Alert variant="error" title="Error" message={error} />
              </div>
            )}
          </div>

          <div>
            <Button
              disabled={!selectedMedia || uploadingFiles.length > 0}
              onClick={onSaveHandler}
            >
              Select
            </Button>
          </div>
        </div>
      </ComponentCard>
    </>
  );
};

export default Media;

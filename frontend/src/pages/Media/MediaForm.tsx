import { FileRejection, useDropzone } from "react-dropzone";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useState, useCallback, useEffect } from "react";
import { uploadMediaBulk } from "../../services/media.service";
import { MediaFile } from "../../types/media.type";

export default function MediaForm() {
  interface PreviewFile extends File {
    id: string;
    preview: string;
    uploaded?: boolean;
    error?: string;
    progress?: number;
  }

  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<MediaFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  // Validate file size (max 5MB per file)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILES = 10;

  const validateFiles = (filesToValidate: File[]): string[] => {
    const validationErrors: string[] = [];

    if (files.length + filesToValidate.length > MAX_FILES) {
      validationErrors.push(`Maximum ${MAX_FILES} files allowed at once`);
    }

    filesToValidate.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(
          `${file.name} exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB)`
        );
      }
    });

    return validationErrors;
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setErrors([]);

      // Handle rejected files
      const rejectionErrors = rejectedFiles.map((rejected) => {
        const error = rejected.errors[0];
        return `${rejected.file.name}: ${error.message}`;
      });

      // Validate accepted files
      const validationErrors = validateFiles(acceptedFiles);
      const allErrors = [...rejectionErrors, ...validationErrors];

      if (allErrors.length > 0) {
        setErrors(allErrors);
        return;
      }

      // Add new files with preview
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          preview: URL.createObjectURL(file),
          uploaded: false,
          progress: 0,
        })
      );

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setErrors([]);

      // Simulate progress (you can implement real progress with axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const res = await uploadMediaBulk(files);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const uploadedNames = res.data.map((f) => f.filename);

      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          uploaded: uploadedNames.includes(file.name),
        }))
      );

      setUploaded((prev) => [...prev, ...res.data]);

      // Clear uploaded files after 2 seconds
      setTimeout(() => {
        setFiles((prev) => prev.filter((f) => !f.uploaded));
        setUploadProgress(0);
      }, 2000);
    } catch (err : unknown) {
      // console.error("Upload failed", err);
      // setErrors([
      //   err.response?.data?.message || "Upload failed. Please try again.",
      // ]);
      // setUploadProgress(0);
      console.error("Upload failed", err);
      if (err && typeof err === "object" && "message" in err) {
        setErrors([(err as Error).message]);
      } else {
        setErrors(["Unknown error occurred"]);
      }
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const clearAll = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setErrors([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const thumbs = files.map((file) => (
    <div
      key={file.id}
      className="relative inline-flex rounded border border-gray-300 mb-2 mr-2 w-32 h-32 p-1 box-border bg-white dark:bg-gray-800 dark:border-gray-600"
    >
      <div className="flex min-w-0 overflow-hidden rounded">
        <img
          src={file.preview}
          alt={file.name}
          className="block w-full h-full object-cover"
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>

      {/* Status Badge */}
      {file.uploaded && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
          ✓ Uploaded
        </div>
      )}

      {/* Remove Button */}
      {!file.uploaded && !uploading && (
        <button
          type="button"
          onClick={() => removeFile(file.id)}
          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors"
          aria-label="Remove file"
        >
          ×
        </button>
      )}

      {/* File Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
        <div className="truncate">{file.name}</div>
        <div className="text-gray-300">{formatFileSize(file.size)}</div>
      </div>
    </div>
  ));

  return (
    <>
      <PageMeta
        title="essentialbali Admin Dashboard | Add New Media"
        description="This is Add New Media Page for essentialbali Admin Dashboard"
      />
      <div className="pb-5 grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          <PageBreadcrumb pageTitle="Add Media" />
        </div>
      </div>

      <ComponentCard title="Media Upload">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="text-red-800 dark:text-red-300 font-semibold mb-2">
              Upload Errors:
            </h4>
            <ul className="list-disc ml-5 text-red-700 dark:text-red-400 text-sm">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Dropzone */}
        <div className="transition border-2 border-dashed cursor-pointer rounded-xl hover:border-brand-500 dark:hover:border-brand-500 dark:border-gray-700">
          <form
            {...getRootProps()}
            className={`dropzone rounded-xl p-7 lg:p-10 transition-colors
              ${
                isDragActive
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              }
            `}
            id="demo-upload"
          >
            <input {...getInputProps()} />

            <div className="dz-message flex flex-col items-center">
              {/* Icon Container */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <svg
                    className="fill-current"
                    width="29"
                    height="28"
                    viewBox="0 0 29 28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                    />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <h4 className="mb-3 font-semibold text-gray-800 text-lg dark:text-white">
                {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
              </h4>

              <span className="text-center mb-5 block w-full max-w-[320px] text-base text-gray-600 dark:text-gray-400">
                Drag and drop your PNG, JPG, WebP, SVG images here or click to
                browse
              </span>

              <span className="font-medium text-lg text-brand-500 hover:text-brand-600 transition-colors">
                Browse Files
              </span>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
                Max file size: 10MB • Max files: {MAX_FILES}
              </div>
            </div>
          </form>

          {/* Preview Thumbnails */}
          {files.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Selected Files ({files.length})
                </h4>
                {!uploading && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-row flex-wrap">{thumbs}</div>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-brand-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="px-6 py-3 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                Uploading...
              </span>
            ) : (
              `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`
            )}
          </button>
        </div>

        {/* Uploaded Files List */}
        {uploaded.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Successfully Uploaded ({uploaded.length} files)
            </h3>
            <ul className="space-y-2">
              {uploaded.map((f) => (
                <li
                  key={f.id}
                  className="flex justify-between items-center text-sm text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 p-2 rounded"
                >
                  <span className="font-medium truncate flex-1">
                    {f.filename}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-4">
                    {formatFileSize(f.size)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ComponentCard>
    </>
  );
}

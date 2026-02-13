import { useDropzone } from "react-dropzone";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";
import { uploadMediaBulk } from "../../services/media.service";
import { MediaFile } from "../../types/media.type";

export default function MediaForm() {
  interface PreviewFile extends File {
    preview: string;
    uploaded?: boolean;
  }

  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<MediaFile[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          uploaded: false,
        })
      )
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const res = await uploadMediaBulk(files);

      const uploadedNames = res.data.map((f) => f.filename);

      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          uploaded: uploadedNames.includes(file.name),
        }))
      );

      setUploaded(res.data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const thumbs = files.map((file) => (
    <div
      key={file.name}
      className="inline-flex rounded border border-gray-300 mb-2 mr-2 w-35 h-35 p-1 box-border"
    >
      <div className="flex min-w-0 overflow-hidden">
        <img
          src={file.preview}
          className="block w-auto h-full object-cover"
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
      {file.uploaded && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-1 py-0.5 rounded-bl">
          ✅
        </div>
      )}
    </div>
  ));

  return (
    <>
      <PageMeta
        title="essentialbali Admin Dashboard | Add New Media"
        description="This is Add New Media Page for essentialbali Admin Dashboard"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          <PageBreadcrumb pageTitle="Add Media" />
        </div>
      </div>
      <ComponentCard title="Media Form">
        <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
          <form
            {...getRootProps()}
            className={`dropzone rounded-xl   border-dashed border-gray-300 p-7 lg:p-10
        ${
          isDragActive
            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        }
      `}
            id="demo-upload"
          >
            {/* Hidden Input */}
            <input {...getInputProps()} />

            <div className="dz-message flex flex-col items-center m-0!">
              {/* Icon Container */}
              <div className="mb-[22px] flex justify-center">
                <div className="flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
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
              <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
              </h4>

              <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                Drag and drop your PNG, JPG, WebP, SVG images here or browse
              </span>

              <span className="font-medium underline text-theme-sm text-brand-500">
                Browse File
              </span>
            </div>
          </form>
          <div className="flex flex-row flex-wrap mt-4 justify-center align-baseline">
            {thumbs}
          </div>
        </div>
        <div className="flex  justify-center align-middle">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="mt-4 px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
        {uploaded.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Uploaded Files:</h3>
            <ul className="list-disc ml-6">
              {uploaded.map((f) => (
                <li key={f.id}>
                  {f.filename} - {f.size} bytes
                </li>
              ))}
            </ul>
          </div>
        )}
      </ComponentCard>
    </>
  );
}

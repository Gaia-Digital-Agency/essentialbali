import { bucket } from "../config/gcs.js";
import path from "path";

export const uploadToGCS = async (localFilePath, fileName, mimetype) => {
  const destination = fileName;

  await bucket.upload(localFilePath, {
    destination,
    metadata: {
      contentType: mimetype,
    },
    public: true,
  });

  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};

import { bucket, bucketPrefix } from "../config/gcs.js";
import path from "path";

/**
 * Uploads a file to Google Cloud Storage.
 * 
 * @param {string} localFilePath - The local path to the file to upload.
 * @param {string} fileName - The name to give the file in GCS.
 * @param {string} mimetype - The file's mimetype.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
export const uploadToGCS = async (localFilePath, fileName, mimetype) => {
  try {
    const destination = bucketPrefix ? `${bucketPrefix}/${fileName}` : fileName;

    await bucket.upload(localFilePath, {
      destination,
      metadata: {
        contentType: mimetype,
      },
      // public: true, // Removed because Uniform bucket-level access is enabled
    });

    console.log(`Successfully uploaded ${fileName} to GCS bucket ${bucket.name}/${bucketPrefix}`);
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
  } catch (error) {
    console.error(`Error uploading to GCS: ${error.message}`);
    throw error;
  }
};

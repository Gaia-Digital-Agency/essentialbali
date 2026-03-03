import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

dotenv.config();

const storageOptions = {};

if (process.env.GCS_KEYFILE_PATH) {
  storageOptions.keyFilename = process.env.GCS_KEYFILE_PATH;
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Use default ADC if GCS_KEYFILE_PATH is not set
} else {
  // Fallback to the default path if nothing else is provided
  storageOptions.keyFilename = "config/gcs-key.json";
}

if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
  storageOptions.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
}

const storage = new Storage(storageOptions);
const rawBucketName = process.env.GCS_BUCKET_NAME || "essential-bali-bucket";

// Split bucket name and folder prefix (e.g., "bucket-name/folder" -> bucket: "bucket-name", prefix: "folder")
const [bucketName, ...prefixParts] = rawBucketName.split("/");
const bucketPrefix = prefixParts.join("/");

const bucket = storage.bucket(bucketName);

export { bucket, bucketPrefix };

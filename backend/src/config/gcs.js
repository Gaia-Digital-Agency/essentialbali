import { Storage } from "@google-cloud/storage";
const storage = new Storage({
  keyFilename: "config/gcs-key.json",
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucket = storage.bucket("NAMA_BUCKET_KAMU");

export { bucket };

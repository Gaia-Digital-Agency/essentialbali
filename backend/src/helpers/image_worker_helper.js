import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run image processing task in a worker thread
 * @param {string} action - 'compress' or 'convertToWebP'
 * @param {Object} file - The file object from multer
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} - Task results
 */
export function runImageWorker(action, file, config) {
  return new Promise((resolve, reject) => {
    // Path to the worker file (adjust based on your structure)
    const workerPath = path.join(__dirname, "../workers/image.worker.js");
    
    const worker = new Worker(workerPath, {
      workerData: { action, file, config },
    });

    worker.on("message", (result) => {
      if (result.status === "success") {
        resolve(result);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

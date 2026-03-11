import { parentPort, workerData } from "worker_threads";
import sharp from "sharp";
import path from "path";
import fs from "fs";

async function processImageWorker() {
  const { action, file, config } = workerData;
  const originalPath = file.path;

  try {
    if (action === "compress") {
      const metadata = await sharp(originalPath).metadata();
      let transformer = sharp(originalPath).rotate();

      if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
        transformer = transformer.resize(config.maxWidth, config.maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      switch (config.format) {
        case "jpeg":
        case "jpg":
          transformer = transformer.jpeg({ quality: config.quality, progressive: true, mozjpeg: true });
          break;
        case "png":
          transformer = transformer.png({ quality: config.quality, compressionLevel: 9 });
          break;
        case "webp":
          transformer = transformer.webp({ quality: config.quality, effort: 6 });
          break;
      }

      const compressedBuffer = await transformer.toBuffer();
      await fs.promises.writeFile(originalPath, compressedBuffer);

      let thumbnailPath = null;
      if (config.createThumbnail) {
        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const filename = path.basename(originalPath, ext);
        thumbnailPath = path.join(dir, `${filename}_thumb${ext}`);

        await sharp(originalPath)
          .resize(config.thumbnailWidth, config.thumbnailHeight, { fit: "cover", position: "center" })
          .jpeg({ quality: 70 })
          .toFile(thumbnailPath);
      }

      parentPort.postMessage({ 
        status: "success", 
        size: compressedBuffer.length,
        thumbnailPath 
      });

    } else if (action === "convertToWebP") {
      const dir = path.dirname(originalPath);
      const ext = path.extname(originalPath);
      const baseName = path.basename(originalPath, ext);
      
      // Handle unique filename logic in worker to keep it atomic
      let finalWebpName = `${baseName}.webp`;
      let counter = 0;
      while (fs.existsSync(path.join(dir, finalWebpName))) {
        counter++;
        finalWebpName = `${baseName}-${counter}.webp`;
      }
      const finalWebpPath = path.join(dir, finalWebpName);

      await sharp(originalPath)
        .rotate()
        .webp({ quality: config.quality, effort: config.effort })
        .toFile(finalWebpPath);

      if (config.deleteOriginal) {
        await fs.promises.unlink(originalPath);
      }

      parentPort.postMessage({ 
        status: "success", 
        path: finalWebpPath, 
        filename: finalWebpName 
      });
    }
  } catch (error) {
    parentPort.postMessage({ status: "error", error: error.message });
  }
}

processImageWorker();

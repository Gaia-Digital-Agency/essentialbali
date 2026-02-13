// src/middlewares/image_compression.js
import sharp from "sharp";
import path from "path";
import fs from "fs";

/**
 * Compress image menggunakan Sharp
 * @param {Object} options - Compression options
 */
export const compressImage = (options = {}) => {
  const defaultOptions = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 80,
    format: "jpeg", // 'jpeg', 'png', 'webp'
    createThumbnail: false,
    thumbnailWidth: 300,
    thumbnailHeight: 300,
  };

  const config = { ...defaultOptions, ...options };

  return async (req, res, next) => {
    // Skip jika tidak ada file
    if (!req.file && !req.files) {
      return next();
    }

    try {
      // Handle single file
      if (req.file) {
        await processImage(req.file, config);
      }

      // Handle multiple files
      if (req.files && Array.isArray(req.files)) {
        await Promise.all(req.files.map((file) => processImage(file, config)));
      }

      next();
    } catch (error) {
      console.error("Image compression error:", error);
      next(error);
    }
  };
};

/**
 * Process single image file
 */
async function processImage(file, config) {
  const originalPath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  // Skip jika bukan image
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    console.log(
      `⏭️  Skipping ${file.originalname} - not a supported format for compression`
    );
    // throw new Error(`Unsupported file format: ${file.originalname}`);
    return;
  }

  try {
    // Get image metadata
    const metadata = await sharp(originalPath).metadata();

    console.log(
      `📸 Original image: ${metadata.width}x${metadata.height}, ${(
        file.size / 1024
      ).toFixed(2)}KB`
    );

    // Tentukan ekstensi dan path output
    // const outputFormat = config.format || 'jpeg';
    // const outputExt = `.${outputFormat}`;
    // const dir = path.dirname(originalPath);
    // const filename = path.basename(originalPath, path.extname(originalPath));
    // const outputPath = path.join(dir, `${filename}.${outputFormat}`);

    // Create sharp instance
    let transformer = sharp(originalPath).rotate();

    // Resize jika lebih besar dari max dimensions
    if (
      metadata.width > config.maxWidth ||
      metadata.height > config.maxHeight
    ) {
      transformer = transformer.resize(config.maxWidth, config.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Compress based on format
    switch (config.format) {
      case "jpeg":
      case "jpg":
        transformer = transformer.jpeg({
          quality: config.quality,
          progressive: true,
          mozjpeg: true,
        });
        break;

      case "png":
        transformer = transformer.png({
          quality: config.quality,
          compressionLevel: 9,
          adaptiveFiltering: true,
        });
        break;

      case "webp":
        transformer = transformer.webp({
          quality: config.quality,
          effort: 6,
        });
        break;
    }

    // Save compressed image (overwrite original)
    const compressedBuffer = await transformer.toBuffer();
    await fs.promises.writeFile(originalPath, compressedBuffer);

    // Update file object
    file.size = compressedBuffer.length;

    console.log(`✅ Compressed: ${(file.size / 1024).toFixed(2)}KB`);

    // Create thumbnail if needed
    if (config.createThumbnail) {
      await createThumbnail(originalPath, config);
    }
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

/**
 * Create thumbnail
 */
async function createThumbnail(imagePath, config) {
  const dir = path.dirname(imagePath);
  const filename = path.basename(imagePath, path.extname(imagePath));
  const ext = path.extname(imagePath);
  const thumbnailPath = path.join(dir, `${filename}_thumb${ext}`);

  await sharp(imagePath)
    .resize(config.thumbnailWidth, config.thumbnailHeight, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 70 })
    .toFile(thumbnailPath);

  console.log(`🖼️  Thumbnail created: ${thumbnailPath}`);
}

/**
 * Convert to WebP for best compression
 * @param {Object} options - WebP conversion options
 */
export const convertToWebP = (options = {}) => {
  const defaultOptions = {
    quality: 85,
    effort: 6,
    deleteOriginal: true,
  };

  const config = { ...defaultOptions, ...options };

  return async (req, res, next) => {
    // Skip jika tidak ada file
    if (!req.file && !req.files) {
      return next();
    }

    try {
      // Handle single file
      if (req.file) {
        await convertSingleToWebP(req.file, config);
      }

      // Handle multiple files
      if (req.files && Array.isArray(req.files)) {
        await Promise.all(
          req.files.map((file) => convertSingleToWebP(file, config))
        );
      }
      console.log("convertToWebP OK");
      next();
    } catch (error) {
      console.error("WebP conversion error:", error);
      next(error);
    }
  };
};

// Tambahkan helper
function getUniqueWebpPath(dir, baseName) {
  let counter = 0;
  let finalName = `${baseName}.webp`;

  while (fs.existsSync(path.join(dir, finalName))) {
    counter++;
    finalName = `${baseName}-${counter}.webp`;
  }

  return path.join(dir, finalName);
}

/**
 * Convert single file to WebP
 */
async function convertSingleToWebP_v1(file, config) {
  const originalPath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  // Skip jika bukan image atau sudah WebP
  if (![".jpg", ".jpeg", ".png"].includes(ext)) {
    console.log(
      `⏭️  Skipping ${file.originalname} - not a supported format for WebP conversion`
    );
    return;
  }

  const dir = path.dirname(originalPath);
  const filename = path.basename(originalPath, path.extname(originalPath));
  const webpPath = path.join(dir, `${filename}.webp`);

  // const originalName = path.basename(file.originalname,path.extname(file.originalname));
  // const webpPath = path.join(dir, `${originalName}.webp`);

  try {
    // Get original file size
    const originalStats = await fs.promises.stat(originalPath);
    const originalSize = originalStats.size;

    console.log(`🔄 Converting to WebP: ${file.originalname}`);
    console.log(`   Original size: ${(originalSize / 1024).toFixed(2)}KB`);

    // Convert to WebP
    await sharp(originalPath)
      .rotate()
      .webp({
        quality: config.quality,
        effort: config.effort,
      })
      .toFile(webpPath);

    // Get WebP file size
    const webpStats = await fs.promises.stat(webpPath);
    const webpSize = webpStats.size;
    const savedPercentage = ((1 - webpSize / originalSize) * 100).toFixed(2);

    console.log(`   WebP size: ${(webpSize / 1024).toFixed(2)}KB`);
    console.log(
      `   🎯 Saved: ${savedPercentage}% (${(
        (originalSize - webpSize) /
        1024
      ).toFixed(2)}KB)`
    );

    // Delete original file if configured
    if (config.deleteOriginal) {
      await fs.promises.unlink(originalPath);
      console.log(`   🗑️  Original file deleted`);
    }

    // Update file object
    file.path = webpPath;
    file.filename = `${filename}.webp`;
    file.mimetype = "image/webp";
    file.size = webpSize;
    file.originalSize = originalSize; // Store for reference

    console.log(`✅ Conversion complete: ${file.filename}`);
  } catch (error) {
    console.error(`❌ Error converting ${file.originalname} to WebP:`, error);
    throw error;
  }
}

async function convertSingleToWebP(file, config) {
  const originalPath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  if (![".jpg", ".jpeg", ".png"].includes(ext)) return;

  const dir = path.dirname(originalPath);
  const baseName = path.basename(originalPath, ext);

  // 🔥 Cari nama final yang tidak bentrok
  const finalWebpPath = getUniqueWebpPath(dir, baseName);

  try {
    // Convert ke WebP
    await sharp(originalPath)
      .rotate()
      .webp({
        quality: config.quality,
        effort: config.effort,
      })
      .toFile(finalWebpPath);

    // Hapus file original
    if (config.deleteOriginal) {
      await fs.promises.unlink(originalPath);
    }

    // Update file
    file.path = finalWebpPath;
    file.filename = path.basename(finalWebpPath);
    file.mimetype = "image/webp";

    console.log("Converted + unique filename:", file.filename);
  } catch (error) {
    console.error("❌ Error converting:", error);
    throw error;
  }
}

export default compressImage;

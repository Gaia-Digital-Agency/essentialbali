export const IMAGE_COMPRESSION_PRESETS = {
  // Profile pictures - smaller size, square format
  profile: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
    format: 'jpeg',
    createThumbnail: true,
    thumbnailWidth: 150,
    thumbnailHeight: 150
  },

  // Article featured images - high quality
  article: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 90,
    format: 'jpeg',
    createThumbnail: true,
    thumbnailWidth: 400,
    thumbnailHeight: 300
  },

  // Property images - multiple sizes
  property: {
    maxWidth: 2048,
    maxHeight: 1536,
    quality: 85,
    format: 'webp', // WebP untuk better compression
    createThumbnail: true,
    thumbnailWidth: 500,
    thumbnailHeight: 375
  },

  // Icons/logos - small size, high quality
  icon: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 95,
    format: 'png', // PNG untuk transparency
    createThumbnail: false
  },

  // Thumbnails only
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 75,
    format: 'jpeg',
    createThumbnail: false
  }
};
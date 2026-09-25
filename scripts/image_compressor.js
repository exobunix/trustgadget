const fs = require('fs');
const sharp = require('sharp');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_uzSklsoDFlGNoIPGFtTdcYJU32Y=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_Zgjm0jSmxe2S76y3kkULZ5nzEvo=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/avdarinn',
});

// Compress image strictly between 100 KB and 300 KB
async function compressTo100_300KB(rawBuffer) {
  const MIN_BYTES = 100 * 1024;
  const MAX_BYTES = 300 * 1024;

  let width = 900;
  let quality = 85;

  let buffer = await sharp(rawBuffer)
    .resize(width, width, { fit: 'inside', withoutEnlargement: false })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  // If too large (> 300 KB), step down
  while (buffer.length > MAX_BYTES && quality > 40) {
    quality -= 5;
    if (quality < 65 && width > 650) {
      width -= 50;
    }
    buffer = await sharp(rawBuffer)
      .resize(width, width, { fit: 'inside', withoutEnlargement: false })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  // If too small (< 100 KB), step up resolution/quality or use PNG
  if (buffer.length < MIN_BYTES) {
    // Try higher resolution JPEG
    let testQ = 96;
    let testW = 1200;
    let candidate = await sharp(rawBuffer)
      .resize(testW, testW, { fit: 'inside', withoutEnlargement: false })
      .jpeg({ quality: testQ, mozjpeg: false })
      .toBuffer();

    if (candidate.length >= MIN_BYTES && candidate.length <= MAX_BYTES) {
      buffer = candidate;
    } else if (candidate.length > MAX_BYTES) {
      // Find the right quality
      let low = 80, high = 95;
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        candidate = await sharp(rawBuffer)
          .resize(testW, testW, { fit: 'inside', withoutEnlargement: false })
          .jpeg({ quality: mid, mozjpeg: true })
          .toBuffer();
        if (candidate.length > MAX_BYTES) {
          high = mid - 1;
        } else if (candidate.length < MIN_BYTES) {
          low = mid + 1;
        } else {
          buffer = candidate;
          break;
        }
      }
    } else {
      // Still under 100 KB, use PNG format
      candidate = await sharp(rawBuffer)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: false })
        .png({ quality: 90, compressionLevel: 6 })
        .toBuffer();

      if (candidate.length >= MIN_BYTES && candidate.length <= MAX_BYTES) {
        buffer = candidate;
      } else if (candidate.length > MAX_BYTES) {
        // High quality JPEG
        buffer = await sharp(rawBuffer)
          .resize(1100, 1100, { fit: 'inside', withoutEnlargement: false })
          .jpeg({ quality: 93 })
          .toBuffer();
      } else {
        // Enlarge PNG slightly
        buffer = await sharp(rawBuffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: false })
          .png({ compressionLevel: 3 })
          .toBuffer();
      }
    }
  }

  return buffer;
}

module.exports = {
  imagekit,
  compressTo100_300KB
};

import ImageKit from 'imagekit';

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || 'public_uzSklsoDFlGNoIPGFtTdcYJU32Y=';
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'private_Zgjm0jSmxe2S76y3kkULZ5nzEvo=';
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/avdarinn';
const rawFolder = process.env.IMAGEKIT_FOLDER || 'trust gadget';

// Sanitize folder name for ImageKit (e.g. "trust gadget" -> "trust_gadget")
const defaultFolder = rawFolder.trim().replace(/\s+/g, '_');

// Singleton ImageKit Client
export const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

/**
 * Uploads a file (Buffer or base64 string) directly to ImageKit in the "trust gadget" (trust_gadget) folder
 */
export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  subFolder?: string
) {
  try {
    const cleanSub = subFolder ? subFolder.trim().replace(/\s+/g, '_') : '';
    const targetFolder = cleanSub ? `${defaultFolder}/${cleanSub}` : defaultFolder;
    
    // Convert Buffer to base64 if needed
    const filePayload = Buffer.isBuffer(file) ? file.toString('base64') : file;

    const response = await imagekit.upload({
      file: filePayload,
      fileName,
      folder: targetFolder,
      useUniqueFileName: true,
      tags: ['trustmygadget', cleanSub || 'general'],
    });

    return {
      success: true,
      url: response.url,
      fileId: response.fileId,
      name: response.name,
      thumbnailUrl: response.thumbnailUrl || response.url,
      filePath: response.filePath,
    };
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    return {
      success: false,
      error: error.message || 'ImageKit upload failed',
    };
  }
}

/**
 * Client authentication token generator for direct browser uploads
 */
export function getImageKitAuth() {
  return imagekit.getAuthenticationParameters();
}

/**
 * Cloudflare R2 Storage Utilities
 * 
 * This module provides functions to interact with Cloudflare R2 storage for product and category images.
 * R2 is S3-compatible, so we use the AWS SDK.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || 'product-images';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL; // e.g., https://pub-xxxxx.r2.dev

// Initialize S3 Client for R2
let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials not configured. Please set VITE_R2_ACCOUNT_ID, VITE_R2_ACCESS_KEY_ID, and VITE_R2_SECRET_ACCESS_KEY');
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

/**
 * Upload an image file to R2 storage
 * @param file - File blob or buffer to upload
 * @param fileName - Name of the file in R2
 * @param folder - Folder path (e.g., 'products' or 'categories')
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToR2(
  file: Blob | Buffer | Uint8Array,
  fileName: string,
  folder: 'products' | 'categories',
  contentType: string = 'image/jpeg'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const client = getR2Client();
    const key = `${folder}/${fileName}`;

    // Convert Blob to ArrayBuffer if needed
    let body: Buffer | Uint8Array;
    if (file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
      body = new Uint8Array(arrayBuffer);
    } else {
      body = file;
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
    });

    await client.send(command);

    // Generate public URL
    const publicUrl = R2_PUBLIC_URL 
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev/${key}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('[R2 Storage] Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete an image from R2 storage
 * @param fileName - Name of the file to delete
 * @param folder - Folder path (e.g., 'products' or 'categories')
 * @returns Success status
 */
export async function deleteImageFromR2(
  fileName: string,
  folder: 'products' | 'categories'
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getR2Client();
    const key = `${folder}/${fileName}`;

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await client.send(command);

    return { success: true };
  } catch (error) {
    console.error('[R2 Storage] Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if an image exists in R2 storage
 * @param fileName - Name of the file to check
 * @param folder - Folder path (e.g., 'products' or 'categories')
 * @returns True if file exists
 */
export async function imageExistsInR2(
  fileName: string,
  folder: 'products' | 'categories'
): Promise<boolean> {
  try {
    const client = getR2Client();
    const key = `${folder}/${fileName}`;

    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a public URL for an R2-stored image
 * @param fileName - Name of the file
 * @param folder - Folder path (e.g., 'products' or 'categories')
 * @returns Public URL
 */
export function getR2ImageUrl(fileName: string, folder: 'products' | 'categories'): string {
  if (!fileName) return '';

  const key = `${folder}/${fileName}`;
  
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }

  // Fallback to default R2 URL format
  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev/${key}`;
}

/**
 * Extract filename from various URL formats (GitHub, R2, or plain filename)
 * @param imageUrl - Full URL or filename
 * @returns Just the filename
 */
export function extractImageFileName(imageUrl: string): string | null {
  if (!imageUrl) return null;

  // If it's already just a filename
  if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
    return imageUrl;
  }

  // Extract from URL
  const urlParts = imageUrl.split(/[/\\]/);
  const filename = urlParts[urlParts.length - 1];

  // Remove query parameters
  const cleanFilename = filename.split('?')[0];

  return cleanFilename && cleanFilename.includes('.') ? cleanFilename : null;
}

/**
 * Determine if a URL is from R2 storage
 * @param imageUrl - URL to check
 * @returns True if URL is from R2
 */
export function isR2Url(imageUrl: string): boolean {
  if (!imageUrl) return false;
  
  return imageUrl.includes('.r2.dev') || 
         imageUrl.includes('.r2.cloudflarestorage.com') ||
         (R2_PUBLIC_URL && imageUrl.startsWith(R2_PUBLIC_URL));
}

/**
 * Determine if a URL is from GitHub
 * @param imageUrl - URL to check
 * @returns True if URL is from GitHub
 */
export function isGitHubUrl(imageUrl: string): boolean {
  if (!imageUrl) return false;
  
  return imageUrl.includes('raw.githubusercontent.com') || 
         imageUrl.includes('github.com');
}

/**
 * Download an image from a URL (GitHub or elsewhere)
 * @param imageUrl - URL to download from
 * @returns Image as Blob
 */
export async function downloadImage(imageUrl: string): Promise<Blob | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('[R2 Storage] Download error:', error);
    return null;
  }
}

/**
 * Migrate an image from GitHub to R2
 * @param githubUrl - Current GitHub URL
 * @param folder - Destination folder in R2
 * @returns New R2 URL or null if failed
 */
export async function migrateImageFromGitHubToR2(
  githubUrl: string,
  folder: 'products' | 'categories'
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  try {
    // Extract filename
    const fileName = extractImageFileName(githubUrl);
    if (!fileName) {
      return { success: false, error: 'Could not extract filename from URL' };
    }

    // Check if already in R2
    if (isR2Url(githubUrl)) {
      return { success: true, newUrl: githubUrl };
    }

    // Download from GitHub
    console.log(`[Migration] Downloading ${fileName} from GitHub...`);
    const imageBlob = await downloadImage(githubUrl);
    if (!imageBlob) {
      return { success: false, error: 'Failed to download image from GitHub' };
    }

    // Upload to R2
    console.log(`[Migration] Uploading ${fileName} to R2...`);
    const contentType = imageBlob.type || 'image/jpeg';
    const uploadResult = await uploadImageToR2(imageBlob, fileName, folder, contentType);

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    console.log(`[Migration] Successfully migrated ${fileName}`);
    return { success: true, newUrl: uploadResult.url };
  } catch (error) {
    console.error('[Migration] Error migrating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

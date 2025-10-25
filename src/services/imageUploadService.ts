/**
 * Image Upload Service for Return Evidence Photos
 * 
 * This service handles uploading customer evidence photos and admin inspection images
 * to Cloudflare R2 Storage via serverless functions.
 * 
 * Features:
 * - Upload images with automatic compression
 * - Delete images
 * - Generate public URLs
 * - Support for multiple image formats (JPEG, PNG, WebP)
 */

// Image upload configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RETURN_IMAGES_FOLDER = 'returns';

interface UploadImageParams {
  file: File;
  returnRequestId: string;
  imageType: 'customer_evidence' | 'inspection_image';
  itemId?: string;
}

interface UploadImageResponse {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

interface DeleteImageParams {
  fileName: string;
}

/**
 * Validate image file before upload
 */
function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Compress and convert image to base64
 */
async function compressAndConvertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions (max 1920x1920, maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with quality compression (0.8 = 80% quality)
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate unique filename
 */
function generateFileName(returnRequestId: string, imageType: string, itemId?: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const prefix = itemId ? `${returnRequestId}_${itemId}` : returnRequestId;
  return `${prefix}_${imageType}_${timestamp}_${randomStr}.jpg`;
}

/**
 * Upload image to R2 Storage
 */
export async function uploadReturnImage(params: UploadImageParams): Promise<UploadImageResponse> {
  const { file, returnRequestId, imageType, itemId } = params;

  try {
    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Compress and convert to base64
    const base64Data = await compressAndConvertToBase64(file);

    // Generate unique filename
    const fileName = generateFileName(returnRequestId, imageType, itemId);

    // Upload via serverless function
    const response = await fetch('/functions/upload-image-r2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        folder: RETURN_IMAGES_FOLDER,
        imageData: base64Data,
        contentType: 'image/jpeg',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();

    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
    };
  } catch (error) {
    console.error('Error uploading return image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleReturnImages(
  files: File[],
  returnRequestId: string,
  imageType: 'customer_evidence' | 'inspection_image',
  itemId?: string
): Promise<UploadImageResponse[]> {
  const uploadPromises = files.map((file) =>
    uploadReturnImage({
      file,
      returnRequestId,
      imageType,
      itemId,
    })
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete image from R2 Storage
 */
export async function deleteReturnImage(params: DeleteImageParams): Promise<{ success: boolean; error?: string }> {
  const { fileName } = params;

  try {
    const response = await fetch('/functions/delete-image-r2', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        folder: RETURN_IMAGES_FOLDER,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete image');
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting return image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}

/**
 * Delete multiple images
 */
export async function deleteMultipleReturnImages(fileNames: string[]): Promise<void> {
  const deletePromises = fileNames.map((fileName) =>
    deleteReturnImage({ fileName })
  );

  await Promise.all(deletePromises);
}

/**
 * Get public URL for an image
 */
export function getReturnImageUrl(fileName: string): string {
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  if (!publicUrl) {
    console.error('R2_PUBLIC_URL not configured');
    return '';
  }
  return `${publicUrl}/${RETURN_IMAGES_FOLDER}/${fileName}`;
}

/**
 * Extract file name from URL
 */
export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch {
    return null;
  }
}

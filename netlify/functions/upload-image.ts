import { Context } from '@netlify/functions';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Types for the request body
interface UploadImageRequest {
  fileName: string;
  folder: 'products' | 'categories';
  imageData: string; // Base64 encoded image data
  contentType: string;
}

// Helper function to ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Helper function to validate file type
function isValidImageType(contentType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(contentType.toLowerCase());
}

// Helper function to sanitize filename
function sanitizeFileName(fileName: string): string {
  // Remove any path separators and dangerous characters
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export default async (request: Request, context: Context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body: UploadImageRequest = await request.json();
    const { fileName, folder, imageData, contentType } = body;

    // Validate required fields
    if (!fileName || !folder || !imageData || !contentType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: fileName, folder, imageData, contentType' 
        }),
        { status: 400, headers }
      );
    }

    // Validate folder type
    if (folder !== 'products' && folder !== 'categories') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid folder. Must be "products" or "categories"' 
        }),
        { status: 400, headers }
      );
    }

    // Validate image type
    if (!isValidImageType(contentType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' 
        }),
        { status: 400, headers }
      );
    }

    // Sanitize filename and add timestamp for uniqueness
    const sanitizedFileName = sanitizeFileName(fileName);
    const timestamp = Date.now();
    const fileExtension = path.extname(sanitizedFileName) || '.jpg';
    const baseFileName = path.basename(sanitizedFileName, fileExtension);
    const uniqueFileName = `${baseFileName}-${timestamp}${fileExtension}`;

    // Determine the target directory
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'images');
    const targetDir = path.join(imagesDir, folder);
    const targetPath = path.join(targetDir, uniqueFileName);

    // Ensure directories exist
    await ensureDirectoryExists(targetDir);

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Validate file size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (imageBuffer.length > maxSizeBytes) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'File size too large. Maximum size is 10MB' 
        }),
        { status: 400, headers }
      );
    }

    // Write the file
    await fs.writeFile(targetPath, imageBuffer);

    // Generate the public URL
    const publicUrl = `/images/${folder}/${uniqueFileName}`;

    console.log(`[Upload Image] Successfully saved: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        fileName: uniqueFileName,
        publicUrl: publicUrl,
        message: 'Image uploaded successfully'
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('[Upload Image] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers }
    );
  }
};

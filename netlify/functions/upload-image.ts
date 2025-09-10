import { Context } from '@netlify/functions';

// Types for the request body
interface UploadImageRequest {
  fileName: string;
  folder: 'products' | 'categories';
  imageData: string; // Base64 encoded image data
  contentType: string;
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
    
    // Extract file extension
    const fileExtension = sanitizedFileName.includes('.') 
      ? '.' + sanitizedFileName.split('.').pop() 
      : '.jpg';
    
    // Get base filename without extension
    const baseFileName = sanitizedFileName.replace(/\.[^/.]+$/, '') || 'image';
    const uniqueFileName = `${baseFileName}-${timestamp}${fileExtension}`;

    // For Netlify deployment: Since we can't write to public folder during runtime,
    // we'll return the image as a data URL that can be stored directly in the database
    // In a production setup, this would integrate with external storage (S3, Cloudinary, etc.)
    console.log(`[Upload Image] Processing image for Netlify environment: ${uniqueFileName}`);
    
    // Convert base64 to buffer for validation
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

    // Since we can't write to public folder in Netlify serverless environment,
    // return the data URL for database storage (for development/testing)
    // In production, this should be replaced with external storage service
    const dataUrl = imageData.startsWith('data:') ? imageData : `data:${contentType};base64,${base64Data}`;
    const publicUrl = `/images/${folder}/${uniqueFileName}`;

    console.log(`[Upload Image] Returning data URL for: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        fileName: uniqueFileName,
        publicUrl: publicUrl,
        dataUrl: dataUrl, // Include data URL for immediate use
        message: 'Image processed successfully (stored as data URL for Netlify compatibility)'
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

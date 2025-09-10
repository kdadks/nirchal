import { Context } from '@netlify/functions';
import { promises as fs } from 'fs';
import path from 'path';

// Types for the request body
interface DeleteImageRequest {
  fileName: string;
  folder: 'products' | 'categories';
}

export default async (request: Request, context: Context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body: DeleteImageRequest = await request.json();
    const { fileName, folder } = body;

    // Validate required fields
    if (!fileName || !folder) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: fileName, folder' 
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

    // Sanitize the filename to prevent path traversal attacks
    const sanitizedFileName = path.basename(fileName);
    
    // Construct the file path
    const publicDir = path.join(process.cwd(), 'public');
    const targetPath = path.join(publicDir, 'images', folder, sanitizedFileName);

    // Check if file exists
    try {
      await fs.access(targetPath);
    } catch {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'File not found' 
        }),
        { status: 404, headers }
      );
    }

    // Delete the file
    await fs.unlink(targetPath);

    console.log(`[Delete Image] Successfully deleted: /images/${folder}/${sanitizedFileName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Image deleted successfully',
        deletedFile: `/images/${folder}/${sanitizedFileName}`
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('[Delete Image] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers }
    );
  }
};

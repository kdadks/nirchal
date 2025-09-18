import { Context } from '@netlify/functions';

// In-memory storage for development (should match upload-image.ts)
const imageStore = new Map<string, string>();

export default async (request: Request, context: Context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const url = new URL(request.url);
    const imagePath = url.searchParams.get('path');

    if (!imagePath) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing image path parameter' 
        }),
        { status: 400, headers }
      );
    }

    // Remove leading slash and /images/ prefix if present
    const cleanPath = imagePath.replace(/^\/?(images\/)?/, '');
    
    const dataUrl = imageStore.get(cleanPath);

    if (!dataUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Image not found' 
        }),
        { status: 404, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        dataUrl: dataUrl
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('[Get Image] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers }
    );
  }
};

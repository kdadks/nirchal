// Cloudflare Pages Function for deleting images from R2
// Path: /functions/delete-image-r2

interface Env {
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
  PRODUCT_IMAGES: any; // R2 bucket binding
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  };

  try {
    // Parse request body
    const body = await request.json() as {
      fileName: string;
      folder: string;
    };

    const { fileName, folder } = body;

    if (!fileName || !folder) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileName, folder' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate folder
    if (!['products', 'categories', 'returns'].includes(folder)) {
      return new Response(
        JSON.stringify({ error: 'Invalid folder. Must be "products", "categories", or "returns"' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Delete from R2 using binding
    const key = `${folder}/${fileName}`;
    
    try {
      await env.PRODUCT_IMAGES.delete(key);
      console.log(`[Delete R2] Successfully deleted: ${fileName}`);
    } catch (deleteError) {
      // If file doesn't exist, treat as success
      console.log(`[Delete R2] File not found or already deleted: ${fileName}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileName: fileName,
        folder: folder,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[Delete R2] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    },
  });
}

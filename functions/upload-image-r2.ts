// Cloudflare Pages Function for uploading images to R2
// Path: /functions/upload-image-r2

interface Env {
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
  PRODUCT_IMAGES: any; // R2 bucket binding
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  try {
    // Parse request body
    const body = await request.json() as {
      fileName: string;
      folder: string;
      imageData: string;
      contentType?: string;
    };

    const { fileName, folder, imageData, contentType } = body;

    if (!fileName || !folder || !imageData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileName, folder, imageData' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate folder
    if (!['products', 'categories'].includes(folder)) {
      return new Response(
        JSON.stringify({ error: 'Invalid folder. Must be "products" or "categories"' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to R2 using binding
    const key = `${folder}/${fileName}`;
    
    await env.PRODUCT_IMAGES.put(key, bytes, {
      httpMetadata: {
        contentType: contentType || 'image/jpeg',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    // Generate public URL
    const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;

    console.log(`[Upload R2] Successfully uploaded: ${fileName} to ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        fileName: fileName,
        folder: folder,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[Upload R2] Error:', error);
    
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

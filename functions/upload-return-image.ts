/**
 * Cloudflare Function to upload return request images to R2
 * This keeps R2 credentials secure on the server side
 */

interface Env {
  R2_BUCKET: R2Bucket;
  R2_ACCOUNT_ID: string;
  R2_PUBLIC_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const folder = formData.get('folder') as string;

    if (!file || !fileName || !folder) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: file, fileName, or folder' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate folder
    if (!['products', 'categories', 'returns'].includes(folder)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid folder. Must be products, categories, or returns' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create the full key (path) for R2
    const key = `${folder}/${fileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2
    await context.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    // Generate public URL
    const publicUrl = context.env.R2_PUBLIC_URL 
      ? `${context.env.R2_PUBLIC_URL}/${key}`
      : `https://product-images.${context.env.R2_ACCOUNT_ID}.r2.dev/${key}`;

    return new Response(JSON.stringify({ 
      success: true, 
      url: publicUrl 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

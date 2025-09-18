import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { imageUrl } = JSON.parse(event.body || '{}');

    if (!imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Image URL is required' }),
      };
    }

    // Validate that the URL is from an allowed domain (security measure)
    const allowedDomains = [
      'cdn.shopify.com',
      'images.unsplash.com',
      'example.com', // Add other trusted domains as needed
    ];

    const url = new URL(imageUrl);
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname.endsWith(domain)
    );

    if (!isAllowedDomain) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Domain not allowed' }),
      };
    }

    // Download the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get the image as a buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Convert to base64 for transmission
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        imageData: base64Image,
        contentType: contentType,
        originalUrl: imageUrl,
      }),
    };
  } catch (error) {
    console.error('Error downloading image:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

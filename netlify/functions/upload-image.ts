import { Context } from '@netlify/functions';

// Types for the request body
interface UploadImageRequest {
  fileName: string;
  folder: 'products' | 'categories';
  imageData: string; // Base64 encoded image data
  contentType: string;
}

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'kdadks';
const REPO_NAME = 'nirchal';
const BRANCH = 'main';

// Helper function to validate file type
function isValidImageType(contentType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(contentType.toLowerCase());
}

// Helper function to sanitize filename
function sanitizeFileName(fileName: string): string {
  // Remove query parameters first
  const cleanName = fileName.split('?')[0];
  
  // Extract the actual filename if it's a URL
  const nameParts = cleanName.split('/');
  const actualFileName = nameParts[nameParts.length - 1];
  
  // Remove any path separators and dangerous characters, keep dots and hyphens
  return actualFileName.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/--+/g, '-');
}

// Helper function to upload file to GitHub repository
async function uploadToGitHub(
  filePath: string,
  content: string,
  message: string,
  token: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // First, try to get the existing file to get its SHA (if it exists)
    let sha: string | undefined;
    try {
      const getResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Netlify-Function'
          }
        }
      );
      
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File doesn't exist, which is fine for new uploads
    }

    // Create or update the file
    const createData: any = {
      message,
      content,
      branch: BRANCH
    };

    if (sha) {
      createData.sha = sha;
    }

    const createResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Netlify-Function'
        },
        body: JSON.stringify(createData)
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      throw new Error(`GitHub API error: ${createResponse.status} - ${errorData}`);
    }

    const result = await createResponse.json();
    
    return {
      success: true,
      url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown GitHub API error'
    };
  }
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

    // Check for GitHub token
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.' 
        }),
        { status: 500, headers }
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
    
    // Get base filename without extension and remove any existing timestamps
    let baseFileName = sanitizedFileName.replace(/\.[^/.]+$/, '') || 'image';
    
    // Remove any existing timestamp patterns (numbers at the end)
    baseFileName = baseFileName.replace(/-\d{13,}.*$/, '');
    
    const uniqueFileName = `${baseFileName}-${timestamp}${fileExtension}`;

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

    // Upload to GitHub repository
    const filePath = `public/images/${folder}/${uniqueFileName}`;
    const commitMessage = `Add product image: ${uniqueFileName}`;
    
    console.log(`[Upload Image] Uploading to GitHub: ${filePath}`);
    
    const uploadResult = await uploadToGitHub(
      filePath,
      base64Data,
      commitMessage,
      githubToken
    );

    if (!uploadResult.success) {
      console.error('[Upload Image] GitHub upload failed:', uploadResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to upload to GitHub: ${uploadResult.error}`
        }),
        { status: 500, headers }
      );
    }

    const publicUrl = `/images/${folder}/${uniqueFileName}`;
    const githubUrl = uploadResult.url;

    console.log(`[Upload Image] Successfully uploaded to GitHub: ${githubUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        fileName: uniqueFileName,
        publicUrl: publicUrl,
        githubUrl: githubUrl,
        message: 'Image uploaded successfully to GitHub repository'
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

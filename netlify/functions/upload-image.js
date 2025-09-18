// GitHub upload with retry logic for SHA conflicts
// Converted to JavaScript to avoid TypeScript type issues in Netlify functions

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'kdadks';
const REPO_NAME = 'nirchal';
const BRANCH = 'main';

// Helper function to validate file type
function isValidImageType(contentType) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(contentType.toLowerCase());
}

// Helper function to sanitize filename
function sanitizeFileName(fileName) {
  const cleanName = fileName.split('?')[0];
  const nameParts = cleanName.split('/');
  const actualFileName = nameParts[nameParts.length - 1];
  return actualFileName.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/--+/g, '-');
}

// Helper function to upload file to GitHub repository with retry logic
async function uploadToGitHub(filePath, content, message, token, maxRetries = 3) {
  
  const attemptUpload = async (retryCount = 0) => {
    try {
      console.log(`[GitHub Upload] Attempt ${retryCount + 1}/${maxRetries + 1} for: ${filePath}`);
      
      // Get fresh SHA on each attempt to handle concurrent updates
      let sha;
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
          console.log(`[GitHub Upload] File exists, using fresh SHA: ${sha}`);
        } else if (getResponse.status === 404) {
          console.log(`[GitHub Upload] File doesn't exist, creating new file`);
        } else {
          console.log(`[GitHub Upload] Unexpected status checking file: ${getResponse.status}`);
        }
      } catch (e) {
        console.log(`[GitHub Upload] Error checking file existence:`, e);
      }

      // Create or update the file
      const createData = {
        message,
        content,
        branch: BRANCH
      };

      if (sha) {
        createData.sha = sha;
      }

      console.log(`[GitHub Upload] Making PUT request to GitHub API (attempt ${retryCount + 1})...`);
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

      console.log(`[GitHub Upload] GitHub API response status: ${createResponse.status}`);

      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        console.error(`[GitHub Upload] GitHub API error: ${createResponse.status} - ${errorData}`);
        
        // Handle SHA conflict specifically
        if (createResponse.status === 409 && retryCount < maxRetries) {
          console.log(`[GitHub Upload] SHA conflict detected, retrying with fresh SHA...`);
          // Wait with exponential backoff before retry
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptUpload(retryCount + 1);
        }
        
        throw new Error(`GitHub API error: ${createResponse.status} - ${errorData}`);
      }

      await createResponse.json(); // Consume the response
      console.log(`[GitHub Upload] Upload successful, file URL: https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`);
      
      return {
        success: true,
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`
      };
    } catch (error) {
      if (retryCount < maxRetries && error instanceof Error && error.message.includes('409')) {
        console.log(`[GitHub Upload] Retrying due to conflict (attempt ${retryCount + 1}/${maxRetries + 1})`);
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptUpload(retryCount + 1);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown GitHub API error'
      };
    }
  };

  return attemptUpload();
}

export default async (request, context) => {
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
    const body = await request.json();
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
    console.log('[Upload Debug] GitHub token available:', !!githubToken);
    if (!githubToken) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'GitHub token not configured' 
        }),
        { status: 500, headers }
      );
    }

    // Validate file type
    if (!isValidImageType(contentType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid file type: ${contentType}. Allowed types: JPEG, PNG, WebP, GIF` 
        }),
        { status: 400, headers }
      );
    }

    // Sanitize filename
    const sanitizedFileName = sanitizeFileName(fileName);
    console.log(`[Upload Debug] Original filename: ${fileName}`);
    console.log(`[Upload Debug] Sanitized filename: ${sanitizedFileName}`);

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = imageData.includes(',') 
      ? imageData.split(',')[1] 
      : imageData;

    // Validate base64 data
    try {
      const imageBuffer = Buffer.from(base64Data, 'base64');
      console.log(`[Upload Debug] Image size: ${imageBuffer.length} bytes`);
      
      if (imageBuffer.length > 5 * 1024 * 1024) { // 5MB limit
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'File size too large. Maximum size is 5MB.' 
          }),
          { status: 400, headers }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid base64 image data' 
        }),
        { status: 400, headers }
      );
    }

    // Upload to GitHub with retry logic
    const githubPath = `public/images/${folder}/${sanitizedFileName}`;
    const uploadResult = await uploadToGitHub(
      githubPath,
      base64Data,
      `Upload ${folder} image: ${sanitizedFileName}`,
      githubToken
    );

    if (!uploadResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: uploadResult.error || 'Failed to upload to GitHub'
        }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: `/images/${folder}/${sanitizedFileName}`,
        githubUrl: uploadResult.url,
        message: 'Image uploaded successfully'
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('[Upload] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { status: 500, headers }
    );
  }
};
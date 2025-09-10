import { Context } from '@netlify/functions';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'kdadks';
const REPO_NAME = 'nirchal';
const BRANCH = 'main';

// Types for the request body
interface DeleteImageRequest {
  fileName: string;
  folder: 'products' | 'categories';
  filePaths?: string[]; // For bulk deletion
}

// Helper function to delete file from GitHub repository
async function deleteFromGitHub(
  filePath: string,
  message: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, get the file to get its SHA
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

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        return { success: false, error: 'File not found' };
      }
      throw new Error(`GitHub API error: ${getResponse.status}`);
    }

    const fileData = await getResponse.json();
    const sha = fileData.sha;

    // Delete the file
    const deleteResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Netlify-Function'
        },
        body: JSON.stringify({
          message,
          sha,
          branch: BRANCH
        })
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.text();
      throw new Error(`GitHub API error: ${deleteResponse.status} - ${errorData}`);
    }

    return { success: true };
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
    'Access-Control-Allow-Methods': 'DELETE, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== 'DELETE' && request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body: DeleteImageRequest = await request.json();
    const { fileName, folder, filePaths } = body;

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

    // Handle bulk deletion (for cleanup)
    if (filePaths && Array.isArray(filePaths)) {
      const results: Array<{
        filePath: string;
        success: boolean;
        error?: string;
      }> = [];
      
      for (const filePath of filePaths) {
        const deleteResult = await deleteFromGitHub(
          filePath,
          `Delete problematic image: ${filePath}`,
          githubToken
        );
        
        results.push({
          filePath,
          success: deleteResult.success,
          error: deleteResult.error
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return new Response(
        JSON.stringify({
          success: failCount === 0,
          message: `Deleted ${successCount} files, ${failCount} failed`,
          results
        }),
        { status: 200, headers }
      );
    }

    // Handle single file deletion
    if (!fileName || !folder) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: fileName and folder' 
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

    const filePath = `public/images/${folder}/${fileName}`;
    const commitMessage = `Delete image: ${fileName}`;
    
    console.log(`[Delete Image] Deleting from GitHub: ${filePath}`);
    
    const deleteResult = await deleteFromGitHub(
      filePath,
      commitMessage,
      githubToken
    );

    if (!deleteResult.success) {
      console.error('[Delete Image] GitHub deletion failed:', deleteResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to delete from GitHub: ${deleteResult.error}`
        }),
        { status: 500, headers }
      );
    }

    console.log(`[Delete Image] Successfully deleted from GitHub: ${filePath}`);

    return new Response(
      JSON.stringify({
        success: true,
        deletedFile: filePath,
        message: 'Image deleted successfully from GitHub repository'
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

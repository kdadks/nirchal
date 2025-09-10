# GitHub API Integration Setup

This application now supports automatic image uploads to the GitHub repository during CSV import operations. Images are committed directly to the repository and can be accessed via GitHub URLs.

## Required Environment Variables

### GITHUB_TOKEN

A GitHub Personal Access Token is required for the upload function to commit images to the repository.

#### Creating a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set the following scopes:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
4. Copy the generated token

#### Setting up in Netlify:

1. Go to your Netlify dashboard
2. Navigate to your site → Site settings → Environment variables
3. Add a new environment variable:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: Your GitHub Personal Access Token
   - **Scopes**: All scopes (or specific deploy contexts as needed)

## How it Works

1. During CSV import, when images are processed:
   - Images are uploaded via the `upload-image.ts` Netlify function
   - The function uses GitHub's API to commit the image directly to the repository
   - Images are stored in `public/images/products/` or `public/images/categories/`
   - The function returns both a local URL and a GitHub URL

2. Image URLs:
   - **Local URL**: `/images/products/filename.jpg` (for serving from your site)
   - **GitHub URL**: `https://github.com/kdadks/nirchal/blob/main/public/images/products/filename.jpg`

## File Structure

Images are organized as follows:
```
public/
  images/
    products/
      product-name-timestamp.jpg
    categories/
      category-name-timestamp.jpg
```

## Benefits

- **Persistent Storage**: Images are permanently stored in your repository
- **Version Control**: All image changes are tracked in Git history
- **CDN Ready**: GitHub serves files with proper caching headers
- **Backup**: Images are backed up with your code repository
- **Direct Access**: Images can be accessed directly via GitHub URLs

## Error Handling

If the `GITHUB_TOKEN` environment variable is not set, the upload function will return an error. Make sure to configure this before attempting CSV imports with images.

## Security Notes

- Keep your GitHub token secure and never commit it to your repository
- Use environment variables to store the token
- Consider using a dedicated service account or bot user for automated operations
- Regularly rotate your tokens for security

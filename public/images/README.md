# Images Directory

This directory contains static and dynamic images for the Nirchal e-commerce platform.

## Directory Structure

- `payment/` - Static payment method icons (tracked in Git)
- `products/` - Dynamic product images uploaded by admin (ignored by Git)
- `categories/` - Dynamic category images uploaded by admin (ignored by Git)

## Git Configuration

- **Static images** (like payment icons, hero images, favicon) are tracked in Git
- **Dynamic images** (product and category uploads) are ignored via `.gitignore`
- This prevents unwanted commits when admins upload new product images

## Notes

- Product images are saved locally and served from the public directory
- Images are automatically renamed with timestamps to prevent conflicts
- The server handles image optimization and storage

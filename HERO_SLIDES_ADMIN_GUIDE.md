# Hero Slides Admin Management Guide

## Overview
The Hero Slides Admin interface allows you to create, edit, and delete hero carousel slides that appear on the homepage.

## Accessing the Admin Interface
Navigate to: `http://localhost:5173/admin/hero-slides`

## Features

### ✅ Create New Slides
- Click "Add New Slide" button in the top-right corner
- Fill out the form with slide details
- Click "Create Slide" to save

### ✅ Edit Existing Slides
- Click the edit (pencil) icon next to any slide
- Modify the slide details in the form
- Click "Update Slide" to save changes

### ✅ Delete Slides
- Click the delete (trash) icon next to any slide
- Confirm deletion in the popup modal
- The slide will be permanently removed

### ✅ Toggle Visibility
- Click the eye icon to show/hide slides
- Active slides appear on the homepage
- Hidden slides are saved but not displayed

## Form Fields

### Required Fields
- **Title**: Main heading text for the slide
- **Image URL**: Direct link to the hero image
- **Display Order**: Numerical order for slide sequence

### Optional Fields
- **Subtitle**: Secondary text below the title
- **CTA Text**: Call-to-action button text (e.g., "Shop Now")
- **CTA Link**: URL for the call-to-action button
- **Active Status**: Checkbox to enable/disable the slide

## Image Requirements

### Optimal Dimensions
- **Recommended**: 1920×1080px (16:9 aspect ratio)
- **Minimum**: 1200×675px
- **Maximum**: 3840×2160px

### File Guidelines
- **Size**: Keep under 500KB for optimal loading
- **Format**: JPEG or WebP preferred
- **Design Tip**: Keep important content in the left 60% of the image

## Usage Tips

1. **Display Order**: Use sequential numbers (1, 2, 3, etc.) to control slide order
2. **Content Placement**: Keep text and important elements on the left side of images
3. **File Optimization**: Compress images before uploading to ensure fast loading
4. **Testing**: Use the toggle visibility feature to preview slides before making them live

## Example Values

```
Title: "Summer Collection 2024"
Subtitle: "Discover the latest trends in ethnic wear"
Image URL: "https://example.com/summer-collection.jpg"
CTA Text: "Shop Now"
CTA Link: "/products?category=summer"
Display Order: 1
Active: ✓ (checked)
```

## Troubleshooting

### Common Issues
- **Images not loading**: Verify the image URL is accessible and points to a valid image file
- **Slides not appearing**: Check that the slide is marked as "Active"
- **Order not correct**: Ensure display_order values are unique and sequential

### Error Messages
- If you see an error after submitting, check that all required fields are filled
- Network errors may indicate connectivity issues with the database

## Technical Notes

- Changes are saved immediately to the database
- The homepage hero carousel updates automatically when slides are modified
- Deleted slides cannot be recovered - use the visibility toggle instead if you want to temporarily hide a slide
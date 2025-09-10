/**
 * Cleanup script to delete problematic images from GitHub repository
 * Run this script to remove images with malformed filenames
 */

// List of problematic image files to delete
const PROBLEMATIC_FILES = [
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495590811-1-1757495592478.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495594633-2-1757495595416.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495597491-3-1757495597980.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495599821-4-1757495600430.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495602374-5-1757495603119.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495605012-6-1757495605846.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495607836-7-1757495608551.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495610439-8-1757495611076.jpg_v_1752047898',
  'public/images/products/premium-designer-readymade-embroidered-gown-1757495613013-9-1757495613613.jpg_v_1752047898',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495615865-1-1757495616521.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495618458-2-1757495619192.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495621107-3-1757495621875.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495623704-4-1757495624605.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495626524-5-1757495628096.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495629990-6-1757495630713.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495632503-7-1757495633451.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495635330-8-1757495636262.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495638114-9-1757495638986.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495640780-10-1757495641548.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495643472-11-1757495644411.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495646355-12-1757495647260.jpg_v_1751972344',
  'public/images/products/premium-readymade-designer-embroidered-gown-1757495649413-13-1757495651663.jpg_v_1751972344'
];

/**
 * Function to clean up problematic images
 * Call this from your admin panel or run as a script
 */
export async function cleanupProblematicImages(): Promise<{
  success: boolean;
  message: string;
  results?: Array<{ filePath: string; success: boolean; error?: string }>;
}> {
  try {
    const response = await fetch('/.netlify/functions/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePaths: PROBLEMATIC_FILES
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Cleanup failed');
    }

    console.log(`[Image Cleanup] ${result.message}`);
    
    return {
      success: true,
      message: result.message,
      results: result.results
    };
    
  } catch (error) {
    console.error('[Image Cleanup] Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Manual trigger function for cleanup
 * You can call this from browser console or admin interface
 */
if (typeof window !== 'undefined') {
  (window as any).cleanupProblematicImages = cleanupProblematicImages;
}

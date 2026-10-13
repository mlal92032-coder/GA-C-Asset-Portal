/**
 * Image upload helper - uses file-based storage instead of base64 in DB
 *
 * Uploads images to prisma/uploads/ and stores relative paths in the DB.
 * Images are served via the /api/upload-image endpoint.
 */

/**
 * Build a display URL for an image path (synchronous)
 * Works directly in JSX without async/await
 *
 * @param imagePath - The value stored in imageUrl (data URL, external URL, or /uploads/ path)
 * @returns A display-ready URL for use in <img src=...>
 */
export function buildImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  // Already a data URL or external URL
  if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
    return imagePath;
  }

  // Path like "uploads/filename.jpg" or "/uploads/filename.jpg" - serve directly from public/
  const fileName = imagePath.replace(/^\/?uploads\//, '').replace(/^\/+/, '');
  return `/uploads/${fileName}`;
}

/**
 * Upload an image file to the server
 * @param file - The File object from an input element
 * @returns The relative path to store in the database, or null if no file
 */
export async function uploadImage(file: File): Promise<string | null> {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();

  if (!json.success) {
    console.error('Upload failed:', json.error);
    throw new Error(json.error || 'Failed to upload image');
  }

  return json.data.filePath;
}

/**
 * Get the display URL for an image stored in the DB
 * If the path is a data URL (legacy), return it directly
 * If the path is a relative path (new format), fetch via API
 *
 * @param imagePath - The value stored in imageUrl (data URL or relative path)
 * @returns Promise resolving to the display URL (data URL or /api/upload-image path)
 */
export async function getImageUrl(imagePath: string | null | undefined): Promise<string | null> {
  if (!imagePath) return null;

  // Legacy base64 data URL
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // External URL (shouldn't happen but handle it)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // New format: relative path like "/uploads/filename.jpg" or "uploads/filename.jpg"
  // Return the API endpoint to fetch it
  const fileName = imagePath.replace(/^\/?uploads\//, '');
  return `/api/upload-image?file=${encodeURIComponent(fileName)}`;
}

/**
 * Convert a stored path to a direct data URL for display
 * Useful when loading asset details that have relative paths
 */
export async function resolveImageUrl(imagePath: string | null | undefined): Promise<string | null> {
  if (!imagePath) return null;

  // Already a data URL
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // External URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Fetch from our API
  const fileName = imagePath.replace(/^\/?uploads\//, '');
  try {
    const res = await fetch(`/api/upload-image?file=${encodeURIComponent(fileName)}`);
    const json = await res.json();
    if (json.success) {
      return json.data.dataUrl;
    }
  } catch (err) {
    console.error('Failed to resolve image:', err);
  }

  return null;
}

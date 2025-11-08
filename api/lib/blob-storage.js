// Vercel Blob Storage utilities
import { put, del, list } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob Storage
 * @param {Object} file - The file object with buffer
 * @param {string} groupId - Group ID for organization
 * @returns {Promise<{url: string, pathname: string}>}
 */
export async function uploadFile(file, groupId) {
  try {
    const pathname = `${groupId}/${file.name}`;
    
    // Upload buffer to Vercel Blob
    const blob = await put(pathname, file.buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    });

    console.log(`[Blob] Uploaded: ${file.name} → ${blob.url}`);

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
    };
  } catch (error) {
    console.error('[Blob] Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete a file from Vercel Blob Storage
 * @param {string} url - The blob URL to delete
 */
export async function deleteFile(url) {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Error deleting file from Blob:', error);
    return false;
  }
}

/**
 * Delete all files in a group
 * @param {string} groupId - Group ID
 */
export async function deleteGroupFiles(groupId) {
  try {
    const { blobs } = await list({
      prefix: `${groupId}/`,
    });

    // Delete all blobs with this prefix
    const deletePromises = blobs.map(blob => del(blob.url));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error deleting group files:', error);
    return false;
  }
}

/**
 * Get file URL for download
 * @param {string} groupId - Group ID
 * @param {string} filename - Filename
 * @param {Array} groups - All groups data
 */
export function getFileUrl(groupId, filename, groups) {
  const group = groups.find(g => g.id === groupId);
  if (!group) return null;
  
  const file = group.files.find(f => f.name === filename);
  if (!file) return null;
  
  return file.url;
}

// POST /api/upload - Upload new files and create a new group
import { parseMultipartForm, cleanupTempFiles } from './lib/multipart.js';
import { addGroup } from './lib/storage.js';
import { uploadFile } from './lib/blob-storage.js';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for multipart form
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let parsedFiles = null;

  try {
    // Parse multipart form data
    const { fields, files } = await parseMultipartForm(req);
    parsedFiles = files;
    
    const groupName = fields.groupName || 'Kelompok Tanpa Nama';
    const uploadedFiles = files.files || [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Generate group ID
    const groupId = uuidv4();

    console.log(`[Upload] Creating new group: ${groupId}`);
    console.log(`[Upload] Group name: ${groupName}`);
    console.log(`[Upload] Number of files: ${uploadedFiles.length}`);

    // Upload all files to Vercel Blob Storage
    const uploadPromises = uploadedFiles.map(file => 
      uploadFile(file, groupId)
    );
    
    const uploadedBlobs = await Promise.all(uploadPromises);

    // Calculate total size
    const totalSize = uploadedBlobs.reduce((sum, blob) => sum + blob.size, 0);

    // Create group object - files are permanent until manually deleted
    const group = {
      id: groupId,
      name: groupName,
      uploadedAt: new Date().toISOString(),
      files: uploadedBlobs.map((blob, index) => ({
        name: uploadedFiles[index].name,
        size: blob.size,
        url: blob.url,
        pathname: blob.pathname,
      })),
      totalSize,
    };

    // Save to KV storage
    await addGroup(group);

    console.log(`[Upload] Group created successfully: ${groupId}`);

    // Cleanup temp files
    cleanupTempFiles(parsedFiles);

    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.error('[Upload] Error:', error);
    
    // Cleanup temp files on error too
    if (parsedFiles) {
      cleanupTempFiles(parsedFiles);
    }
    
    return res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
}

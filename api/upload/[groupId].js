// POST /api/upload/[groupId] - Add files to existing group
import { parseMultipartForm, cleanupTempFiles } from '../lib/multipart.js';
import { getGroupById, updateGroup } from '../lib/storage.js';
import { uploadFile } from '../lib/blob-storage.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId } = req.query;
  let parsedFiles = null;

  try {
    // Check if group exists
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
    }

    // Parse form data
    const { files } = await parseMultipartForm(req);
    parsedFiles = files;
    const uploadedFiles = files.files || [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }

    console.log(`[Upload] Adding files to group: ${groupId}`);
    console.log(`[Upload] Number of new files: ${uploadedFiles.length}`);

    // Upload new files to Blob Storage
    const uploadPromises = uploadedFiles.map(file => 
      uploadFile(file, groupId)
    );
    
    const uploadedBlobs = await Promise.all(uploadPromises);

    // Add new files to group
    const newFiles = uploadedBlobs.map((blob, index) => ({
      name: uploadedFiles[index].name,
      size: blob.size,
      url: blob.url,
      pathname: blob.pathname,
    }));

    const updatedFiles = [...group.files, ...newFiles];
    const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);

    // Update group
    const updatedGroup = await updateGroup(groupId, {
      files: updatedFiles,
      totalSize,
    });

    console.log(`[Upload] Files added successfully to group: ${groupId}`);

    // Cleanup temp files
    cleanupTempFiles(parsedFiles);

    return res.status(200).json({ success: true, group: updatedGroup });
  } catch (error) {
    console.error('[Upload] Error:', error);
    
    // Cleanup temp files on error too
    if (parsedFiles) {
      cleanupTempFiles(parsedFiles);
    }
    
    return res.status(500).json({ 
      error: 'Gagal menambahkan file',
      message: error.message 
    });
  }
}

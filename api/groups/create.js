// POST /api/groups/create - Create group after client-side upload
import { addGroup } from '../lib/storage.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { groupName, files } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Generate group ID
    const groupId = uuidv4();
    
    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Create group object
    const group = {
      id: groupId,
      name: groupName || 'Kelompok Tanpa Nama',
      uploadedAt: new Date().toISOString(),
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        url: file.url,
        pathname: file.pathname,
      })),
      totalSize,
    };

    // Save to KV storage
    await addGroup(group);

    console.log(`[Create] Group created successfully: ${groupId}`);

    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.error('[Create] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to create group',
      message: error.message 
    });
  }
}

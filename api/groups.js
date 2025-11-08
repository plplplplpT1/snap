// GET /api/groups - Get all file groups (permanent until manually deleted)
import { getAllGroups } from './lib/storage.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const groups = await getAllGroups();
    
    // Return groups without sensitive data
    const publicGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      uploadedAt: group.uploadedAt,
      fileCount: group.files.length,
      totalSize: group.totalSize,
      files: group.files.map(f => ({ 
        name: f.name, 
        size: f.size 
      }))
    }));

    return res.status(200).json({ groups: publicGroups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
}

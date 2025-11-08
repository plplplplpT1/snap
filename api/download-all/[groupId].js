// GET /api/download-all/[groupId] - Download all files as ZIP
import { getGroupById } from '../lib/storage.js';
import archiver from 'archiver';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId } = req.query;

  try {
    console.log(`[Download All] Request for group: ${groupId}`);

    // Get group from storage
    const group = await getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.files || group.files.length === 0) {
      return res.status(404).json({ error: 'No files in group' });
    }

    const zipName = `${group.name.replace(/[^a-z0-9]/gi, '_')}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', {
      store: true // No compression
    });

    archive.on('error', (err) => {
      console.error('[Download All] Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });

    archive.pipe(res);

    // Download each file from blob storage and add to archive
    for (const file of group.files) {
      try {
        console.log(`[Download All] Fetching file: ${file.name}`);
        const response = await axios.get(file.url, {
          responseType: 'arraybuffer'
        });
        
        archive.append(Buffer.from(response.data), { name: file.name });
      } catch (error) {
        console.error(`[Download All] Error fetching file ${file.name}:`, error);
        // Continue with other files
      }
    }

    await archive.finalize();
    
    console.log(`[Download All] ZIP created successfully for group: ${groupId}`);
  } catch (error) {
    console.error('[Download All] Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Download failed' });
    }
  }
}

// GET /api/download/[groupId]/[filename] - Download single file
import { getGroupById } from '../../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId, filename } = req.query;
  const decodedFilename = decodeURIComponent(filename);

  try {
    console.log(`[Download] Request for file: ${decodedFilename} in group: ${groupId}`);

    // Get group from storage
    const group = await getGroupById(groupId);
    
    if (!group) {
      console.log('[Download] Group not found');
      return res.status(404).json({ error: 'Group not found' });
    }

    // Find file in group
    const file = group.files.find(f => f.name === decodedFilename);
    
    if (!file) {
      console.log('[Download] File not found in group');
      return res.status(404).json({ error: 'File not found' });
    }

    console.log(`[Download] Fetching file from blob: ${file.url}`);

    // Fetch file from Vercel Blob
    const response = await fetch(file.url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Get file buffer
    const buffer = await response.arrayBuffer();
    
    // Detect content type from file extension or use blob content-type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Set headers to force download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(decodedFilename)}"`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Send file
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('[Download] Error:', error);
    return res.status(500).json({ error: 'Download failed' });
  }
}

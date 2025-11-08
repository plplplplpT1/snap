// DELETE /api/groups/[groupId] - Delete a group and its files
import { getGroupById, deleteGroup } from '../lib/storage.js';
import { deleteGroupFiles } from '../lib/blob-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId } = req.query;

  try {
    console.log(`[Delete] Request to delete group: ${groupId}`);

    // Get group from storage
    const group = await getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
    }

    // Delete all files from Blob Storage
    console.log(`[Delete] Deleting files from blob storage...`);
    await deleteGroupFiles(groupId);

    // Delete group metadata from KV
    console.log(`[Delete] Deleting group metadata...`);
    await deleteGroup(groupId);

    console.log(`[Delete] Group deleted successfully: ${group.name}`);

    return res.status(200).json({ 
      success: true, 
      message: 'Kelompok berhasil dihapus' 
    });
  } catch (error) {
    console.error('[Delete] Error:', error);
    return res.status(500).json({ error: 'Gagal menghapus kelompok' });
  }
}

// Vercel KV Storage for metadata
import { kv } from '@vercel/kv';

// Storage keys
const GROUPS_KEY = 'snapaja:groups';

/**
 * Get all groups from KV storage
 */
export async function getAllGroups() {
  try {
    const groups = await kv.get(GROUPS_KEY);
    return groups || [];
  } catch (error) {
    console.error('Error getting groups from KV:', error);
    return [];
  }
}

/**
 * Save groups to KV storage
 */
export async function saveGroups(groups) {
  try {
    await kv.set(GROUPS_KEY, groups);
    return true;
  } catch (error) {
    console.error('Error saving groups to KV:', error);
    return false;
  }
}

/**
 * Get a single group by ID
 */
export async function getGroupById(groupId) {
  const groups = await getAllGroups();
  return groups.find(g => g.id === groupId);
}

/**
 * Add a new group
 */
export async function addGroup(group) {
  const groups = await getAllGroups();
  groups.push(group);
  await saveGroups(groups);
  return group;
}

/**
 * Update an existing group
 */
export async function updateGroup(groupId, updates) {
  const groups = await getAllGroups();
  const index = groups.findIndex(g => g.id === groupId);
  
  if (index === -1) {
    throw new Error('Group not found');
  }
  
  groups[index] = { ...groups[index], ...updates };
  await saveGroups(groups);
  return groups[index];
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId) {
  const groups = await getAllGroups();
  const filtered = groups.filter(g => g.id !== groupId);
  await saveGroups(filtered);
  return true;
}

// Expiration functions removed - files are now permanent until manually deleted
// Groups will persist until user deletes them via DELETE /api/groups/[groupId]

// Multipart form parser for Vercel serverless functions
import formidable from 'formidable';
import fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Parse multipart form data
 * @param {Request} req - Incoming request
 * @returns {Promise<{fields: object, files: object}>}
 */
export async function parseMultipartForm(req) {
  // Use /tmp directory for Vercel serverless
  const uploadDir = join(tmpdir(), 'uploads');
  
  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    maxFileSize: 1024 * 1024 * 1024, // 1GB
    maxFiles: 100,
    maxFields: 100,
    keepExtensions: true,
    multiples: true,
    uploadDir: uploadDir,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Normalize fields (formidable v3 returns arrays)
        const normalizedFields = {};
        for (const key in fields) {
          normalizedFields[key] = Array.isArray(fields[key]) 
            ? fields[key][0] 
            : fields[key];
        }

        // Normalize files
        const normalizedFiles = {};
        for (const key in files) {
          const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]];
          
          normalizedFiles[key] = await Promise.all(fileArray.map(async (file) => {
            // Read file content as buffer
            const buffer = fs.readFileSync(file.filepath);
            
            // Create a File-like object for Vercel Blob
            const fileObj = {
              name: file.originalFilename || file.newFilename,
              size: file.size,
              type: file.mimetype || 'application/octet-stream',
              buffer: buffer,
              filepath: file.filepath, // Keep for cleanup
            };

            return fileObj;
          }));
        }

        resolve({
          fields: normalizedFields,
          files: normalizedFiles,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Clean up temporary files
 */
export function cleanupTempFiles(files) {
  try {
    if (!files) return;
    
    Object.values(files).forEach(fileArray => {
      if (!Array.isArray(fileArray)) return;
      
      fileArray.forEach(file => {
        if (file.filepath && fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
          console.log(`[Cleanup] Deleted temp file: ${file.filepath}`);
        }
      });
    });
  } catch (error) {
    console.error('[Cleanup] Error cleaning up temp files:', error);
  }
}

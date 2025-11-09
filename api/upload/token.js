// POST /api/upload/token - Generate upload token for client-side upload
import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await req.body;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Generate token for client upload
        // Bisa tambah authentication di sini kalau perlu
        
        console.log(`[Token] Generating token for: ${pathname}`);

        return {
          // Izinkan semua tipe file - tidak ada pembatasan content type
          // Dengan menghilangkan allowedContentTypes, semua file bisa di-upload
          maximumSizeInBytes: 1024 * 1024 * 1024, // 1GB per file
          // tokenPayload bisa digunakan untuk tracking
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Dipanggil setelah upload selesai
        // ⚠️ Tidak jalan di localhost, harus deployed atau pakai ngrok
        
        console.log('[Upload] Client upload completed:', {
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
          tokenPayload,
        });

        // Bisa update database di sini kalau perlu
        // const payload = JSON.parse(tokenPayload);
        // await updateDatabase(payload);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('[Token] Error:', error);
    return res.status(400).json({ 
      error: error.message || 'Failed to generate upload token'
    });
  }
}

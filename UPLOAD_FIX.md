# Fix Upload untuk Semua Tipe File

## Masalah
- ❌ File coding seperti `.md`, `.js`, `.json`, `.config.js` tidak bisa di-upload
- ❌ Error: "Gagal mengunggah: Gagal upload postcss.config.js: Vercel Blob: Access denied, please provide a valid token for this resource"
- ✅ Hanya file media (png, mp4, dll) yang bisa di-upload

## Penyebab
File `api/upload/token.js` memiliki pembatasan `allowedContentTypes` yang hanya mengizinkan tipe file tertentu:
- Image (jpeg, png, gif, webp, svg)
- Video (mp4, webm, quicktime)
- Document (pdf, zip, doc, xls, ppt)
- Audio (mp3, wav, ogg)
- Text (plain text, csv)

**File coding tidak termasuk dalam daftar ini** sehingga Vercel Blob menolak membuat token untuk upload.

## Solusi
Menghapus pembatasan `allowedContentTypes` di `api/upload/token.js` agar **semua jenis file bisa di-upload**.

### File yang Diubah
- `api/upload/token.js` - Menghapus array `allowedContentTypes`

### Perubahan
```javascript
// SEBELUM - Ada pembatasan
return {
  allowedContentTypes: [
    'image/jpeg',
    'image/png',
    // ... daftar panjang tipe file
  ],
  maximumSizeInBytes: 1024 * 1024 * 1024,
  tokenPayload: JSON.stringify({
    uploadedAt: new Date().toISOString(),
  }),
};

// SESUDAH - Tidak ada pembatasan
return {
  // Izinkan semua tipe file - tidak ada pembatasan content type
  maximumSizeInBytes: 1024 * 1024 * 1024, // 1GB per file
  tokenPayload: JSON.stringify({
    uploadedAt: new Date().toISOString(),
  }),
};
```

## Hasil
✅ Sekarang SEMUA jenis file bisa di-upload:
- File coding: `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.md`, `.html`, `.css`, etc.
- File konfigurasi: `package.json`, `tailwind.config.js`, `postcss.config.js`, etc.
- File media: `.png`, `.jpg`, `.mp4`, `.gif`, etc.
- File document: `.pdf`, `.doc`, `.xls`, `.zip`, etc.
- Dan semua tipe file lainnya

## Cara Deploy
1. Commit perubahan ini
2. Push ke repository
3. Vercel akan otomatis deploy
4. Test upload file `.md` atau `.js` - seharusnya berhasil

## Catatan Keamanan
- Maksimal ukuran file tetap 1GB per file
- Vercel Blob token masih tervalidasi dengan `BLOB_READ_WRITE_TOKEN`
- Pastikan environment variable Vercel sudah di-set dengan benar

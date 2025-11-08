import React, { useState, useRef } from 'react';
import { Package, Download, File, Upload, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const FileGroup = ({ group, onUpdate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadAll = () => {
    // Create invisible anchor to trigger download
    const link = document.createElement('a');
    link.href = `/api/download-all/${group.id}`;
    link.download = `${group.name}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFile = (filename) => {
    // Force download by navigating directly with proper encoding
    const encodedFilename = encodeURIComponent(filename).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
    const url = `/api/download/${group.id}/${encodedFilename}`;
    window.location.href = url;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      await axios.post(`/api/upload/${group.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal menambahkan file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const deleteGroup = async () => {
    try {
      await axios.delete(`/api/groups/${group.id}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus kelompok');
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 animate-slide-up border ${
      isDark ? 'glass-dark border-white/10' : 'glass-light border-gray-200'
    }`}>
      {/* Group Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-xl font-semibold mb-1 truncate ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {group.name}
          </h3>
          <div className={`flex flex-wrap gap-3 text-sm ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            <span className="flex items-center gap-1">
              <File className="w-4 h-4" />
              {group.fileCount} file
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {formatFileSize(group.totalSize)}
            </span>
          </div>
        </div>
        
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors group/delete"
          title="Hapus kelompok"
        >
          <Trash2 className="w-5 h-5 text-red-500 group-hover/delete:text-red-600" />
        </button>
      </div>

      {/* Upload Time */}
      <div className={`text-sm mb-4 ${
        isDark ? 'text-white/50' : 'text-gray-500'
      }`}>
        📅 Diupload: {formatDate(group.uploadedAt)}
      </div>

      {/* Drag & Drop Zone - Always Visible */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 border-2 border-dashed rounded-xl text-center transition-all mb-4 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10'
            : isDark
              ? 'border-white/20 bg-white/5 hover:border-white/30'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <Upload className={`w-6 h-6 mx-auto mb-2 ${
          isDragging ? 'text-emerald-400' : isDark ? 'text-white/40' : 'text-gray-400'
        }`} />
        <p className={`text-sm font-medium ${
          isDark ? 'text-white/70' : 'text-gray-600'
        }`}>
          {uploading ? 'Sedang mengunggah...' : 'Tarik file ke sini untuk ditambahkan'}
        </p>
        <p className={`text-xs mt-1 ${
          isDark ? 'text-white/50' : 'text-gray-500'
        }`}>
          Drag & drop untuk menambah file
        </p>
      </div>

      {/* Individual Files - Always Visible */}
      <div className="space-y-2 mb-4">
        {group.files.map((file, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-xl border hover:border-emerald-400 transition-colors ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <File className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate text-sm ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {file.name}
              </p>
              <p className={`text-xs ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={() => handleDownloadFile(file.name)}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                isDark
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30'
                  : 'bg-emerald-100 hover:bg-emerald-200'
              }`}
              title="Download file"
            >
              <Download className={`w-4 h-4 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Download All Button */}
      <button
        onClick={handleDownloadAll}
        className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md ${
          isDark 
            ? 'bg-white hover:bg-emerald-400 text-black'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
      >
        <Download className="w-5 h-5" />
        Download Semua (ZIP)
      </button>

      {/* Add Files Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`w-full mt-2 py-3 px-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 border-2 ${
          uploading
            ? 'opacity-50 cursor-not-allowed'
            : isDark
              ? 'border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
              : 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
        }`}
      >
        <Upload className="w-5 h-5" />
        {uploading ? 'Mengunggah...' : 'Tambah File'}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={deleteGroup}
        title="Hapus Kelompok?"
        message={`Anda akan menghapus kelompok "${group.name}" dengan ${group.fileCount} file secara PERMANEN.\n\nFile yang sudah dihapus tidak dapat dikembalikan lagi.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
      />
    </div>
  );
};

export default FileGroup;

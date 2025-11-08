import React, { useState, useRef } from 'react';
import { Upload, File, X, Loader, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { upload } from '@vercel/blob/client';
import axios from 'axios';

const UploadAreaClientSide = ({ onUploadSuccess, onUploadError }) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileStatuses, setFileStatuses] = useState([]); 
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState(-1);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setFileStatuses(prev => [...prev, ...files.map(() => 'pending')]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setFileStatuses(prev => [...prev, ...files.map(() => 'pending')]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setFileStatuses(fileStatuses.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const groupNameToUse = groupName || 'Kelompok Tanpa Nama';
      
      // Generate unique group ID for organizing files
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set all files to uploading status
      const newStatuses = selectedFiles.map(() => 'uploading');
      setFileStatuses(newStatuses);

      // Upload each file directly to Vercel Blob (client-side)
      const uploadedFiles = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentUploadingIndex(i);
        
        try {
          console.log(`[Upload] Uploading file ${i + 1}/${selectedFiles.length}: ${file.name}`);
          
          // Upload directly to Vercel Blob from browser
          const blob = await upload(`${groupId}/${file.name}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload/token',
          });

          uploadedFiles.push({
            name: file.name,
            size: file.size,
            url: blob.url,
            pathname: blob.pathname,
          });

          // Update status for this file
          newStatuses[i] = 'completed';
          setFileStatuses([...newStatuses]);
          
          // Update progress
          const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
          setUploadProgress(progress);
          
        } catch (error) {
          console.error(`[Upload] Error uploading ${file.name}:`, error);
          newStatuses[i] = 'error';
          setFileStatuses([...newStatuses]);
          throw new Error(`Gagal upload ${file.name}: ${error.message}`);
        }
      }

      // Save group metadata to KV storage
      console.log('[Upload] Saving group metadata...');
      const response = await axios.post('/api/groups/create', {
        groupName: groupNameToUse,
        files: uploadedFiles,
      });

      setCurrentUploadingIndex(-1);
      onUploadSuccess(response.data.group);
      
      // Reset form after delay
      setTimeout(() => {
        setSelectedFiles([]);
        setGroupName('');
        setUploadProgress(0);
        setFileStatuses([]);
      }, 1000);
      
    } catch (error) {
      console.error('[Upload] Error:', error);
      onUploadError(error.message || 'Upload gagal');
      setCurrentUploadingIndex(-1);
      // Reset uploading statuses on error
      setFileStatuses(selectedFiles.map(() => 'pending'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`rounded-3xl p-8 shadow-2xl border ${
      isDarkTheme ? 'glass-dark border-white/10' : 'glass-light border-gray-200'
    }`}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-emerald-400 bg-emerald-500/10 scale-105' 
            : isDarkTheme
              ? 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="pointer-events-none">
          <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
            isDragging ? 'text-emerald-400' : isDarkTheme ? 'text-white/60' : 'text-gray-400'
          }`} />
          
          <h3 className={`text-2xl font-semibold mb-2 ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            Unggah File
          </h3>
          <p className={`text-lg ${
            isDarkTheme ? 'text-white/70' : 'text-gray-600'
          }`}>
            Klik atau Tarik File ke Sini
          </p>
          <p className={`text-sm mt-2 ${
            isDarkTheme ? 'text-white/50' : 'text-gray-500'
          }`}>
            ✅ Maks 1GB per file • Upload langsung ke cloud • No size limit!
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 animate-slide-up">
          {/* Group Name Input */}
          <div className="mb-4">
            <label className={`block font-medium mb-2 ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              Nama Kelompok (opsional)
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Misalnya: Foto Liburan, Dokumen Kerja, Video Keluarga..."
              className={`w-full px-4 py-3 rounded-xl border focus:border-emerald-400 focus:outline-none transition-colors ${
                isDarkTheme 
                  ? 'border-white/20 bg-white/5 text-white placeholder-white/40'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }`}
              disabled={uploading}
            />
          </div>

          {/* File List */}
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                  fileStatuses[index] === 'completed' 
                    ? isDarkTheme ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : fileStatuses[index] === 'uploading'
                    ? isDarkTheme ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                    : fileStatuses[index] === 'error'
                    ? isDarkTheme ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                    : isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {fileStatuses[index] === 'completed' ? (
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : fileStatuses[index] === 'uploading' ? (
                  <Loader className="w-5 h-5 text-blue-400 flex-shrink-0 animate-spin" />
                ) : (
                  <File className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    isDarkTheme ? 'text-white' : 'text-gray-900'
                  }`}>{file.name}</p>
                  <p className={`text-sm ${
                    isDarkTheme ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    {formatFileSize(file.size)}
                    {fileStatuses[index] === 'uploading' && currentUploadingIndex === index && ' • Uploading...'}
                    {fileStatuses[index] === 'completed' && ' • ✓ Uploaded'}
                  </p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-4">
              <div className={`flex justify-between text-sm mb-2 ${
                isDarkTheme ? 'text-white/70' : 'text-gray-600'
              }`}>
                <span>Uploading {currentUploadingIndex + 1} of {selectedFiles.length} files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isDarkTheme ? 'bg-white/10' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-lg
              transition-all duration-300 flex items-center justify-center gap-3
              ${uploading || selectedFiles.length === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-400'
                : isDarkTheme
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl active:scale-95'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl active:scale-95'
              }
            `}
          >
            {uploading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Mengunggah {currentUploadingIndex + 1}/{selectedFiles.length}...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Unggah {selectedFiles.length} File
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadAreaClientSide;

import React, { useState, useRef } from 'react';
import { Upload, File, X, Loader, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const UploadArea = ({ onUploadSuccess, onUploadError }) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileStatuses, setFileStatuses] = useState([]); // Track status per file: 'pending', 'uploading', 'completed'
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
      const groupNameToUse = groupName || 'Unnamed Group';
      
      // Set all files to uploading status
      setFileStatuses(selectedFiles.map(() => 'uploading'));
      setCurrentUploadingIndex(0);

      // Create FormData with ALL files at once
      const formData = new FormData();
      
      // Append all files with the same field name 'files'
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Append group name once
      formData.append('groupName', groupNameToUse);

      // Send single request with all files
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      // Set all files to completed status
      setFileStatuses(selectedFiles.map(() => 'completed'));
      setCurrentUploadingIndex(-1);
      
      onUploadSuccess(response.data.group);
      
      // Reset form after a brief delay to show all checkmarks
      setTimeout(() => {
        setSelectedFiles([]);
        setGroupName('');
        setUploadProgress(0);
        setFileStatuses([]);
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error.response?.data?.error || error.message);
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
            Maks 1GB per file • Bisa pilih banyak file sekaligus
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
                    : isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <File className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    isDarkTheme ? 'text-white' : 'text-gray-900'
                  }`}>{file.name}</p>
                  <p className={`text-sm ${
                    isDarkTheme ? 'text-white/60' : 'text-gray-600'
                  }`}>{formatFileSize(file.size)}</p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                )}
                {uploading && fileStatuses[index] === 'uploading' && (
                  <Loader className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                )}
                {fileStatuses[index] === 'completed' && (
                  <div className="p-1 bg-emerald-500 rounded-full flex-shrink-0 animate-scale-in">
                    <Check className="w-4 h-4 text-white" />
                  </div>
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
                <span>Mengunggah file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className={`w-full rounded-full h-3 overflow-hidden ${
                isDarkTheme ? 'bg-white/10' : 'bg-gray-200'
              }`}>
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`
              w-full py-4 rounded-xl font-semibold text-black text-lg
              transition-all duration-300 flex items-center justify-center gap-2
              ${uploading
                ? isDarkTheme ? 'bg-white/40' : 'bg-gray-300'
                : 'bg-white hover:bg-emerald-400 active:scale-95 shadow-lg'
              } cursor-${uploading ? 'not-allowed' : 'pointer'}
            `}
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Unggah {selectedFiles.length} File
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadArea;

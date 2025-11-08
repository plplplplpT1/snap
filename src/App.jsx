import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Cloud, Sparkles } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import axios from 'axios';

// Lazy load components for better performance
const UploadArea = lazy(() => import('./components/UploadAreaClientSide'));
const FileGroup = lazy(() => import('./components/FileGroup'));
const Notification = lazy(() => import('./components/Notification'));
const FlowingLines = lazy(() => import('./components/FlowingLines'));
const ThemeToggle = lazy(() => import('./components/ThemeToggle'));
const Orb = lazy(() => import('./components/Orb'));

function App() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data.groups);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchGroups, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (group) => {
    setNotification({
      type: 'success',
      message: `✅ Berhasil! ${group.files.length} file telah diunggah ke "${group.name}"`
    });
    fetchGroups();
    
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadError = (error) => {
    setNotification({
      type: 'error',
      message: `❌ Gagal mengunggah: ${error}`
    });
    
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <Suspense fallback={<div className="fixed top-4 right-4 w-10 h-10" />}>
        {/* Theme Toggle */}
        <ThemeToggle />
      </Suspense>
      
      <Suspense fallback={null}>
        {/* Flowing Lines Background */}
        <FlowingLines />
      </Suspense>
      
      {/* Orb Background for Header */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-b from-black via-black/80 to-transparent' 
            : 'bg-gradient-to-b from-white via-white/80 to-transparent'
        }`} />
        <Suspense fallback={null}>
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-[700px] h-[700px]">
              <Orb hue={0} hoverIntensity={0.3} rotateOnHover={false} forceHoverState={false} />
            </div>
          </div>
        </Suspense>
      </div>
      
      {/* Header */}
      <header className="pt-16 pb-12 text-center animate-fade-in relative z-10">
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-8 ${
          isDark 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-emerald-100 border-emerald-300'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isDark ? 'bg-emerald-400' : 'bg-emerald-600'
          }`}></div>
          <span className={`text-sm font-medium ${
            isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}>Aktif Live</span>
        </div>
        
        <h1 className={`text-7xl md:text-8xl font-serif font-bold mb-6 tracking-tight ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Got a file?
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className={`w-5 h-5 ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`} />
          <p className={`text-lg ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            Berbagi file jadi mudah dan cepat
          </p>
          <Sparkles className={`w-5 h-5 ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`} />
        </div>
        
        <p className={`text-sm ${
          isDark ? 'text-white/40' : 'text-gray-500'
        }`}>
          Upload sampai 1GB • Tanpa kompresi • Gratis selamanya
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Upload Area */}
        <Suspense fallback={
          <div className="mb-12 h-64 rounded-2xl border-2 border-dashed animate-pulse bg-gray-50 dark:bg-gray-900" />
        }>
          <div className="mb-12 animate-slide-up">
            <UploadArea 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </Suspense>

        {/* File Groups Section */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <h2 className={`text-4xl font-serif font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Semua File
            </h2>
            <span className={`text-lg ${
              isDark ? 'text-white/40' : 'text-gray-500'
            }`}>
              ({groups.length})
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-2 ${
                isDark ? 'border-white/20 border-t-white' : 'border-gray-300 border-t-gray-900'
              }`}></div>
              <p className={`mt-4 ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>Memuat data...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className={`rounded-2xl p-16 text-center ${
              isDark ? 'glass-dark' : 'glass-light shadow-lg'
            }`}>
              <Cloud className={`w-20 h-20 mx-auto mb-4 ${
                isDark ? 'text-white/20' : 'text-gray-300'
              }`} />
              <p className={`text-lg ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>
                Belum ada file. Yuk unggah file pertamamu!
              </p>
            </div>
          ) : (
            <Suspense fallback={<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">Loading...</div>}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {groups.map((group) => (
                  <FileGroup key={group.id} group={group} onUpdate={fetchGroups} />
                ))}
              </div>
            </Suspense>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t py-4 mt-20 z-20 ${
        isDark ? 'bg-black/50 border-white/5' : 'bg-white/50 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 text-center text-xs">
          <div className={`flex items-center justify-center gap-8 flex-wrap ${
            isDark ? 'text-white/40' : 'text-gray-500'
          }`}>
            <span>File Permanen</span>
            <span>•</span>
            <span>Max 1GB per file</span>
            <span>•</span>
            <span>Tanpa kompresi</span>
            <span>•</span>
            <span>Gratis</span>
          </div>
        </div>
      </footer>

      {/* Notification */}
      {notification && (
        <Suspense fallback={null}>
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;

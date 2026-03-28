'use client';

import { useEffect, useState } from 'react';
import { Shield, Sparkles, LayoutGrid, Layers, PlaySquare } from 'lucide-react';
import { VideoGrid } from '@/components/cyber-awareness/video-grid';
import { VideoStack } from '@/components/cyber-awareness/video-stack';
import { VideoModal } from '@/components/cyber-awareness/video-modal';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion } from 'framer-motion';

interface VideoData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

export default function CyberAwarenessPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>('grid');
  const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/videos');
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
        }
      } catch (err) {
        console.error("Failed to load modules", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen relative font-mono selection:bg-cyan-500/30">
      <main className="relative z-10 pt-24 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Terminal Block */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.1em] text-white uppercase flex flex-col md:flex-row items-center gap-4 text-center mx-auto">
            <PlaySquare className="w-10 h-10 md:w-14 md:h-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            Stay Safe Online
          </h1>
          <p className="text-lg text-cyan-500/90 max-w-2xl mx-auto uppercase tracking-wider font-semibold">
            &gt; Master the art of digital defense through our curated awareness videos
          </p>
        </div>

        {/* View Toggle Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-cyan-900/40 gap-6">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-[#0a0f14] px-4 py-2 border border-cyan-900/50 rounded-sm">
            [ {videos.length} Modules Online ]
          </div>

          <div className="bg-[#050505] p-1 border border-cyan-900/50 rounded-lg shadow-lg">
            <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as 'grid' | 'stack')}>
              <ToggleGroupItem
                value="grid"
                aria-label="Grid View"
                className={`px-6 py-2 transition-all rounded-md ${viewMode === 'grid' ? 'bg-cyan-900/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'text-gray-500 hover:text-cyan-400/70 hover:bg-cyan-950/20'}`}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="uppercase text-xs font-bold tracking-widest">Grid</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="stack"
                aria-label="Stack View"
                className={`px-6 py-2 transition-all rounded-md ${viewMode === 'stack' ? 'bg-cyan-900/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'text-gray-500 hover:text-cyan-400/70 hover:bg-cyan-950/20'}`}
              >
                <Layers className="h-4 w-4 mr-2" />
                <span className="uppercase text-xs font-bold tracking-widest">Stack</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="min-h-[550px] relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Shield className="w-12 h-12 text-cyan-900 animate-pulse mb-6" />
              <div className="text-cyan-500/80 uppercase tracking-widest font-bold text-sm">
                INITIALIZING MEDIA PROTOCOLS...
              </div>
            </div>
          ) : videos.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15, position: 'absolute' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {viewMode === 'grid' ? (
                <VideoGrid videos={videos} onVideoClick={setActiveVideo} />
              ) : (
                <VideoStack videos={videos} onVideoClick={setActiveVideo} />
              )}
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-32 uppercase tracking-widest font-bold border border-dashed border-cyan-900/50 rounded-lg bg-[#0a0f14] shadow-inner">
                // SYSTEM ERROR: NO VIDEOS FOUND IN DATABASE //
            </div>
          )}
        </div>

      </main>

      <VideoModal
        video={activeVideo}
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}

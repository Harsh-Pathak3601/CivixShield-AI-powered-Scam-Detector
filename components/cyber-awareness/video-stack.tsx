import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface VideoStackProps {
  videos: any[];
  onVideoClick: (video: any) => void;
}

export const VideoStack = ({ videos, onVideoClick }: VideoStackProps) => {
  const [index, setIndex] = useState(0);

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  const handlePrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden font-mono">
      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-8 z-50">
        <button 
          onClick={handlePrev}
          className="w-12 h-12 bg-black/60 border border-cyan-500/50 backdrop-blur-md rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-900/60 hover:scale-110 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-8 z-50">
        <button 
          onClick={handleNext}
          className="w-12 h-12 bg-black/60 border border-cyan-500/50 backdrop-blur-md rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-900/60 hover:scale-110 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <ChevronRight className="w-6 h-6 ml-1" />
        </button>
      </div>

      {/* 3D Stack */}
      <div className="relative w-[75%] md:w-[60%] lg:w-[50%] h-[280px] md:h-[360px] flex justify-center items-center perspective-[1200px]">
        <AnimatePresence initial={false} mode="popLayout">
           {videos.map((video, i) => {
             const offset = i - index;
             let renderOffset = offset;
             
             if (offset < -1) renderOffset += videos.length;
             if (offset > 1 && offset > videos.length - 2) renderOffset -= videos.length;

             const isVisible = Math.abs(renderOffset) <= 1;
             if (!isVisible) return null;

             const isCenter = renderOffset === 0;

             const scale = isCenter ? 1 : 0.8;
             const x = renderOffset * 65 + "%";
             const z = isCenter ? 50 : -100;
             const zIndex = isCenter ? 30 : 10;
             const opacity = isCenter ? 1 : 0.4;
             const rotateY = renderOffset * -15;

             const videoId = getYouTubeId(video.videoUrl);
             const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/placeholder.jpg';
             const fallbackThumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/placeholder.jpg';

             return (
               <motion.div
                 key={video.id}
                 layout
                 initial={{ opacity: 0, scale: 0.8, x: renderOffset > 0 ? "80%" : "-80%" }}
                 animate={{ opacity, scale, x, rotateY, z, zIndex }}
                 exit={{ opacity: 0, scale: 0.8, x: renderOffset > 0 ? "80%" : "-80%", zIndex: 0 }}
                 transition={{ type: "spring", stiffness: 250, damping: 25 }}
                 className={`absolute inset-0 bg-[#0a0f14] rounded-xl overflow-hidden shadow-2xl ${isCenter ? 'border-2 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.3)] cursor-pointer' : 'border border-cyan-900/40 opacity-50 cursor-pointer hover:border-cyan-500/50 hover:opacity-100 transition-opacity'}`}
                 drag={isCenter ? "x" : false}
                 dragConstraints={{ left: 0, right: 0 }}
                 dragElastic={0.2}
                 onDragEnd={(_, info) => {
                   if (info.offset.x > 80) handlePrev();
                   if (info.offset.x < -80) handleNext();
                 }}
                 onClick={() => {
                   if (isCenter) onVideoClick(video);
                   else if (renderOffset > 0) handleNext();
                   else if (renderOffset < 0) handlePrev();
                 }}
               >
                 <div className="absolute inset-0 bg-black/70 z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: isCenter ? 0 : 0.6 }} />
                 
                 <img 
                   src={thumbnailUrl} 
                   alt={video.title} 
                   onError={(e) => { (e.target as HTMLImageElement).src = fallbackThumbnailUrl; }}
                   className="w-full h-full object-cover" 
                 />
                 
                 {isCenter && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 hover:bg-black/10 transition-colors z-20">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-black flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.8)] transform hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 ml-1 fill-black" />
                      </div>
                      <div className="absolute bottom-0 w-full p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
                          <h3 className="text-white font-bold text-lg md:text-xl uppercase tracking-wider line-clamp-1">{video.title}</h3>
                          <p className="text-cyan-400 text-xs md:text-sm mt-1 line-clamp-2 leading-relaxed">{video.description}</p>
                      </div>
                   </div>
                 )}
               </motion.div>
             )
           })}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 pb-2 z-50">
        {videos.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 transition-all w-8 md:w-12 rounded-full cursor-pointer ${i === index ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-cyan-900/50 hover:bg-cyan-500/50'}`} 
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

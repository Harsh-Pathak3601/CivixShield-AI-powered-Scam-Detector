import { useState } from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

// Extract YouTube ID from URL to get the thumbnail
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
  };
  onClick: (video: any) => void;
}

export const VideoCard = ({ video, onClick }: VideoCardProps) => {
  const videoId = getYouTubeId(video.videoUrl);
  // Default to maxresdefault, fallback below if it 404s
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/placeholder.jpg';
  const fallbackThumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/placeholder.jpg';
  
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative cursor-pointer bg-[#0a0f14] border border-cyan-900/50 rounded-lg overflow-hidden flex flex-col h-full shadow-lg transition-all hover:border-cyan-500/50 hover:shadow-[0_4px_20px_rgba(34,211,238,0.2)]"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
        <img 
          src={imgError ? fallbackThumbnailUrl : thumbnailUrl} 
          alt={video.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-cyan-500/90 text-black flex items-center justify-center transform scale-90 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            <Play className="h-6 w-6 ml-1 fill-black" />
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col border-t border-cyan-900/40">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 leading-tight uppercase tracking-wider">{video.title}</h3>
        <p className="text-cyan-600/80 text-sm line-clamp-3 mt-auto">{video.description}</p>
      </div>
    </motion.div>
  );
};

import { motion } from 'framer-motion';
import { VideoCard } from './video-card';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface VideoGridProps {
  videos: any[];
  onVideoClick: (video: any) => void;
}

export const VideoGrid = ({ videos, onVideoClick }: VideoGridProps) => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr"
    >
      {videos.map((video) => (
         <motion.div key={video.id} variants={item} className="h-full">
            <VideoCard video={video} onClick={onVideoClick} />
         </motion.div>
      ))}
    </motion.div>
  );
};

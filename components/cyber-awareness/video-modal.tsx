import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface VideoModalProps {
  video: any;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal = ({ video, isOpen, onClose }: VideoModalProps) => {
  if (!video) return null;
  const videoId = getYouTubeId(video.videoUrl);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-[#050505] border border-cyan-500/50 p-0 overflow-hidden rounded-xl shadow-[0_0_50px_rgba(34,211,238,0.2)]">
        <DialogTitle className="sr-only">Video Player - {video.title}</DialogTitle>
        <DialogDescription className="sr-only">Playing {video.title} cybersecurity awareness video.</DialogDescription>
        <div className="relative aspect-video w-full bg-black">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-cyan-500 font-mono uppercase tracking-widest">
              [ Invalid Video Matrix ]
            </div>
          )}
        </div>
        <div className="p-4 bg-[#0a0f14] border-t border-cyan-900/50">
          <div className="flex justify-between items-start gap-4">
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{video.title}</h3>
                <p className="text-cyan-600/80 text-sm mt-1 max-w-2xl">{video.description}</p>
             </div>
             <button 
               onClick={onClose}
               className="p-2 bg-transparent hover:bg-cyan-900/30 border border-transparent hover:border-cyan-500/30 rounded-md text-gray-400 hover:text-cyan-400 transition-all shrink-0"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useRef, useState } from 'react';
import { MapPin, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import calle5Video from '../assets/videos/calle5.mp4';
import calle13Video from '../assets/videos/calle13.mp4';

interface VideoCardProps {
  title: string;
  address: string;
  videoSrc: string;
  tag: string;
  tagColor: string;
  borderColor: string;
}

const BranchVideoCard: React.FC<VideoCardProps> = ({
  title,
  address,
  videoSrc,
  tag,
  tagColor,
  borderColor,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className={`group relative bg-black/80 rounded-3xl border-2 ${borderColor} overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:scale-[1.01]`}>
      
      {/* Top Branch Header Badge */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-zinc-950/90 z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${tagColor}`}>
              {tag}
            </span>
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-zinc-300 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#F2C700] shrink-0" />
            <span>{address}</span>
          </p>
        </div>

        {/* Mute / Unmute Control */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/20 text-white transition-all cursor-pointer shadow-md hover:scale-105"
          title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          aria-label={isMuted ? 'Activar Sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-[#F2C700]" />}
        </button>
      </div>

      {/* Video Viewport */}
      <div 
        className="relative w-full aspect-video sm:aspect-[4/3] md:aspect-video bg-zinc-950 cursor-pointer overflow-hidden"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
        />

        {/* Play / Pause Overlay on Hover/Paused */}
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100 bg-black/50'}`}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/80 border-2 border-white/80 text-white flex items-center justify-center shadow-xl backdrop-blur-xs transition-transform hover:scale-110">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const BranchVideosSection: React.FC = () => {
  return (
    <section id="sucursales-videos" className="w-full bg-gradient-to-b from-[#1EB8BF] via-black to-[#1EB8BF] py-12 sm:py-16 text-white transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Conocé <span className="text-[#F2C700]">El Galpón</span>
          </h2>
          <p className="text-zinc-200 text-sm sm:text-base font-medium leading-relaxed">
            Descubrí los espacios, atracciones y toda la energía de nuestras dos sedes preparadas para que cada momento sea inolvidable.
          </p>
        </div>

        {/* 2-Column Branch Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* El Galpón Calle 5 */}
          <BranchVideoCard
            title="El Galpón Calle 5"
            address="Calle 5 e/ 34 y 35 • La Plata"
            videoSrc={calle5Video}
            tag="Sede Calle 5"
            tagColor="bg-[#ED3078] text-white"
            borderColor="border-[#ED3078]/60 hover:border-[#ED3078]"
          />

          {/* El Galpón Calle 13 */}
          <BranchVideoCard
            title="El Galpón Calle 13"
            address="Calle 13 e/ 530 y 531 • La Plata"
            videoSrc={calle13Video}
            tag="Sede Calle 13"
            tagColor="bg-[#1EB8BF] text-black font-black"
            borderColor="border-[#1EB8BF]/60 hover:border-[#1EB8BF]"
          />

        </div>
      </div>
    </section>
  );
};

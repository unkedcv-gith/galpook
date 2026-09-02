import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';

import act1 from '../assets/images/actividades_galpon1.webp';
import act2 from '../assets/images/actividades_galpon2.webp';
import act3 from '../assets/images/actividades_galpon3.webp';
import act4 from '../assets/images/actividades_galpon4.webp';
import act5 from '../assets/images/actividades_galpon5.webp';
import act6 from '../assets/images/actividades_galpon6.jpg';

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  category: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'galpon_1',
    src: act1,
    title: 'Muro de Escalada & Boulder',
    category: 'Escalada',
  },
  {
    id: 'galpon_2',
    src: act2,
    title: 'Tirolesa de Vuelo Asistida',
    category: 'Aventura',
  },
  {
    id: 'galpon_3',
    src: act3,
    title: 'Circuitos y Destreza Física',
    category: 'Circuitos',
  },
  {
    id: 'galpon_4',
    src: act4,
    title: 'Camas Elásticas y Saltos',
    category: 'Acrobacia',
  },
  {
    id: 'galpon_5',
    src: act5,
    title: 'Telas y Aros Suspendidos',
    category: 'Telas',
  },
  {
    id: 'galpon_6',
    src: act6,
    title: 'Dinámicas Grupales y Juegos',
    category: 'Deportes',
  },
];

export const AttractionsGallery: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % GALLERY_IMAGES.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        (selectedImageIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
      );
    }
  };

  // We duplicate the list twice for seamless infinite scrolling
  const carouselItems = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

  return (
    <div className="space-y-3 pt-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Camera className="w-4 h-4 text-[#1EB8BF]" />
          <span>Galería de actividades en acción</span>
        </div>
        <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
          Pasa el cursor para pausar • Haz clic para ampliar
        </p>
      </div>

      {/* Marquee Wrapper with soft edge fades */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-3 sm:p-4">
        {/* Left and right fade gradients */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-transparent" />

        {/* Endless scrolling strip */}
        <div className="animate-slow-gallery flex gap-4 items-center">
          {carouselItems.map((item, idx) => {
            const originalIndex = idx % GALLERY_IMAGES.length;
            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => openLightbox(originalIndex)}
                className="group relative cursor-pointer flex-shrink-0 w-64 sm:w-72 md:w-80 h-44 sm:h-48 md:h-52 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-[#1EB8BF] transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-[#1EB8BF]/10"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Hover overlay hint */}
                <div className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Tag and Title */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#1EB8BF]/90 text-black text-[10px] font-black uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-white text-xs sm:text-sm font-black font-heading line-clamp-1 drop-shadow-sm">
                    {item.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div
          id="gallery-lightbox"
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 transition-all"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-700 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Image Container */}
            <div className="relative w-full aspect-4/3 sm:aspect-16/10 max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={GALLERY_IMAGES[selectedImageIndex].src}
                alt={GALLERY_IMAGES[selectedImageIndex].title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />

              {/* Prev / Next Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-700 transition-all hover:scale-110"
                title="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-700 transition-all hover:scale-110"
                title="Siguiente foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Caption Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-[#1EB8BF] uppercase tracking-wider">
                  {GALLERY_IMAGES[selectedImageIndex].category}
                </span>
                <h3 className="text-white font-heading font-black text-base sm:text-lg">
                  {GALLERY_IMAGES[selectedImageIndex].title}
                </h3>
              </div>
              <div className="text-xs text-zinc-400 font-medium">
                {selectedImageIndex + 1} de {GALLERY_IMAGES.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

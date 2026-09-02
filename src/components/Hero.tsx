import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  ShieldCheck, 
  Trophy, 
  Flame, 
  Cake, 
  Smile, 
  Calendar, 
  Activity 
} from 'lucide-react';
import { BRAND_INFO } from '../data/initialData';
import heroVideo from '../assets/videos/video.mp4';
import heroPoster from '../assets/images/hero_poster.jpg';

interface HeroProps {
  onOpenBooking?: () => void;
}

const ACTIVITY_SLIDES = [
  {
    tag: 'AVENTURA & ALTURA',
    title: 'MURO DE ESCALADA & TIROLESA',
    description: 'Desafíos de altura, cruce aéreo, arneses y superación motriz con instructores calificados.',
    color: '#ED3078',
    icon: Flame
  },
  {
    tag: 'FESTEJOS ÚNICOS',
    title: 'CUMPLEAÑOS ACTIVOS E INOLVIDABLES',
    description: '2 horas y media de diversión guiada, juegos dinámicos, música y cero pantallas.',
    color: '#1EB8BF',
    icon: Trophy
  },
  {
    tag: 'DESTREZA MOTRIZ',
    title: 'CIRCUITOS DEPORTIVOS & PARKOUR',
    description: 'Obstáculos, estaciones de salto, coordinación, velocidad y trabajo en equipo para descargar energía.',
    color: '#F2C700',
    icon: ShieldCheck
  },
  {
    tag: 'ACROBACIA AÉREA',
    title: 'TELAS, AROS & CAMAS ELÁSTICAS',
    description: 'Figuras aéreas, saltos gigantes y actividades circenses protegidas sobre colchonetas de alta densidad.',
    color: '#A3BA13',
    icon: Flame
  },
  {
    tag: 'ESPACIO TODOS LOS DÍAS',
    title: 'TALLERES DEPORTIVOS & PASE POR UN DÍA',
    description: 'Peques en Acción y Crossfteens todas las semanas para jugar, aprender y hacer amigos.',
    color: '#1EB8BF',
    icon: Trophy
  }
];

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto slide rotation every 4.5 seconds for desktop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ACTIVITY_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Aggressive & reliable Autoplay / Playback enforcement
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');

    const forcePlay = () => {
      if (!video) return;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked by browser policy until first touch/click
          const unlockPlay = () => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
            window.removeEventListener('click', unlockPlay);
            window.removeEventListener('touchstart', unlockPlay);
            window.removeEventListener('scroll', unlockPlay);
            window.removeEventListener('mousemove', unlockPlay);
          };
          window.addEventListener('click', unlockPlay, { once: true });
          window.addEventListener('touchstart', unlockPlay, { once: true });
          window.addEventListener('scroll', unlockPlay, { once: true });
          window.addEventListener('mousemove', unlockPlay, { once: true });
        });
      }
    };

    // Immediate attempt
    forcePlay();

    // Check again after 300ms in case DOM/media was buffering
    const retryTimeout = setTimeout(forcePlay, 300);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        forcePlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(retryTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'reservar' && onOpenBooking) {
      onOpenBooking();
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const current = ACTIVITY_SLIDES[currentSlide];
  const IconComponent = current.icon;

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[100dvh] sm:min-h-[640px] lg:min-h-[720px] flex items-center justify-center">
      
      {/* Background Full Width & Full Height Video - Always Visible & Vivid */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={(el) => {
            if (el) {
              el.muted = true;
              el.defaultMuted = true;
            }
            videoRef.current = el;
          }}
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroPoster}
          onLoadedData={(e) => {
            const vid = e.currentTarget;
            vid.muted = true;
            vid.play().catch(() => {});
          }}
          onCanPlay={(e) => {
            const vid = e.currentTarget;
            vid.muted = true;
            vid.play().catch(() => {});
          }}
          onEnded={(e) => {
            const vid = e.currentTarget;
            vid.play().catch(() => {});
          }}
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-opacity duration-700 block"
        >
        </video>

        {/* Minimal soft vignette overlay for crisp legibility without darkening video */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/40 pointer-events-none" />
      </div>

      {/* Foreground Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 flex flex-col justify-center min-h-[100dvh] sm:min-h-[560px] lg:min-h-[620px]">
        
        {/* Central Core */}
        <div className="my-auto py-2 sm:py-6 max-w-4xl mx-auto w-full text-center space-y-6 sm:space-y-5 flex flex-col items-center">
          
          {/* Main Fixed Slogan */}
          <div className="space-y-2 text-center pt-2 sm:pt-0">
            <h1 className="text-4xl sm:text-6xl lg:text-[75px] text-white leading-[1.05] sm:leading-[64px] tracking-wide uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              <span className="block">Una excusa más para</span>
              <span className="block text-[#ED3078] drop-shadow-[0_0_35px_rgba(237,48,120,0.85)] mt-1 sm:mt-0">
                NO usar pantallas
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {BRAND_INFO.subtitle}
            </p>
          </div>

          {/* MOBILE EXCLUSIVE: Clean, Large & Square-shaped 4 Action Cards (2x2 grid) */}
          <div className="w-full max-w-sm mx-auto pt-2 sm:hidden">
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Button 1: Cumpleaños */}
              <button
                onClick={() => scrollToSection('cumpleanos')}
                className="group bg-black/85 hover:bg-black/95 active:scale-95 backdrop-blur-md border-2 border-[#ED3078] p-4 rounded-3xl flex flex-col items-center justify-center text-center aspect-[1/0.95] shadow-[0_8px_24px_rgba(237,48,120,0.4)] transition-all cursor-pointer"
              >
                <div className="w-13 h-13 rounded-2xl bg-[#ED3078] text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform mb-2">
                  <Cake className="w-7 h-7" />
                </div>
                <span className="font-heading font-black text-base text-white uppercase tracking-wider block leading-tight">
                  Cumpleaños
                </span>
                <span className="text-[10px] text-[#ED3078] font-black uppercase tracking-wider block mt-0.5">
                  Festejos Activos
                </span>
              </button>

              {/* Button 2: FITNESS */}
              <button
                onClick={() => scrollToSection('talleres')}
                className="group bg-black/85 hover:bg-black/95 active:scale-95 backdrop-blur-md border-2 border-[#1EB8BF] p-4 rounded-3xl flex flex-col items-center justify-center text-center aspect-[1/0.95] shadow-[0_8px_24px_rgba(30,184,191,0.4)] transition-all cursor-pointer"
              >
                <div className="w-13 h-13 rounded-2xl bg-[#1EB8BF] text-black flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform mb-2">
                  <Activity className="w-7 h-7" />
                </div>
                <span className="font-heading font-black text-base text-white uppercase tracking-wider block leading-tight">
                  Fitness
                </span>
                <span className="text-[10px] text-[#1EB8BF] font-black uppercase tracking-wider block mt-0.5">
                  Pekes & Teens
                </span>
              </button>

              {/* Button 3: UP Espacio */}
              <button
                onClick={() => scrollToSection('up-espacio')}
                className="group bg-black/85 hover:bg-black/95 active:scale-95 backdrop-blur-md border-2 border-[#A3BA13] p-4 rounded-3xl flex flex-col items-center justify-center text-center aspect-[1/0.95] shadow-[0_8px_24px_rgba(163,186,19,0.4)] transition-all cursor-pointer"
              >
                <div className="w-13 h-13 rounded-2xl bg-[#A3BA13] text-black flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform mb-2">
                  <Smile className="w-7 h-7" />
                </div>
                <span className="font-heading font-black text-base text-white uppercase tracking-wider block leading-tight">
                  UP Espacio
                </span>
                <span className="text-[10px] text-[#A3BA13] font-black uppercase tracking-wider block mt-0.5">
                  Cuidado & Juegos
                </span>
              </button>

              {/* Button 4: Reservar */}
              <button
                onClick={() => scrollToSection('reservar')}
                className="group bg-gradient-to-br from-[#F2C700] via-[#e6bd00] to-[#cfa300] hover:brightness-105 active:scale-95 border-2 border-white p-4 rounded-3xl flex flex-col items-center justify-center text-center aspect-[1/0.95] shadow-[0_8px_24px_rgba(242,199,0,0.55)] transition-all cursor-pointer"
              >
                <div className="w-13 h-13 rounded-2xl bg-black text-[#F2C700] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform mb-2">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="font-heading font-black text-base text-black uppercase tracking-wider block leading-tight">
                  Reservar
                </span>
                <span className="text-[10px] text-zinc-950 font-black uppercase tracking-wider block mt-0.5">
                  Turnos Online
                </span>
              </button>

            </div>
          </div>

          {/* DESKTOP EXCLUSIVE: Free-Floating Activity Slide Content */}
          <div className="hidden sm:flex pt-[4px] pb-[1px] mt-[55px] w-full flex-col items-center min-h-[150px] justify-between transform scale-[0.80] origin-top">
            
            {/* Tag Header */}
            <div className="flex items-center justify-center h-7">
              <span 
                className="text-xs font-black px-3.5 py-1 rounded-lg uppercase tracking-wider text-black shadow-lg transition-colors duration-500"
                style={{ backgroundColor: current.color }}
              >
                {current.tag}
              </span>
            </div>

            {/* Free Floating Title */}
            <div className="h-[60px] flex items-center justify-center">
              <h2 className="-mb-[18px] font-heading text-4xl lg:text-5xl text-white uppercase tracking-tight flex items-center justify-center gap-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] transition-all duration-300">
                <IconComponent className="w-10 h-10 shrink-0 drop-shadow" style={{ color: current.color }} />
                <span className="font-bold text-[34px] leading-[40px]" style={{ color: '#ffffff' }}>
                  {current.title}
                </span>
              </h2>
            </div>

            {/* Free Floating Description */}
            <div className="h-[56px] flex items-center justify-center">
              <p className="text-lg text-zinc-100 font-semibold leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] text-center line-clamp-2">
                {current.description}
              </p>
            </div>

            {/* Slider Progress Bar Indicators */}
            <div className="flex items-center justify-center gap-2 pt-1 h-5">
              {ACTIVITY_SLIDES.map((slide, index) => (
                <button
                  key={slide.title}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer drop-shadow ${
                    currentSlide === index 
                      ? 'w-12 bg-white' 
                      : 'w-3 bg-white/40 hover:bg-white/70'
                  }`}
                  style={{
                    backgroundColor: currentSlide === index ? slide.color : undefined
                  }}
                  title={slide.title}
                />
              ))}
            </div>

          </div>

        </div>

        {/* Bottom Bar: Rapid Activity Direct Pills - Visible on sm and up */}
        <div className="pt-6 border-t border-white/10 hidden sm:grid sm:grid-cols-4 gap-3 text-center">
          <div className="bg-black/50 border border-white/15 backdrop-blur-md rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-zinc-300 uppercase">Aventura</div>
            <div className="text-xs font-black text-white uppercase">Muro & Tirolesa</div>
          </div>
          <div className="bg-black/50 border border-white/15 backdrop-blur-md rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-zinc-300 uppercase">Festejos</div>
            <div className="text-xs font-black text-white uppercase">Cumples 100% Activos</div>
          </div>
          <div className="bg-black/50 border border-white/15 backdrop-blur-md rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-zinc-300 uppercase">Deporte</div>
            <div className="text-xs font-black text-white uppercase">Circuitos & Parkour</div>
          </div>
          <div className="bg-black/50 border border-white/15 backdrop-blur-md rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-zinc-300 uppercase">Seguridad</div>
            <div className="text-xs font-black text-white uppercase">Docentes de Ed. Física</div>
          </div>
        </div>

      </div>

    </section>
  );
};

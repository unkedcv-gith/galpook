import React from 'react';
import { BRAND_INFO } from '../data/initialData';
import { ShieldCheck, Clock, Smile, Sparkles, MessageCircle, Zap } from 'lucide-react';

export const DaycareSection: React.FC = () => {
  return (
    <section id="up-espacio" className="w-full bg-gradient-to-b from-[#A3BA13] via-[#A3BA13] via-45% to-[#F2C700] text-black py-16 sm:py-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-black/60 backdrop-blur-md border-2 border-white/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl text-white">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#A3BA13] text-black font-heading font-black text-xs tracking-widest uppercase shadow-md">
                Cuidado & Recreación Diaria
              </span>

              <div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  <span className="text-[#F2C700] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">UP</span> espacio de cuidado
                </h2>
                <div className="font-heading text-xl sm:text-2xl font-black text-white mt-1 uppercase">y actividades deportivas y recreativas.</div>
              </div>

              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-medium">
                Un espacio donde tu peke juega, se mueve, crea y se divierte mientras vos hacés lo que necesitás.
              </p>

              {/* Paro en el cole callout */}
              <div className="bg-zinc-950/60 border border-white/20 rounded-2xl p-4 space-y-1.5 shadow-inner">
                <div className="text-[#ED3078] font-heading font-black text-base flex items-center gap-2 uppercase">
                  <Zap className="w-5 h-5 text-[#F2C700]" /> ¿Hay paro en el cole o no tenés quien cuide a tu peke?
                </div>
                <p className="text-xs text-zinc-300 font-medium">
                  ¡Traélo a El Galpón! Mucha diversión asegurada en un solo lugar adaptado con docentes calificados y actividades saludables.
                </p>
              </div>

              {/* Highlights Pill Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/20 text-xs text-white font-black flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A3BA13]" /> 7:30 a 17:00 hs
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/20 text-xs text-white font-black flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#A3BA13]" /> Vos elegís las horas
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/20 text-xs text-white font-black flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#A3BA13]" /> Cupo Limitado
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <a
                  href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent('Hola! Quisiera consultar disponibilidad y tarifas para el espacio de cuidado UP en El Galpón.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex bg-[#A3BA13] hover:bg-white hover:text-black text-black font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all items-center gap-2 shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-black" />
                  <span>Reservar Espacio UP</span>
                </a>
              </div>

            </div>

            {/* Right Feature List Bento Box */}
            <div className="lg:col-span-5 bg-zinc-950/60 border border-white/20 rounded-2xl p-6 space-y-4 text-white shadow-inner">
              <div className="font-heading text-lg font-black pb-2 border-b border-white/20 flex items-center justify-between uppercase">
                <span>¿Qué hacen los pekes?</span>
                <span className="text-[10px] font-black text-black bg-[#F2C700] px-2.5 py-1 rounded-full uppercase">
                  Lunes a Viernes
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-200 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3BA13]" />
                  <span>Circuitos Deportivos y Agilidad</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3BA13]" />
                  <span>Desafíos en Muro de Escalada y Tirolesa</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3BA13]" />
                  <span>Talleres de Arte y Expresión Corporal</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3BA13]" />
                  <span>Yoga Infantil, Literatura y Ciencias</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3BA13]" />
                  <span>Juegos Sensoriales y de Exploración Libre</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-white/20 text-[11px] text-[#A3BA13] italic text-center font-bold">
                Atención personalizada con grupos reducidos adaptados por edad.
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};


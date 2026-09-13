import React from 'react';
import { ShieldCheck, Clock, Smile, Sun, Zap, Heart, Users } from 'lucide-react';
import { DaycareSimulator } from './DaycareSimulator';

export const DaycareSection: React.FC = () => {
  return (
    <section id="up-espacio" className="w-full bg-gradient-to-b from-[#A3BA13] via-[#A3BA13] via-45% to-[#F2C700] text-black py-16 sm:py-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-black/60 backdrop-blur-md border-2 border-white/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl text-white space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#A3BA13] text-black font-heading font-black text-xs tracking-widest uppercase shadow-md">
                  Bebés desde 45 días a niños de 11 años
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-[#F2C700] text-xs font-bold border border-white/10">
                  <Sun className="w-3.5 h-3.5 text-[#F2C700]" /> Cuidado & Recreación Diaria
                </span>
              </div>

              <div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  <span className="text-[#F2C700] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">UP</span> espacio de cuidado
                </h2>
                <div className="font-heading text-xl sm:text-2xl font-black text-white mt-1 uppercase">
                  y actividades deportivas y recreativas.
                </div>
              </div>

              <div className="space-y-2.5 text-zinc-200 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  Un espacio pensado para acompañar a las familias: <strong className="text-white">desde bebés de 45 días hasta chicos de 11 años</strong>.
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-2xl p-3.5 leading-relaxed">
                  <strong className="text-[#F2C700]">Para los más bebés:</strong> Brindamos un servicio de máxima dedicación, contención amorosa, higiene rigurosa, estimulación temprana y respeto por sus tiempos de descanso y alimentación con profesionales calificados.
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  <strong className="text-[#A3BA13]">Para los más grandes:</strong> Juegos motores, circuitos deportivos, expresión artística y movimiento activo mientras vos trabajás o hacés lo que necesitás.
                </p>
              </div>

              {/* Highlights Pill Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/20 text-xs text-white font-black flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A3BA13] shrink-0" /> 45 días a 11 años
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/20 text-xs text-white font-black flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A3BA13] shrink-0" /> 7:30 a 17:00 hs
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/20 text-xs text-white font-black flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#A3BA13] shrink-0" /> Vos elegís las horas
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/20 text-xs text-white font-black flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#A3BA13] shrink-0" /> Cupo Limitado
                </div>
              </div>

            </div>

            {/* Right Feature List Bento Box */}
            <div className="lg:col-span-5 bg-zinc-950/60 border border-white/20 rounded-2xl p-6 space-y-4 text-white shadow-inner">
              <div className="font-heading text-lg font-black pb-2 border-b border-white/20 flex items-center justify-between uppercase">
                <span>¿Qué hacemos en UP?</span>
                <span className="text-[10px] font-black text-black bg-[#F2C700] px-2.5 py-1 rounded-full uppercase">
                  Lunes a Viernes
                </span>
              </div>

              {/* Differentiated Care Points */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[#F2C700] font-black uppercase text-[11px] mb-1.5 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#F2C700]" /> Bebés y Primeros Pasos (45 días+)
                  </div>
                  <ul className="space-y-1.5 text-zinc-300 pl-4 border-l-2 border-[#F2C700]/40">
                    <li>• Atención y contención cálida y personalizada</li>
                    <li>• Estimulación temprana y sensorial adaptada</li>
                    <li>• Cuidado en rutinas de descanso y alimentación</li>
                  </ul>
                </div>

                <div>
                  <div className="text-[#A3BA13] font-black uppercase text-[11px] mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#A3BA13]" /> Niños y Pekes (Hasta 11 años)
                  </div>
                  <ul className="space-y-1.5 text-zinc-300 pl-4 border-l-2 border-[#A3BA13]/40">
                    <li>• Circuitos deportivos, muro de escalada y agilidad</li>
                    <li>• Talleres de arte, literatura y expresión corporal</li>
                    <li>• Juegos recreativos y cooperativos guiados</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 text-[11px] text-[#A3BA13] italic text-center font-bold">
                Atención personalizada en grupos reducidos con profesionales especializados por edad.
              </div>
            </div>

          </div>

          {/* Interactive Pricing Simulator for Espacio UP seamlessly embedded */}
          <DaycareSimulator embedded />

        </div>

      </div>
    </section>
  );
};


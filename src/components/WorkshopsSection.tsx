import React from 'react';
import { WORKSHOP_PROGRAMS, BRAND_INFO } from '../data/initialData';
import { Clock, CheckCircle, MessageCircle } from 'lucide-react';

export const WorkshopsSection: React.FC = () => {
  return (
    <section id="talleres" className="w-full bg-gradient-to-b from-[#1EB8BF] via-[#1EB8BF] via-45% to-[#A3BA13] text-black py-16 sm:py-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header Bento Box */}
        <div className="bg-black/60 backdrop-blur-md rounded-3xl border-2 border-white/20 p-6 sm:p-10 text-center space-y-3 shadow-2xl text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1EB8BF] text-black font-heading font-black text-xs tracking-widest uppercase shadow-md">
            Desarrollo Físico & Diversión Sana
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            <span className="text-[#F2C700] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">FITNESS</span>
          </h2>
          <p className="text-zinc-200 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            Propuestas pensadas para cada etapa de crecimiento: desde la primera infancia hasta preadolescentes, fomentando hábitos de movimiento saludable sin dispositivos.
          </p>
        </div>

        {/* Programs Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {WORKSHOP_PROGRAMS.map((program) => {
            return (
              <div
                key={program.id}
                className="bg-black/60 backdrop-blur-md border-2 border-white/20 hover:border-white hover:scale-[1.01] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl transition-all text-white"
              >
                <div className="space-y-4">
                  
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-[#1EB8BF] text-black shadow-xs">
                      {program.ageRange}
                    </span>

                    <span className="text-[#F2C700] text-xs font-black flex items-center gap-1.5 bg-zinc-950/60 px-2.5 py-1 rounded-full border border-white/20">
                      <Clock className="w-3.5 h-3.5 text-[#F2C700]" />
                      {program.subtitle}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-2xl font-black text-white uppercase">
                    {program.title}
                  </h3>

                  {/* Schedule */}
                  <div className="bg-zinc-950/60 border border-white/20 p-3 rounded-xl text-xs font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F2C700] shrink-0" />
                    <span>{program.schedule}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {program.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-white/20">
                    {program.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-white">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-[#A3BA13]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enroll CTA */}
                <a
                  href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(`Hola! Quisiera inscribir o consultar cupos para "${program.title}" (${program.ageRange}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all bg-[#1EB8BF] hover:bg-white hover:text-black text-black shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consultar Vacantes</span>
                </a>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};


import React from 'react';
import { ATTRACTIONS } from '../data/initialData';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Clock,
  Zap,
  Mountain,
  Wind,
  Trophy,
  Activity,
  Flame,
  Palette,
  Sparkles,
  Laugh,
} from 'lucide-react';
import { AttractionsGallery } from './AttractionsGallery';

interface BirthdaysSectionProps {
  onOpenBooking: () => void;
}

const getAttractionIcon = (iconName: string, id: string) => {
  switch (id) {
    case 'muro':
      return <Mountain className="w-5 h-5" />;
    case 'tirolesa':
      return <Wind className="w-5 h-5" />;
    case 'circuitos':
      return <Trophy className="w-5 h-5" />;
    case 'telas_aros':
      return <Activity className="w-5 h-5" />;
    case 'elasticas':
      return <Flame className="w-5 h-5" />;
    case 'arte_creatividad':
      return <Palette className="w-5 h-5" />;
    default:
      if (iconName === 'Mountain') return <Mountain className="w-5 h-5" />;
      return <Zap className="w-5 h-5" />;
  }
};

export const BirthdaysSection: React.FC<BirthdaysSectionProps> = ({
  onOpenBooking,
}) => {
  return (
    <section id="cumpleanos" className="w-full bg-gradient-to-b from-black via-[#ED3078] via-35% to-[#1EB8BF] text-white py-16 sm:py-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Section Header Bento Box */}
        <div className="bg-black/60 backdrop-blur-md rounded-3xl border-2 border-white/25 p-6 sm:p-10 text-center space-y-3 shadow-2xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#ED3078] text-white font-heading font-black text-xs tracking-widest uppercase shadow-md">
            Festejos Únicos e Inolvidables
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Cumpleaños en <span className="text-[#F2C700] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">El Galpón</span>
          </h2>
          <p className="text-white/90 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            2 horas y media de máxima adrenalina, movimiento y sonrisas. Un ambiente supervisado por profesores donde cada invitado de 6 a 12 años vive una verdadera fiesta deportiva.
          </p>
        </div>

        {/* 3 Core Highlights Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-black/60 backdrop-blur-md border-2 border-white/20 hover:border-white/60 p-6 rounded-2xl flex flex-col justify-between space-y-3 shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950/60 border border-white/20 flex items-center justify-center text-[#1EB8BF] shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-white mb-1 uppercase">2:30 Hs de Acción</h3>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                Tiempo perfecto de juego intenso. Hacen deportes desde que llegan hasta que se van y terminan agotados y felices.
              </p>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-md border-2 border-white/20 hover:border-white/60 p-6 rounded-2xl flex flex-col justify-between space-y-3 shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950/60 border border-white/20 flex items-center justify-center text-[#1EB8BF] shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-white mb-1 uppercase">Base 20 Chicos / 20 Adultos</h3>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                Hasta 35 chicos en Calle 13, y hasta 40 en Calle 5. En Calle 5 podés agregar adultos extra, pero en Calle 13 el límite estricto es de 20 adultos.
              </p>
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-md border-2 border-[#ED3078]/50 hover:border-[#ED3078] p-6 rounded-2xl flex flex-col justify-between space-y-3 shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#ED3078]/20 border border-[#ED3078]/50 flex items-center justify-center text-white shadow-xs">
              <Laugh className="w-6 h-6 text-[#ED3078]" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-white mb-1 uppercase">Reloj Loco <span className="text-xs font-black bg-[#ED3078] text-white px-2 py-0.5 rounded-full ml-1 align-middle">CALLE 5</span></h3>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                Nuestra atracción estrella y la más elegida. ¡Poné a prueba tu destreza saltando y esquivando! Disponible exclusivamente en la sucursal de Calle 5.
              </p>
            </div>
          </div>
        </div>

        {/* Menu Information */}
        <div className="bg-[#A3BA13] rounded-3xl p-1 shadow-2xl">
          <div className="bg-zinc-950 rounded-[22px] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/3 text-center md:text-left space-y-2">
                <span className="inline-block px-3 py-1 bg-[#A3BA13] text-black font-black text-[10px] tracking-widest uppercase rounded-full">
                  ¡INCLUIDO EN EL CONTRATO!
                </span>
                <h3 className="font-heading text-3xl font-black text-white uppercase leading-none">
                  Menú de<br/><span className="text-[#A3BA13]">Regalo</span>
                </h3>
                <p className="text-xs text-zinc-400 font-medium pt-2">
                  Personal de cocina y mozo incluidos, junto con vajilla completa.
                </p>
              </div>
              
              <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black border border-white/10 rounded-2xl p-5 hover:border-[#A3BA13] transition-colors">
                  <h4 className="font-heading text-lg font-black text-[#A3BA13] mb-3 uppercase flex items-center gap-2">
                    <Users className="w-5 h-5" /> Menú Chicos
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-zinc-300">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> Snacks (1 vez)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> 1 Súper Pancho o Pizza (avisar con anticipación para pizza)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> Gaseosa, jugo y agua libre para chicos</li>
                  </ul>
                  <p className="text-[10px] text-zinc-500 mt-3 italic">* No se puede agregar comida extra para los niños.</p>
                </div>
                
                <div className="bg-black border border-white/10 rounded-2xl p-5 hover:border-[#A3BA13] transition-colors">
                  <h4 className="font-heading text-lg font-black text-[#A3BA13] mb-3 uppercase flex items-center gap-2">
                    <Users className="w-5 h-5" /> Menú Adultos
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-zinc-300">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> Snacks (1 vez)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> 1 Empanada (jamón y queso / carne) p/p</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> 2 Pizzas Muzzarella cada 8 personas</li>
                  </ul>
                  <p className="text-[10px] text-zinc-500 mt-3 italic">* Bebida no incluida. Se permite ingresar comida adicional solo para adultos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-8 bg-white rounded-full shadow-md" />
            <h3 className="font-heading text-2xl font-black text-white uppercase tracking-wide drop-shadow-sm">
              Atracciones y Juegos Incluidos
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ATTRACTIONS.map((item) => {
              return (
                <div
                  key={item.id}
                  className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 flex flex-col justify-between space-y-4 hover:border-white hover:scale-[1.01] shadow-xl transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/20 text-white font-black">
                        {getAttractionIcon(item.icon, item.id)}
                      </span>
                      {item.staffSupervised ? (
                        <span className="text-[10px] font-black bg-[#1EB8BF] text-black px-2.5 py-1 rounded-full uppercase shadow-xs">
                          Supervisado
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-zinc-900/60 text-white border border-white/20 px-2.5 py-1 rounded-full uppercase">
                          Libre
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading text-lg font-black text-white mb-1 uppercase">{item.title}</h4>
                    <p className="text-xs text-white leading-relaxed font-medium">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/15 text-[11px] text-[#A3BA13] font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3BA13]" />
                    Garantía de entretenimiento sano
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Slow Scrolling Photo Gallery */}
          <AttractionsGallery />
        </div>

      </div>
    </section>
  );
};


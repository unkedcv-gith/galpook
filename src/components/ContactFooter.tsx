import React from 'react';
import { BRAND_INFO } from '../data/initialData';
import logoBlanca from '../assets/images/marca_el_galpon_blanca.svg';
import { MessageCircle, Instagram, MapPin, Clock, Shield, Heart, Calendar } from 'lucide-react';

interface ContactFooterProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenWaiver?: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  onOpenBooking,
  onOpenAdmin,
  onOpenWaiver,
}) => {
  return (
    <footer className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-sm">
      <div className="bg-black/60 backdrop-blur-md rounded-3xl border-2 border-[#1EB8BF] p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1EB8BF] space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Reserva */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoBlanca} alt="El Galpón" className="h-12 w-auto max-w-[200px] object-contain" />
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              <strong className="text-white block font-bold mb-1">{BRAND_INFO.tagline}.</strong>
              Un espacio creado para que los chicos jueguen, se ejerciten y se diviertan sanamente en cumpleaños y talleres recreativos.
            </p>

            <div>
              <button
                type="button"
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1EB8BF] to-[#ED3078] text-white font-heading font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar Turno Online</span>
              </button>
            </div>
          </div>

          {/* Col 2: Contacto, Redes & Sedes */}
          <div className="space-y-3.5">
            <h4 className="font-heading font-black text-white text-base uppercase tracking-wide">Contacto & Sedes</h4>
            
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs text-[#A3BA13] font-black hover:underline transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#A3BA13] shrink-0" />
              <span>WhatsApp: {BRAND_INFO.phone}</span>
            </a>

            <div className="space-y-1.5 pt-0.5">
              <a
                href={BRAND_INFO.instagramMainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#F2C700] font-black hover:underline transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#F2C700] shrink-0" />
                <span>Instagram: {BRAND_INFO.instagramMain}</span>
              </a>

              <a
                href={BRAND_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#ED3078] font-black hover:underline transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#ED3078] shrink-0" />
                <span>Espacio UP: {BRAND_INFO.instagram}</span>
              </a>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <MapPin className="w-4 h-4 text-[#ED3078] shrink-0" />
                <span><strong>Sede Calle 5:</strong> Calle 5 e/ 34 y 35</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <MapPin className="w-4 h-4 text-[#1EB8BF] shrink-0" />
                <span><strong>Sede Calle 13:</strong> Calle 13 e/ 530 y 531</span>
              </div>
            </div>
          </div>

          {/* Col 3: Horarios & Actividades */}
          <div className="space-y-3.5">
            <h4 className="font-heading font-black text-white text-base uppercase tracking-wide">Horarios de Atención</h4>
            
            <div className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed font-medium">
              <Clock className="w-4 h-4 text-[#ED3078] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Cumpleaños Infantiles:</strong>
                Turnos de 2:30 hs • Todos los días (Lunes a Domingos y Feriados).
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed font-medium">
              <Clock className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Espacio UP (Cuidado y Talleres):</strong>
                Lunes a Viernes de 7:30 a 17:00 hs.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed font-medium">
              <Clock className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Fitness Infantil & Juvenil:</strong>
                <span className="block">• Pekes en Acción: Martes y Jueves 17:30 a 18:30 hs.</span>
                <span className="block">• Crossteens: Martes y Jueves 18:30 a 19:30 hs.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Subtle Admin Access */}
        <div className="pt-6 border-t border-zinc-800/80 text-xs text-zinc-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span>© {new Date().getFullYear()} El Galpón. Todos los derechos reservados.</span>
            <span className="text-zinc-700">•</span>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-transparent hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800 text-zinc-600 hover:text-zinc-400 text-[11px] font-normal transition-all cursor-pointer group select-none touch-manipulation active:scale-95"
              title="Acceso staff"
            >
              <Shield className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 pointer-events-none shrink-0 transition-colors" />
              <span className="pointer-events-none">Gestión</span>
            </button>
          </div>
          <div className="text-[11px] font-black text-[#F2C700] uppercase tracking-wider">
            Espacio recreativo y deportivo para pekes • La Plata
          </div>
        </div>

      </div>
    </footer>
  );
};


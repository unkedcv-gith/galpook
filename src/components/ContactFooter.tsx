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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={logoBlanca} alt="El Galpón" className="h-12 w-auto max-w-[200px] object-contain" />
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {BRAND_INFO.tagline}. Un espacio creado para que los chicos jueguen, se ejerciten y se diviertan sanamente en cumpleaños y talleres.
            </p>
          </div>

          {/* Col 2: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-heading font-black text-white text-base uppercase">Contacto & Redes</h4>
            
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs text-[#A3BA13] font-black hover:underline transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#A3BA13]" />
              <span>WhatsApp: {BRAND_INFO.phone}</span>
            </a>

            <a
              href={BRAND_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs text-[#ED3078] font-black hover:underline transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#ED3078]" />
              <span>Instagram: {BRAND_INFO.instagram}</span>
            </a>

            <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium">
              <MapPin className="w-4 h-4 text-[#F2C700] shrink-0" />
              <span>{BRAND_INFO.address}</span>
            </div>
          </div>

          {/* Col 3: Horarios */}
          <div className="space-y-3">
            <h4 className="font-heading font-black text-white text-base uppercase">Horarios de Atención</h4>
            
            <div className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed font-medium">
              <Clock className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Talleres y Cuidado:</strong>
                Lunes a Viernes de 7:30 a 17:00 hs.
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed font-medium">
              <Clock className="w-4 h-4 text-[#ED3078] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Cumpleaños Infantiles:</strong>
                Sábados y Domingos en turnos de 2:30 hs.
              </div>
            </div>
          </div>

          {/* Col 4: Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-black text-white text-base uppercase">Accesos Rápidos</h4>
            
            <ul className="space-y-2.5 text-xs font-black">
              <li>
                <button onClick={onOpenBooking} className="hover:text-[#1EB8BF] transition-colors flex items-center gap-1.5 text-zinc-200 uppercase cursor-pointer">
                  <Calendar className="w-3.5 h-3.5 text-[#1EB8BF]" />
                  <span>Reservar Turno de Cumpleaños</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Subtle Admin Access */}
        <div className="pt-6 border-t border-zinc-800/80 text-xs text-zinc-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} El Galpón. Todos los derechos reservados.</span>
            <span className="text-zinc-700">•</span>
            <button
              onClick={onOpenAdmin}
              className="text-zinc-600 hover:text-zinc-400 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
              title="Acceso staff"
            >
              <Shield className="w-3 h-3 text-zinc-600 hover:text-zinc-400" />
              <span>Gestión</span>
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


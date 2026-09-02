import React from 'react';
import { X, MapPin, CheckCircle2, XCircle } from 'lucide-react';

interface BranchComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BranchComparisonModal: React.FC<BranchComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-zinc-950 border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ED3078] to-[#1EB8BF] p-1">
          <div className="bg-zinc-950 px-6 py-4 rounded-[22px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[#F2C700]" />
              <h2 className="font-heading font-black text-white text-xl sm:text-2xl uppercase tracking-wider">
                ¿Qué incluye cada sucursal?
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content (Table) */}
        <div className="p-6 overflow-y-auto">
          <div className="bg-black/60 rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-white/20 text-white font-heading font-black text-lg">Y TAMBIÉN</th>
                  <th className="p-4 border-b-2 border-white/20 text-[#ED3078] font-heading font-black text-xl text-center">CALLE 5</th>
                  <th className="p-4 border-b-2 border-white/20 text-[#1EB8BF] font-heading font-black text-xl text-center">CALLE 13</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-white uppercase tracking-wide">
                {[
                  { name: 'Muro y Tirolesa', c5: true, c13: true },
                  { name: 'Aro y Tela de Acrobacia', c5: true, c13: true },
                  { name: 'Circuitos Deportivos', c5: true, c13: true },
                  { name: 'Videojuegos', c5: true, c13: true },
                  { name: 'Reloj Loco', c5: true, c13: false },
                  { name: 'Camas Elásticas', c5: true, c13: false },
                  { name: 'Sector Menores de 4 Años', c5: true, c13: false },
                  { name: 'Comida Adultos', c5: true, c13: true },
                  { name: 'Comida y Bebida Chicos', c5: true, c13: true },
                  { name: 'Encargado y Mozo', c5: true, c13: true },
                  { name: 'Vajilla', c5: true, c13: true },
                  { name: 'Seguro y Asistencia Médica', c5: true, c13: true },
                  { name: 'WIFI', c5: true, c13: true },
                  { name: 'Grupo Electrógeno', c5: true, c13: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4">{row.name}</td>
                    <td className="p-4 text-center">
                      {row.c5 ? <CheckCircle2 className="w-6 h-6 text-[#ED3078] mx-auto" /> : <XCircle className="w-6 h-6 text-zinc-600 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {row.c13 ? <CheckCircle2 className="w-6 h-6 text-[#1EB8BF] mx-auto" /> : <XCircle className="w-6 h-6 text-zinc-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-white/10 bg-white/5">
                  <td className="p-4">MÁXIMO CHICOS <span className="text-[10px] block font-medium text-zinc-400">(Contratando adicional)</span></td>
                  <td className="p-4 text-center text-2xl font-black text-[#ED3078]">40</td>
                  <td className="p-4 text-center text-2xl font-black text-[#1EB8BF]">35</td>
                </tr>
                <tr className="border-b border-white/10 bg-white/5">
                  <td className="p-4">MÁXIMO ADULTOS <span className="text-[10px] block font-medium text-zinc-400">(Contratando adicional)</span></td>
                  <td className="p-4 text-center text-2xl font-black text-[#ED3078]">30</td>
                  <td className="p-4 text-center text-2xl font-black text-[#1EB8BF]">
                    20
                    <span className="text-[9px] block text-zinc-400 font-medium leading-tight mt-1">No se pueden agregar<br/>adicionales</span>
                  </td>
                </tr>
                <tr className="bg-white/5">
                  <td className="p-4">CALEFACCIÓN SECTOR ADULTOS</td>
                  <td className="p-4 text-center text-xs text-zinc-300">AIRE FRÍO/CALOR</td>
                  <td className="p-4 text-center text-xs text-zinc-300 leading-tight">HONGO CALEFACTOR<br/>VENTILADOR</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

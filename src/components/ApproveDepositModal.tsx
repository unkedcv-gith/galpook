import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MessageCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import { Reservation } from '../types';
import { generateWaiverShareLink, generateWaiverWhatsAppMessage, formatDateDDMMAAAA } from '../services/storage';

interface ApproveDepositModalProps {
  isOpen: boolean;
  reservation: Reservation | null;
  onClose: () => void;
}

export const ApproveDepositModal: React.FC<ApproveDepositModalProps> = ({
  isOpen,
  reservation,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !reservation) return null;

  const waiverUrl = generateWaiverShareLink(reservation.id);
  const waUrl = generateWaiverWhatsAppMessage(reservation);
  const formattedDate = formatDateDDMMAAAA(reservation.date);

  const rawMessageText = `¡Hola ${reservation.parentName}! 👋 Confirmamos con éxito la recepción del pedido de reserva para el cumpleaños de *${reservation.childName}* el día *${formattedDate}* (${reservation.slotTime}) en *${reservation.branchName}* 🎪🎉.\n\nPara completar la habilitación del salón y el acceso a los juegos deportivos (muro de escalada, tirolesa, camas elásticas y circuitos acrobáticos), por favor completá y firmá el *Desligamiento de Responsabilidad y Ficha Médica* en este enlace seguro:\n\n👉 ${waiverUrl}\n\nQuedamos a disposición para cualquier consulta. ¡Nos vemos pronto para festejar! 🎈`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(waiverUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(rawMessageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-zinc-950 border-2 border-emerald-500 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="p-5 bg-black border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                Seña Confirmada ($100.000)
              </span>
              <h3 className="font-heading font-black text-base text-white uppercase">
                Notificar Términos y Condiciones
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-5 text-white">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Titular:</span>
              <span className="text-white font-black">{reservation.parentName} ({reservation.parentPhone})</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Cumpleañero/a:</span>
              <span className="text-amber-400 font-black">{reservation.childName} ({reservation.childAge} años)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400 font-bold">Fecha & Sucursal:</span>
              <span className="text-white font-black">{formattedDate} • {reservation.slotTime} • {reservation.branchName}</span>
            </div>
          </div>

          {/* Form Link Section */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#1EB8BF] uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Link Directo a Términos y Condiciones
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={waiverUrl}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 select-all font-mono"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                title="Copiar enlace"
              >
                {copied ? <Check className="w-4 h-4 text-[#A3BA13]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              El cliente podrá completar sus datos de emergencia y firmar la declaración jurada desde su celular o computadora. Una vez firmado, quedará incorporado a su ficha de reserva.
            </p>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase text-zinc-400">
              Vista Previa del Mensaje (con Emojis):
            </span>
            <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-300 whitespace-pre-line max-h-32 overflow-y-auto font-sans leading-relaxed select-all">
              {rawMessageText}
            </div>
          </div>

          {/* WhatsApp Direct Action Button */}
          <div className="pt-2 space-y-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-black font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all cursor-pointer hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5 fill-black text-black" />
              <span>Enviar WhatsApp al Cliente</span>
            </a>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? '¡Mensaje Completo Copiado!' : 'Copiar Mensaje Completo'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase cursor-pointer"
            >
              Cerrar y enviar luego
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

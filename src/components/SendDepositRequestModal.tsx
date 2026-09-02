import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Copy, 
  Check, 
  CreditCard, 
  Building2, 
  Sparkles,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  DollarSign
} from 'lucide-react';
import { Reservation } from '../types';
import { formatWhatsAppNumber, formatDateDDMMAAAA } from '../services/storage';
import { DEFAULT_BANK_INFO } from '../data/initialData';

interface SendDepositRequestModalProps {
  isOpen: boolean;
  reservation: Reservation | null;
  onClose: () => void;
}

export const SendDepositRequestModal: React.FC<SendDepositRequestModalProps> = ({
  isOpen,
  reservation,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Bank details (can be personalized)
  const [bankName, setBankName] = useState(DEFAULT_BANK_INFO.bankName);
  const [accountHolder, setAccountHolder] = useState(DEFAULT_BANK_INFO.accountHolder);
  const [cuit, setCuit] = useState(DEFAULT_BANK_INFO.cuit);
  const [alias, setAlias] = useState(DEFAULT_BANK_INFO.alias);
  const [cbu, setCbu] = useState(DEFAULT_BANK_INFO.cbu);
  const [amount, setAmount] = useState(DEFAULT_BANK_INFO.depositAmount);

  if (!isOpen || !reservation) return null;

  const cleanPhone = formatWhatsAppNumber(reservation.parentPhone);
  const formattedDate = formatDateDDMMAAAA(reservation.date);

  const messageText = `¡Hola *${reservation.parentName}*! 👋

Te confirmamos la *recepción de tu pedido de reserva* para el cumpleaños de *${reservation.childName}* (${reservation.childAge} años) en *${reservation.branchName}* 🎪🎉:

📅 *Fecha:* ${formattedDate}
⏰ *Turno:* ${reservation.slotTime}
👥 *Chicos estimados:* ${reservation.estimatedKids} invitados

Para confirmar definitivamente la fecha en nuestro calendario y asegurar la exclusividad del salón, solicitamos una seña de *$${amount.toLocaleString('es-AR')}*:

🏦 *DATOS DE TRANSFERENCIA BANCARIA:*
• *Banco:* ${bankName}
• *Titular:* ${accountHolder}
• *CUIT:* ${cuit}
• *Alias:* ${alias}
• *CBU:* ${cbu}
• *Monto de Seña:* $${amount.toLocaleString('es-AR')}

⚠️ *IMPORTANTE:* Una vez efectuada la transferencia, *por favor envíanos el comprobante de pago por este mismo chat de WhatsApp* para registrar la seña en el sistema y habilitar el formulario de deslinde y seguridad.

¡Muchas gracias! Quedamos a disposición por cualquier duda. 🎈`;

  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto text-white">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                Confirmación de Pedido
              </span>
              <h3 className="font-heading font-black text-base text-white uppercase">
                Enviar Datos de Seña por WhatsApp
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Reservation Brief */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Titular:</span>
              <span className="text-white font-black">{reservation.parentName} ({reservation.parentPhone})</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Cumpleañero/a:</span>
              <span className="text-amber-400 font-black">{reservation.childName} ({reservation.childAge} años)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-bold">Fecha & Sucursal:</span>
              <span className="text-white font-bold">{reservation.date} • {reservation.slotTime} ({reservation.branchName})</span>
            </div>
          </div>

          {/* Bank Transfer Details Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#1EB8BF]" /> Datos de la Cuenta Bancaria
              </span>
              <span className="text-xs font-black text-emerald-400">
                Monto Seña: ${amount.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Alias</span>
                  <strong className="text-white font-mono text-sm tracking-wider">{alias}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(alias, 'alias')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'alias' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">CBU</span>
                  <span className="text-zinc-300 font-mono text-xs select-all">{cbu}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(cbu, 'cbu')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedField === 'cbu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'cbu' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px] text-zinc-400">
                <span>Titular: <strong className="text-zinc-200">{accountHolder}</strong></span>
                <span>CUIT: <strong className="text-zinc-200">{cuit}</strong></span>
              </div>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase text-zinc-400">
              Vista Previa del Mensaje (con Emojis):
            </span>
            <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3.5 text-xs text-zinc-300 whitespace-pre-line max-h-36 overflow-y-auto font-sans leading-relaxed select-all">
              {messageText}
            </div>
          </div>

          {/* Info note */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              El mensaje recuerda al cliente que <strong>debe adjuntar el comprobante por WhatsApp</strong> para registrar el pago y recibir el formulario de deslinde.
            </p>
          </div>

          {/* WhatsApp Direct Action */}
          <div className="pt-1 space-y-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-black font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
            >
              <MessageCircle className="w-5 h-5 fill-black text-black" />
              <span>Enviar Datos de Seña por WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopy(messageText, 'all')}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedField === 'all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedField === 'all' ? '¡Texto Completo Copiado!' : 'Copiar Texto para Enviar'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

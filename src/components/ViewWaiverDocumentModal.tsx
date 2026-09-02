import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Printer, 
  Download, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Heart, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Reservation, LiabilityWaiver } from '../types';
import { formatDateDDMMAAAA } from '../services/storage';
import logoBlanca from '../assets/images/marca_el_galpon_blanca.svg';

interface ViewWaiverDocumentModalProps {
  isOpen: boolean;
  reservation: Reservation | null;
  onClose: () => void;
}

export const ViewWaiverDocumentModal: React.FC<ViewWaiverDocumentModalProps> = ({
  isOpen,
  reservation,
  onClose,
}) => {
  if (!isOpen || !reservation) return null;

  const waiver: LiabilityWaiver | undefined = reservation.liabilityWaiver;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border-2 border-[#1EB8BF] rounded-3xl w-full max-w-3xl overflow-hidden shadow-[8px_8px_0px_0px_#1EB8BF] my-auto">
        
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 bg-black border-b-2 border-zinc-800 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A3BA13]/20 border border-[#A3BA13] flex items-center justify-center text-[#A3BA13] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#A3BA13] text-black">
                  Acta Digital Firmada
                </span>
                <span className="text-xs text-zinc-400 font-bold">
                  ID: {reservation.id}
                </span>
              </div>
              <h2 className="font-heading font-black text-base sm:text-lg text-white uppercase tracking-tight">
                Términos y Condiciones de la Reserva
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir o guardar PDF"
            >
              <Printer className="w-4 h-4 text-[#1EB8BF]" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DOCUMENT CONTENT */}
        <div className="p-5 sm:p-8 max-h-[78vh] overflow-y-auto space-y-6 bg-zinc-950 text-white">
          
          {waiver ? (
            <div className="bg-black/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-inner" id="printable-waiver">
              
              {/* Document Header with Logo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <img src={logoBlanca} alt="El Galpón" className="h-10 w-auto object-contain" />
                  <p className="text-[11px] text-zinc-400 font-medium mt-1">
                    Espacio Recreativo y Deportivo Infantil • {reservation.branchName}
                  </p>
                </div>
                <div className="text-left sm:text-right space-y-0.5 text-xs">
                  <div className="text-[#A3BA13] font-black uppercase text-[11px]">
                    Certificado de Términos Aceptados # {waiver.id || reservation.id}
                  </div>
                  <div className="text-zinc-400 font-medium">
                    Firmado: {new Date(waiver.signedAt).toLocaleString('es-AR')}
                  </div>
                  <div className="text-zinc-400 font-medium">
                    Estado: <strong className="text-[#A3BA13]">Completado y Habilitado</strong>
                  </div>
                </div>
              </div>

              {/* Event Context */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 font-bold block text-[10px] uppercase">Evento</span>
                  <span className="font-heading font-black text-white text-sm">Cumple de {reservation.childName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block text-[10px] uppercase">Fecha & Turno</span>
                  <span className="font-bold text-[#F2C700]">{formatDateDDMMAAAA(reservation.date)} ({reservation.slotTime})</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block text-[10px] uppercase">Sucursal</span>
                  <span className="font-bold text-white">{reservation.branchName}</span>
                </div>
              </div>

              {/* Signer Data */}
              <div className="space-y-3 text-xs">
                <h4 className="font-heading font-black text-sm text-[#1EB8BF] uppercase border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Datos del Adulto Titular Responsable
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Nombre Completo</span>
                    <strong className="text-white text-sm">{waiver.signerFullName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">DNI / Documento</span>
                    <strong className="text-white text-sm">{waiver.signerDni}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Teléfono de Contacto</span>
                    <span className="text-zinc-200">{waiver.signerPhone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Vínculo con el Menor</span>
                    <span className="text-zinc-200 uppercase font-bold">{waiver.relationship} {waiver.relationshipDetail && `(${waiver.relationshipDetail})`}</span>
                  </div>
                  {waiver.signerAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Domicilio</span>
                      <span className="text-zinc-300">{waiver.signerAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Child & Emergency Health Info */}
              <div className="space-y-3 text-xs">
                <h4 className="font-heading font-black text-sm text-[#ED3078] uppercase border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> Ficha de Salud & Contacto de Emergencia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Cumpleañero/a</span>
                    <strong className="text-white">{waiver.childFullName} ({waiver.childAge} años)</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Cobertura Médica / Obra Social</span>
                    <span className="text-zinc-200">{waiver.medicalInsurance || 'No informada'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Contacto de Emergencia</span>
                    <span className="text-zinc-200">{waiver.emergencyContactName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Teléfono de Emergencia</span>
                    <span className="text-zinc-200">{waiver.emergencyContactPhone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Alergias / Cuidados Médicos</span>
                    <span className="text-zinc-300">{waiver.medicalConditions || 'Sin observaciones médicas'}</span>
                  </div>
                </div>
              </div>

              {/* Accepted Legal Clauses */}
              <div className="space-y-2 text-xs">
                <h4 className="font-heading font-black text-sm text-[#F2C700] uppercase border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Cláusulas Aceptadas y Declaración Jurada
                </h4>
                <ul className="space-y-1.5 text-zinc-300 text-[11px] bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3BA13] shrink-0" />
                    <span>Conformidad con el reglamento interno de seguridad, calzado e indicaciones de profesores.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3BA13] shrink-0" />
                    <span>Declaración jurada de aptitud psicofísica para juegos de altura, destreza, telas y saltos.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3BA13] shrink-0" />
                    <span>Asunción voluntaria de riesgos comunes inherentes a la práctica deportiva activa infantil.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3BA13] shrink-0" />
                    <span>Autorización expresa para primeros auxilios y asistencia médica de urgencia.</span>
                  </li>
                </ul>
              </div>

              {/* Digital Signature Stamp */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Firma Digital Registrada</span>
                  <div className="bg-black/60 border border-zinc-700 rounded-xl p-2 max-w-[260px]">
                    <img 
                      src={waiver.signatureDataUrl} 
                      alt="Firma del titular" 
                      className="h-16 w-auto object-contain mx-auto filter invert"
                    />
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 text-xs text-zinc-400">
                  <div>Titular: <strong className="text-white">{waiver.signerFullName}</strong></div>
                  <div>DNI: <strong className="text-white">{waiver.signerDni}</strong></div>
                  <div className="text-[10px] text-zinc-500">
                    Estampa de tiempo: {new Date(waiver.signedAt).toISOString()}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
              <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="font-heading font-black text-lg text-white uppercase">
                Deslinde Pendiente de Firma
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                El titular aún no ha completado el formulario digital para esta reserva. Puedes enviarle el recordatorio directo por WhatsApp.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

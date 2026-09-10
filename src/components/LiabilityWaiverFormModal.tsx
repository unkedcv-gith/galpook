import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Heart, 
  Phone, 
  User, 
  Mail, 
  Eraser, 
  Printer, 
  Star,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Clock,
  MessageCircle,
  AlertCircle,
  Building2,
  CreditCard,
  Copy,
  DollarSign,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Reservation, LiabilityWaiver } from '../types';
import { 
  saveLiabilityWaiver, 
  fetchReservationByIdAsync, 
  formatWhatsAppNumber, 
  formatDateDDMMAAAA,
  getPricingSettings,
  markReservationTermsOpened,
  getRemainingReservationSeconds,
  isReservationExpired,
  isReservationCircuitCompleted
} from '../services/storage';
import { DEFAULT_BANK_INFO, BRAND_INFO } from '../data/initialData';

interface LiabilityWaiverFormModalProps {
  isOpen: boolean;
  reservationId?: string | null;
  onClose: () => void;
  onWaiverSaved?: (updatedReservation: Reservation) => void;
}

export const LiabilityWaiverFormModal: React.FC<LiabilityWaiverFormModalProps> = ({
  isOpen,
  reservationId,
  onClose,
  onWaiverSaved,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [signerFullName, setSignerFullName] = useState('');
  const [signerDni, setSignerDni] = useState('');
  const [signerPhone, setSignerPhone] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerAddress, setSignerAddress] = useState('');
  const [relationship, setRelationship] = useState<'madre' | 'padre' | 'tutor' | 'familiar' | 'otro'>('madre');
  const [relationshipDetail, setRelationshipDetail] = useState('');

  // Child & Medical Emergency info
  const [childFullName, setChildFullName] = useState('');
  const [childAge, setChildAge] = useState<number | string>(7);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [medicalInsurance, setMedicalInsurance] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');

  // Final Agreement Checkbox
  const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] = useState(false);

  const [formError, setFormError] = useState('');

  // Canvas Signature state & backup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [savedSignatureDataUrl, setSavedSignatureDataUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 40-Minute Hold countdown state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(40 * 60);

  useEffect(() => {
    if (!isOpen || !reservation || isSubmitted) return;
    if (isReservationCircuitCompleted(reservation)) return;

    const updateTimer = () => {
      const sec = getRemainingReservationSeconds(reservation);
      setRemainingSeconds(sec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, reservation, isSubmitted]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Reset or load reservation data when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setFormError('');
      setSavedSignatureDataUrl(null);
      if (reservationId) {
        setIsLoadingReservation(true);
        fetchReservationByIdAsync(reservationId).then((found) => {
          setIsLoadingReservation(false);
          if (found) {
            setReservation(found);
            setSignerFullName(found.parentName || (found.liabilityWaiver && found.liabilityWaiver.signerFullName) || '');
            setSignerPhone(found.parentPhone || (found.liabilityWaiver && found.liabilityWaiver.signerPhone) || '');
            setSignerEmail(found.parentEmail || (found.liabilityWaiver && found.liabilityWaiver.signerEmail) || '');
            setSignerDni((found.liabilityWaiver && found.liabilityWaiver.signerDni) || '');
            setSignerAddress((found.liabilityWaiver && found.liabilityWaiver.signerAddress) || '');
            setChildFullName(found.childName || (found.liabilityWaiver && found.liabilityWaiver.childFullName) || '');
            setChildAge(found.childAge || (found.liabilityWaiver && found.liabilityWaiver.childAge) || 7);
            setEmergencyContactName(found.parentName || '');
            setEmergencyContactPhone(found.parentPhone || '');

            // Record terms opened (and start 40-min hold timer if not already running)
            if (!found.termsOpenedAt || !found.termsSentAt) {
              markReservationTermsOpened(found.id).then((updated) => {
                if (updated) setReservation(updated);
              });
            }

            if (found.liabilityWaiver && found.liabilityWaiver.status === 'signed') {
              setIsSubmitted(true);
            }
          }
        }).catch(() => {
          setIsLoadingReservation(false);
        });
      }
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, reservationId]);

  // Setup Canvas Signature when step 3 is reached
  useEffect(() => {
    if (isOpen && step === 3 && canvasRef.current && !isSubmitted) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1EB8BF';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (savedSignatureDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            setHasSignature(true);
          };
          img.src = savedSignatureDataUrl;
        }
      }
    }
  }, [isOpen, step, isSubmitted, savedSignatureDataUrl]);

  if (!isOpen) return null;

  const scrollToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  };

  const handleNextStep1 = () => {
    setStep(2);
    scrollToTop();
  };

  const handleNextStep2 = () => {
    setStep(3);
    scrollToTop();
  };

  const handleNextStep3 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    // Validations: ALL ADULT FIELDS MANDATORY
    if (!signerFullName.trim()) {
      setFormError('Por favor ingresá tu nombre y apellido completo.');
      return;
    }
    if (!signerDni.trim()) {
      setFormError('Por favor ingresá tu número de DNI / Documento.');
      return;
    }
    if (!signerPhone.trim()) {
      setFormError('Por favor ingresá tu número de teléfono celular de contacto.');
      return;
    }
    if (!signerEmail.trim()) {
      setFormError('Por favor ingresá tu correo electrónico de contacto.');
      return;
    }
    if (!signerEmail.includes('@') || !signerEmail.includes('.')) {
      setFormError('Por favor ingresá un formato de correo electrónico válido (ej: nombre@gmail.com).');
      return;
    }
    if (!signerAddress.trim()) {
      setFormError('Por favor ingresá tu domicilio / localidad.');
      return;
    }
    if (relationship === 'otro' && !relationshipDetail.trim()) {
      setFormError('Por favor especificá el vínculo con el agasajado.');
      return;
    }
    if (!childFullName.trim()) {
      setFormError('Por favor ingresá el nombre completo del cumpleañero/a.');
      return;
    }
    if (!childAge || Number(childAge) < 1) {
      setFormError('Por favor indicá la edad a cumplir del cumpleañero/a.');
      return;
    }
    if (!hasSignature && !savedSignatureDataUrl) {
      setFormError('Por favor realizá tu firma digital en el recuadro designado.');
      return;
    }
    if (!acceptedTermsAndConditions) {
      setFormError('Debes marcar el casillero indicando que has leído y aceptas los términos y condiciones.');
      return;
    }

    // Save signature dataURL before moving to step 4
    if (canvasRef.current && hasSignature) {
      try {
        const sigUrl = canvasRef.current.toDataURL('image/png');
        setSavedSignatureDataUrl(sigUrl);
      } catch (err) {
        console.warn('Canvas export warning:', err);
      }
    }

    setFormError('');
    setStep(4);
    scrollToTop();
  };

  // Signature Canvas Handlers with accurate mobile scale calculation
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    setSavedSignatureDataUrl(null);
  };

  const handleSubmitWaiver = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    const finalSignature = savedSignatureDataUrl || (canvasRef.current && hasSignature ? canvasRef.current.toDataURL('image/png') : null);

    if (!finalSignature) {
      setFormError('Falta registrar la firma digital. Por favor volvé al paso 3/4.');
      setStep(3);
      return;
    }

    setIsSubmitting(true);

    try {
      const waiverData: LiabilityWaiver = {
        id: `waiver_${Date.now().toString(36)}`,
        reservationId: reservationId || `res_direct_${Date.now().toString(36)}`,
        signedAt: new Date().toISOString(),
        signerFullName: signerFullName.trim(),
        signerDni: signerDni.trim(),
        signerPhone: signerPhone.trim(),
        signerEmail: signerEmail.trim(),
        signerAddress: signerAddress.trim(),
        relationship,
        relationshipDetail: relationship === 'otro' ? relationshipDetail.trim() : undefined,
        childFullName: childFullName.trim(),
        childAge: Number(childAge) || 7,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        medicalInsurance: medicalInsurance.trim() || undefined,
        medicalConditions: medicalConditions.trim() || undefined,
        acceptedRules: true,
        acceptedPhysicalFitness: true,
        acceptedRiskAssumption: true,
        acceptedMedicalEmergencyAuth: true,
        acceptedTermsAndConditions: true,
        signatureDataUrl: finalSignature,
        status: 'signed',
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Form',
      };

      if (reservationId) {
        const updated = await saveLiabilityWaiver(reservationId, waiverData);
        if (updated && onWaiverSaved) {
          onWaiverSaved(updated);
        }
      }

      setIsSubmitted(true);
      scrollToTop();
    } catch (err) {
      console.error(err);
      setFormError('Ocurrió un error al registrar la firma. Por favor reintenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const depositAmount = reservation?.depositAmount || getPricingSettings().birthdays.depositAmount;
  const formattedDate = reservation ? formatDateDDMMAAAA(reservation.date) : '';
  const destinationPhone = formatWhatsAppNumber(
    reservation?.branchPhone || (reservation?.branchId === 'calle-13' ? '221 573-1047' : '221 573-1047')
  );
  const receiptMessage = `¡Hola El Galpón! 👋\n\nYa completé y firmé los *Términos y Condiciones* para el cumpleaños de *${childFullName || reservation?.childName}* (${childAge} años) en *${reservation?.branchName || 'El Galpón'}* para el día *${formattedDate}* (${reservation?.slotTime || ''}).\n\nAdjunto en este mensaje el *comprobante de la seña* de $${depositAmount.toLocaleString('es-AR')} para confirmar definitivamente la reserva. 🎈`;
  const waReceiptUrl = `https://api.whatsapp.com/send?phone=${destinationPhone}&text=${encodeURIComponent(receiptMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border-2 border-[#1EB8BF] rounded-3xl w-full max-w-3xl overflow-hidden shadow-[8px_8px_0px_0px_#1EB8BF] my-auto">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-black border-b-2 border-zinc-800 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1EB8BF]/20 border border-[#1EB8BF] flex items-center justify-center text-[#1EB8BF] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#A3BA13] text-black">
                  {isSubmitted ? 'Documento Completado' : `Pantalla ${step} de 4`}
                </span>
                <span className="text-[11px] text-zinc-400 font-bold hidden sm:inline-block">
                  {reservation?.branchName || 'El Galpón'}
                </span>
              </div>
              <h2 className="font-heading font-black text-base sm:text-xl text-white uppercase tracking-tight">
                Términos y Condiciones de la Reserva
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        {!isSubmitted && (
          <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 w-full max-w-md">
              <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-[#A3BA13]' : 'bg-zinc-800'}`} />
              <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[#1EB8BF]' : 'bg-zinc-800'}`} />
              <div className={`h-2 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-[#ED3078]' : 'bg-zinc-800'}`} />
              <div className={`h-2 flex-1 rounded-full transition-all ${step >= 4 ? 'bg-[#F2C700]' : 'bg-zinc-800'}`} />
            </div>
            <span className="text-[11px] font-black text-zinc-400 shrink-0">
              {step === 1 && '1/4 Ingreso & Capacidad'}
              {step === 2 && '2/4 Menú & Pagos'}
              {step === 3 && '3/4 Normas & Firma'}
              {step === 4 && '4/4 Envío de Seña'}
            </span>
          </div>
        )}

        {/* 40-MINUTE HOLD STATUS BANNER */}
        {!isSubmitted && reservation && !isReservationCircuitCompleted(reservation) && (
          <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs transition-colors ${
            remainingSeconds > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-rose-950/70 border-rose-600/60 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 shrink-0 ${remainingSeconds > 0 ? 'text-amber-400 animate-pulse' : 'text-rose-400'}`} />
              <span className="font-bold">
                {remainingSeconds > 0 ? (
                  <>
                    <strong className="text-white uppercase tracking-tight mr-1">IMPORTANTE:</strong> 
                    A partir de ingresar al formulario tenés 40 minutos para mantener tu día y hora de reserva.
                  </>
                ) : (
                  <>
                    <strong className="text-rose-300 uppercase tracking-tight mr-1">TIEMPO AGOTADO:</strong> 
                    Han transcurrido los 40 minutos. Esta fecha y hora han vuelto a quedar disponibles en el almanaque.
                  </>
                )}
              </span>
            </div>

            {remainingSeconds > 0 ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-zinc-400 font-bold hidden sm:inline">Restan:</span>
                <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-black/90 border border-amber-500/50 text-amber-300 shadow-inner">
                  {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:
                  {(remainingSeconds % 60).toString().padStart(2, '0')} min
                </span>
              </div>
            ) : (
              <a
                href={`https://api.whatsapp.com/send?phone=${destinationPhone}&text=${encodeURIComponent('¡Hola El Galpón! Quería consultar por la disponibilidad para el cumpleaños de ' + (childFullName || reservation.childName) + ' en ' + reservation.branchName + '.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-black border border-rose-500/50 font-black text-[11px] uppercase transition-colors shrink-0"
              >
                Consultar por WhatsApp
              </a>
            )}
          </div>
        )}

        {/* MODAL BODY */}
        <div ref={modalBodyRef} className="p-4 sm:p-6 max-h-[78vh] overflow-y-auto space-y-6">
          
          {isSubmitted ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="py-8 px-4 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#A3BA13]/20 border-2 border-[#A3BA13] flex items-center justify-center text-[#A3BA13] mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#A3BA13] text-black text-xs font-black uppercase tracking-wider">
                  ¡Términos Aceptados & Formulario Enviado!
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase">
                  Términos Aceptados para el Cumple de {childFullName || reservation?.childName}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                  Los datos han sido incorporados correctamente a la reserva.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-black/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-bold">Titular Responsable:</span>
                  <span className="text-white font-black">{signerFullName} (DNI: {signerDni})</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-bold">Cumpleañero/a:</span>
                  <span className="text-[#F2C700] font-black">{childFullName} ({childAge} años)</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-bold">Fecha del Evento:</span>
                  <span className="text-white font-black">{reservation?.date} • {reservation?.slotTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold">Estado de Términos:</span>
                  <span className="text-[#A3BA13] font-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Términos Aceptados y Firmados
                  </span>
                </div>
              </div>

              {/* Bank Transfer Details Reminder */}
              <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Datos de Transferencia (Seña):</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">${depositAmount.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold">Alias</span>
                    <strong className="text-white font-mono text-xs">{DEFAULT_BANK_INFO.alias}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEFAULT_BANK_INFO.alias, 'alias_success')}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedField === 'alias_success' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'alias_success' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold">CBU</span>
                    <strong className="text-zinc-300 font-mono text-[11px] select-all break-all">{DEFAULT_BANK_INFO.cbu}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEFAULT_BANK_INFO.cbu, 'cbu_success')}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedField === 'cbu_success' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'cbu_success' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Highlighting Notice in Success */}
              <div className="bg-[#25D366]/15 border-2 border-[#25D366] rounded-2xl p-4 max-w-md mx-auto text-left flex items-start gap-3">
                <MessageCircle className="w-6 h-6 text-[#25D366] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black text-white text-xs uppercase block">Paso Final Importante:</span>
                  <p className="text-xs font-black text-[#25D366]">
                    Es fundamental enviar comprobante de la seña por Whatsapp para iniciar la reserva.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={waReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 fill-black text-black" />
                  <span>Enviar Comprobante por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4 text-[#1EB8BF]" />
                  <span>Imprimir Comprobante</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#1EB8BF] hover:bg-[#19a1a7] text-black font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <span>Listo, Continuar</span>
                </button>
              </div>
            </div>
          ) : (
            /* WIZARD SCREENS */
            <div>
              {/* Event Context Banner */}
              {reservation && (
                <div className="bg-[#1EB8BF]/10 border border-[#1EB8BF]/30 rounded-2xl p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-[#1EB8BF] font-black uppercase tracking-wider">
                      Reserva Solicitada
                    </div>
                    <div className="font-heading font-black text-sm text-white uppercase">
                      Cumple de {reservation.childName} • {reservation.branchName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px] bg-black/60 px-3 py-1.5 rounded-xl border border-zinc-800 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-[#F2C700]" />
                    <span>{reservation.date} ({reservation.slotTime})</span>
                  </div>
                </div>
              )}

              {/* SCREEN 1 OF 3 (1.jpeg Content) */}
              {step === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Top Header Card */}
                  <div className="bg-gradient-to-r from-[#88A613] to-[#A3BA13] rounded-2xl p-4 text-black space-y-1 shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded text-white">
                      NO SOMOS UN TÍPICA CASITA DE FIESTAS, EN EL GALPÓN...
                    </span>
                    <h3 className="font-heading font-black text-2xl uppercase tracking-tight text-black">
                      # FESTEJA DISTINTO
                    </h3>
                    <div className="inline-block bg-pink-600 text-white font-black text-xs uppercase px-3 py-1 rounded-lg mt-1">
                      INFORMACIÓN IMPORTANTE — Para que tu fiesta sea genial!
                    </div>
                  </div>

                  {/* SECTION: INGRESO Y EGRESO AL SALÓN */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-heading font-black text-base text-[#1EB8BF] uppercase border-b border-zinc-800 pb-2">
                      INGRESO Y EGRESO AL SALÓN
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-200">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                        <strong className="text-white block uppercase">INGRESO: 15/20 min. antes de la hora del evento</strong>
                        <p className="text-zinc-400">Máximo 5 personas para acomodar pertenencias.</p>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                        <strong className="text-white block uppercase">EGRESO: 15 min. posterior al horario contratado</strong>
                        <p className="text-zinc-400">Tiempo límite para retirar las cosas del salón.</p>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-amber-300/90 font-medium bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Por favor respetar el horario!!</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>Al resto de los invitados se les dará ingreso a la hora pactada del evento. Arbitre los medios necesarios para que sus invitados lleguen y se retiren en el horario establecido.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><em>No comprometa al personal. De no ser así se cobrará hora adicional.</em></span>
                      </li>
                    </ul>
                  </div>

                  {/* SECTION: CAPACIDAD MÁXIMA */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-heading font-black text-base text-[#ED3078] uppercase border-b border-zinc-800 pb-2">
                      CAPACIDAD MÁXIMA
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="text-[#ED3078] font-black uppercase block text-[11px]">ADULTOS</span>
                        <strong className="text-white text-sm">30 (pagando adicionales)</strong>
                        <span className="text-zinc-400 block text-[11px]">Sin excepción.</span>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="text-[#1EB8BF] font-black uppercase block text-[11px]">NIÑOS</span>
                        <strong className="text-white text-sm">40 (pagando adicionales)</strong>
                        <span className="text-zinc-400 block text-[11px]">Incluidos los contratantes y cumpleañero/a.</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-zinc-300 font-medium bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-[#ED3078] shrink-0 mt-0.5" />
                        <span>No se compensa tener menos adultos agregando más chicos, son 2 sectores distintos.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-[#ED3078] shrink-0 mt-0.5" />
                        <span><strong>Menores de 4 años:</strong> no se contabilizan ya que están a cargo de los padres / NO pueden participar de las actividades con los profes / SI pueden hacer uso de la plaza blanda.</span>
                      </li>
                      <li className="flex items-start gap-2 text-rose-300">
                        <ChevronRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span><em>No comprometa al personal. Tenga en cuenta que la persona excedente no podrá ingresar al salón.</em></span>
                      </li>
                    </ul>
                  </div>

                  {/* SECTION: ADICIONALES */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-heading font-black text-base text-[#F2C700] uppercase border-b border-zinc-800 pb-2">
                      ADICIONALES: incluyen más personal y comida
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                      Se cobrará todo el monto del adicional que se haya contratado, aunque no asistan la cantidad de invitados prevista. Si el día del evento van más invitados que los confirmados se cobrará el adicional correspondiente. El adicional no se cobra por persona.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold pt-1">
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-zinc-200">
                        • <strong className="text-white">ADICIONAL +8 CHICOS</strong> &gt; NENE 21 AL 28
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-zinc-200">
                        • <strong className="text-white">ADICIONAL +15 CHICOS</strong> &gt; NENE 29 AL 35
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-[#A3BA13] text-[#A3BA13]">
                        • <strong>ADICIONAL +20 CHICOS</strong> &gt; NENE 36 AL 40 <span className="text-[10px] bg-[#A3BA13] text-black px-1.5 py-0.5 rounded font-black ml-1 uppercase">Máximo Permitido</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-zinc-200">
                        • <strong className="text-white">ADICIONAL +10 ADULTOS</strong> &gt; ADULTO 21 AL 30
                      </div>
                    </div>
                  </div>

                  {/* Yellow Footer Box */}
                  <div className="bg-[#F2C700] text-black rounded-2xl p-3.5 text-center font-heading font-black text-xs uppercase shadow-md">
                    POR FAVOR LÉELO!! ES IMPORTANTE. CUALQUIER DUDA NOS ESCRIBÍS
                  </div>

                  {/* NEXT BUTTON STEP 1 */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep1}
                      className="w-full py-4 px-6 rounded-2xl bg-[#A3BA13] hover:bg-[#8eA310] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <span>He leído y acepto 1/4</span>
                      <ChevronRight className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>

                </div>
              )}

              {/* SCREEN 2 OF 4 (2.jpeg Content) */}
              {step === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Top Header Card */}
                  <div className="bg-gradient-to-r from-[#1EB8BF] to-teal-400 rounded-2xl p-4 text-black space-y-1 shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded text-white">
                      INFORMACIÓN IMPORTANTE — PANTALLA 2/4
                    </span>
                    <h3 className="font-heading font-black text-2xl uppercase tracking-tight text-black">
                      COMIDA, BEBIDA Y FORMAS DE PAGO
                    </h3>
                  </div>

                  {/* SECTION: COMIDA Y BEBIDA */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-heading font-black text-base text-[#1EB8BF] uppercase border-b border-zinc-800 pb-2">
                      COMIDA Y BEBIDA
                    </h4>

                    {/* Menú de regalo */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <span className="text-[#A3BA13] font-black uppercase text-xs block">
                        MENÚ DE REGALO
                      </span>
                      <div className="space-y-1 text-zinc-200">
                        <p>• <strong>ADULTOS:</strong> snacks (1 vez) + 1 empanada por persona + 2 pizzas cada 8 personas</p>
                        <p>• <strong>CHICOS:</strong> snacks (1 vez) + 1 superpancho o pizza + gaseosa, jugo y agua</p>
                      </div>
                      <p className="text-[11px] text-zinc-400 italic">
                        (Se debe avisar en caso de querer pizzas, si no se servirán superpanchos).
                      </p>
                      <p className="text-[11px] text-rose-300 font-bold">
                        No se permite llevar más comida para los nenes. Tampoco dulce. Se servirá la comida según los asistentes al evento.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300 font-medium">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <strong className="text-white block uppercase">COMIDA EXTRA PARA ADULTOS:</strong>
                        <span>Para una mejor organización, si necesitan agregar comida para los adultos deben avisarnos con anticipación qué llevarán, ya que no todo se puede servir con facilidad.</span>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <strong className="text-white block uppercase">BEBIDA:</strong>
                        <span>Se llevará refrigerada el mismo día del evento. Luego la colocamos en nuestra heladera.</span>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <strong className="text-white block uppercase">INVITADO/A CELÍACO, VEGANO O VEGETARIANO:</strong>
                        <span>Deberán llevar su comida.</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION: PAGOS */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-heading font-black text-base text-[#F2C700] uppercase border-b border-zinc-800 pb-2">
                      PAGOS Y SEÑA
                    </h4>

                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <strong className="text-white block uppercase text-xs">EN CASO DE TENER SALDO A PAGAR:</strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="bg-black/60 p-2.5 rounded-lg border border-zinc-800 text-zinc-300">
                          <strong className="text-[#1EB8BF]">Efectivo:</strong> el día del evento antes de abrir a los invitados.
                        </div>
                        <div className="bg-black/60 p-2.5 rounded-lg border border-zinc-800 text-zinc-300">
                          <strong className="text-[#1EB8BF]">Transferencia:</strong> el día anterior al evento.
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-zinc-300 font-medium bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-[#F2C700] shrink-0 mt-0.5" />
                        <span>Se puede adelantar el pago. Coordinamos y se entregará en efectivo en el salón.</span>
                      </li>
                      <li className="flex items-start gap-2 text-amber-300 font-bold">
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>La seña no tiene devolución.</strong> En caso de enfermedad o fuerza mayor se reprogramará la fecha.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Yellow Footer Box */}
                  <div className="bg-[#F2C700] text-black rounded-2xl p-3.5 text-center font-heading font-black text-xs uppercase shadow-md">
                    POR FAVOR LÉELO!! ES IMPORTANTE. CUALQUIER DUDA NOS ESCRIBÍS
                  </div>

                  {/* BUTTONS STEP 2 */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setStep(1); scrollToTop(); }}
                      className="px-4 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver 1/4</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep2}
                      className="flex-1 py-4 px-6 rounded-2xl bg-[#1EB8BF] hover:bg-[#19a1a7] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <span>He leído y acepto 2/4</span>
                      <ChevronRight className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>

                </div>
              )}

              {/* SCREEN 3 OF 4 (3.jpeg Content + FORM + SIGNATURE) */}
              {step === 3 && (
                <form onSubmit={handleNextStep3} className="space-y-6 animate-fadeIn">
                  
                  {/* Top Header Card */}
                  <div className="bg-gradient-to-r from-[#ED3078] to-pink-500 rounded-2xl p-4 text-white space-y-1 shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded text-white">
                      INFORMACIÓN IMPORTANTE — PANTALLA 3/4
                    </span>
                    <h3 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                      Para una buena organización y cuidado del galpón
                    </h3>
                  </div>

                  {/* SECTION: NO SE PUEDE */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-heading font-black text-base text-[#ED3078] uppercase border-b border-zinc-800 pb-2">
                      NO SE PUEDE:
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-200 font-medium">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Usar papel picado, confeti, espuma ni globos sueltos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Pegar cosas en las paredes sin previa autorización del responsable del salón.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Romper la torta piñata en el salón, para evitar pérdida de tiempo en el desarrollo del evento.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Traer Blow Cake (torta con glitter comestible que se sopla).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Ingresar al sector de juegos con vasos/bebida y/o comida.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Hacer uso del muro o la tirolesa ni de los materiales sin la supervisión de los profesores.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>No se permite el ingreso de animales al salón.</span>
                      </li>
                    </ul>
                  </div>

                  {/* SECTION: TENER EN CUENTA */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-heading font-black text-base text-[#1EB8BF] uppercase border-b border-zinc-800 pb-2">
                      TENER EN CUENTA:
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-200 font-medium">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
                        <span><strong>La plaza blanda es de uso exclusivo para menores de 4 años SIN EXCEPCIÓN.</strong> No habrá personal para su cuidado, los padres deben controlar que los niños no se golpeen ni rompan algo.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
                        <span>El reloj loco, tirolesa, cama elástica, muro, tela y aro son de uso EXCLUSIVO de los niños que tengan pulsera y estén a cargo de los profes.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
                        <span>Cualquier rotura o faltante del salón debe ser abonado por el contratante.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
                        <span>Los tiempos y organización del evento están a cargo del salón.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
                        <span>Objetos olvidados: se dará aviso y luego lo guardaremos por una semana.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#1EB8BF] shrink-0 mt-0.5" />
                        <span>Llevar servilletas para el evento.</span>
                      </li>
                    </ul>

                    {/* Alert Box: El Galpón no es de uso libre */}
                    <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-xl p-3 flex items-start gap-3 mt-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-400 font-heading font-black text-xs uppercase block">
                          EL GALPÓN NO ES DE USO LIBRE
                        </strong>
                        <span className="text-zinc-300 text-xs">
                          Hay juegos de riesgo que deben ser supervisados por personal capacitado.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FORM SECTION 1: DATOS DEL RESPONSABLE (ALL MANDATORY) */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#ED3078]" />
                        <h3 className="font-heading font-black text-sm sm:text-base text-white uppercase">
                          1. Datos del Adulto Responsable / Titular
                        </h3>
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 w-fit">
                        Todos los campos obligatorios *
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">Nombre y Apellido Completo *</label>
                        <input
                          type="text"
                          required
                          value={signerFullName}
                          onChange={(e) => setSignerFullName(e.target.value)}
                          placeholder="Ej: Mariana Gómez"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">DNI / Documento *</label>
                        <input
                          type="text"
                          required
                          value={signerDni}
                          onChange={(e) => setSignerDni(e.target.value)}
                          placeholder="Ej: 34.567.890"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">Teléfono Celular *</label>
                        <input
                          type="tel"
                          required
                          value={signerPhone}
                          onChange={(e) => setSignerPhone(e.target.value)}
                          placeholder="Ej: 221 573-1047"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">Correo Electrónico *</label>
                        <input
                          type="email"
                          required
                          value={signerEmail}
                          onChange={(e) => setSignerEmail(e.target.value)}
                          placeholder="Ej: mariana.gomez@gmail.com"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">Domicilio / Localidad *</label>
                        <input
                          type="text"
                          required
                          value={signerAddress}
                          onChange={(e) => setSignerAddress(e.target.value)}
                          placeholder="Ej: Calle 14 N° 850, La Plata"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">Vínculo con el Agasajado *</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'madre', label: 'Madre' },
                            { id: 'padre', label: 'Padre' },
                            { id: 'tutor', label: 'Tutor Legal' },
                            { id: 'familiar', label: 'Familiar Directo' },
                            { id: 'otro', label: 'Otro' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setRelationship(item.id as any)}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase transition-all cursor-pointer ${
                                relationship === item.id
                                  ? 'bg-[#ED3078] text-white border-[#ED3078]'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        {relationship === 'otro' && (
                          <div className="pt-2 space-y-1">
                            <label className="font-black text-zinc-200 uppercase text-[11px]">Especificar Vínculo *</label>
                            <input
                              type="text"
                              required
                              value={relationshipDetail}
                              onChange={(e) => setRelationshipDetail(e.target.value)}
                              placeholder="Ej: Tía, Abuelo, Hermano mayor, etc."
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FORM SECTION 2: DATOS DEL AGASAJADO */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                      <Heart className="w-4 h-4 text-[#A3BA13]" />
                      <h3 className="font-heading font-black text-sm sm:text-base text-white uppercase">
                        2. Datos del Agasajado
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">Nombre del Cumpleañero/a *</label>
                        <input
                          type="text"
                          required
                          value={childFullName}
                          onChange={(e) => setChildFullName(e.target.value)}
                          placeholder="Ej: Felipe Gómez"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-zinc-200 uppercase text-[11px]">Edad a Cumplir *</label>
                        <input
                          type="number"
                          required
                          min={6}
                          max={12}
                          value={childAge}
                          onChange={(e) => setChildAge(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FORM SECTION 3: FIRMA DIGITAL */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#1EB8BF]" />
                        <h3 className="font-heading font-black text-sm sm:text-base text-white uppercase">
                          3. Firma Digital del Titular Responsable *
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[11px] font-black uppercase text-zinc-400 hover:text-[#ED3078] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Limpiar Firma</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-medium">
                      Dibujá tu firma en el recuadro con el dedo (en celular) o con el mouse.
                    </p>

                    {/* Canvas Container */}
                    <div className="bg-zinc-950 border-2 border-dashed border-zinc-700 hover:border-[#1EB8BF] rounded-2xl p-2 relative">
                      <canvas
                        ref={canvasRef}
                        width={560}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 bg-black/40 rounded-xl cursor-crosshair touch-none"
                      />
                      {!hasSignature && !savedSignatureDataUrl && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-600 text-xs font-bold uppercase tracking-wider">
                          Firmá aquí con tu dedo o mouse ✍️
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400 font-medium pt-1">
                      <span>Aclaración: <strong>{signerFullName || 'Nombre Titular'}</strong> (DNI: {signerDni || '---'})</span>
                      <span>Fecha: {new Date().toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>

                  {/* TERMS CHECKBOX */}
                  <div className="bg-black/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptedTermsAndConditions}
                        onChange={(e) => setAcceptedTermsAndConditions(e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded-md text-[#1EB8BF] bg-zinc-900 border-zinc-600 focus:ring-0 cursor-pointer shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-black text-white leading-snug">
                        He leído y acepto los términos y condiciones de la reserva *
                      </span>
                    </label>

                    {!acceptedTermsAndConditions && (
                      <p className="text-[11px] text-amber-400/90 pl-8 font-medium">
                        * Debes hacer check en este recuadro para habilitar el botón de continuación.
                      </p>
                    )}
                  </div>

                  {/* Form Error Notice if any */}
                  {formError && (
                    <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-3.5 text-xs text-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* ACTION BUTTONS STEP 3 */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setStep(2); scrollToTop(); }}
                      className="px-4 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700 shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver 2/4</span>
                    </button>

                    <button
                      type="submit"
                      disabled={!acceptedTermsAndConditions || (!hasSignature && !savedSignatureDataUrl)}
                      className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                        acceptedTermsAndConditions && (hasSignature || savedSignatureDataUrl)
                          ? 'bg-[#ED3078] hover:bg-[#d62669] text-white cursor-pointer hover:scale-[1.01]'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 opacity-60'
                      }`}
                    >
                      <span>CONTINUAR A ENVÍO DE SEÑA (4/4)</span>
                      <ChevronRight className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>

                </form>
              )}

              {/* SCREEN 4 OF 4: ENVÍO DE SEÑA */}
              {step === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top Header Card */}
                  <div className="bg-gradient-to-r from-[#F2C700] via-amber-400 to-yellow-300 rounded-2xl p-4 sm:p-5 text-black space-y-1 shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded text-black font-mono">
                      INFORMACIÓN IMPORTANTE — PANTALLA 4/4
                    </span>
                    <h3 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-black">
                      ENVÍO DE SEÑA Y CONFIRMACIÓN DE RESERVA
                    </h3>
                    <p className="text-xs text-black/90 font-medium">
                      Completá el envío de la seña para asegurar la exclusividad del salón y congelar la fecha en nuestro calendario.
                    </p>
                  </div>

                  {/* Summary of reservation */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#F2C700]" />
                        <h4 className="font-heading font-black text-sm text-white uppercase">
                          Resumen del Festejo
                        </h4>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Paso Final 4/4
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Cumpleañero/a</span>
                        <strong className="text-white text-sm">{childFullName || reservation?.childName}</strong>
                        <span className="text-zinc-400 block text-[11px]">{childAge} años</span>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Fecha & Turno</span>
                        <strong className="text-[#F2C700] text-sm">{formattedDate || 'Fecha seleccionada'}</strong>
                        <span className="text-zinc-400 block text-[11px]">{reservation?.slotTime || 'Turno'} • {reservation?.branchName || 'El Galpón'}</span>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 sm:col-span-2">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Adulto Responsable (Firma Digital Registrada)</span>
                        <strong className="text-white">{signerFullName}</strong>
                        <span className="text-zinc-400 block text-[11px]">DNI: {signerDni} • Cel: {signerPhone} • Email: {signerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Non-refundable deposit warning */}
                  <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-4 text-red-200 text-xs sm:text-sm font-black flex items-center gap-3">
                    <span className="text-base sm:text-lg">❌</span>
                    <span>La seña no tiene devolución.</span>
                  </div>

                  {/* Bank Details Box with Copy Buttons */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#1EB8BF]" />
                        <h4 className="font-heading font-black text-sm sm:text-base text-white uppercase">
                          💳 Datos para la transferencia
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block font-bold">Monto de Seña</span>
                        <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                          ${depositAmount.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 text-xs">
                      {/* Alias */}
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Alias</span>
                          <strong className="text-white font-mono text-sm tracking-wider">{DEFAULT_BANK_INFO.alias}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(DEFAULT_BANK_INFO.alias, 'alias')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedField === 'alias' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedField === 'alias' ? '¡Copiado!' : 'Copiar Alias'}</span>
                        </button>
                      </div>

                      {/* CBU if present */}
                      {DEFAULT_BANK_INFO.cbu && (
                        <div className="flex items-center justify-between gap-2 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold">CBU</span>
                            <strong className="text-zinc-300 font-mono text-xs select-all break-all">{DEFAULT_BANK_INFO.cbu}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(DEFAULT_BANK_INFO.cbu, 'cbu')}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                          >
                            {copiedField === 'cbu' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedField === 'cbu' ? '¡Copiado!' : 'Copiar CBU'}</span>
                          </button>
                        </div>
                      )}

                      {/* Holder & Bank */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400">
                        <div>Titular: <strong className="text-zinc-200">{DEFAULT_BANK_INFO.accountHolder}</strong></div>
                        {DEFAULT_BANK_INFO.cuit && <div>CUIT: <strong className="text-zinc-200">{DEFAULT_BANK_INFO.cuit}</strong></div>}
                        <div className="sm:col-span-2">Método / Banco: <strong className="text-zinc-200">{DEFAULT_BANK_INFO.bankName}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* HIGHLIGHTED WHATSAPP NOTICE & DIRECT BUTTON */}
                  <div className="bg-[#25D366]/15 border-2 border-[#25D366] rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-6 h-6 text-[#25D366] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366] block">
                          INFORMACIÓN DESTACADA OBLIGATORIA
                        </span>
                        <p className="text-sm sm:text-base font-black text-white leading-snug">
                          Es fundamental enviar comprobante de la seña por Whatsapp para iniciar la reserva
                        </p>
                        <p className="text-xs text-zinc-300 font-medium pt-1 leading-relaxed">
                          Una vez efectuada la transferencia, presioná el botón verde a continuación para abrir WhatsApp y adjuntar la captura del comprobante con los datos de tu reserva ya cargados.
                        </p>
                      </div>
                    </div>

                    <a
                      href={waReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      <MessageCircle className="w-4 h-4 fill-black text-black" />
                      <span>Abrir WhatsApp para Enviar Comprobante</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </a>
                  </div>

                  {/* Form Error Notice if any */}
                  {formError && (
                    <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-3.5 text-xs text-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* ACTION BUTTONS STEP 4 */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setStep(3); scrollToTop(); }}
                      className="px-4 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700 shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver 3/4</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmitWaiver()}
                      disabled={isSubmitting}
                      className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                        !isSubmitting
                          ? 'bg-[#1EB8BF] hover:bg-[#19a1a7] text-black cursor-pointer hover:scale-[1.01]'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 opacity-60'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>{isSubmitting ? 'REGISTRANDO RESERVA...' : 'CONFIRMAR Y FINALIZAR RESERVA'}</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

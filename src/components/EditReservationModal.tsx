import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar as CalendarIcon, 
  Clock, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Users, 
  DollarSign, 
  FileText, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Reservation, Branch, TimeSlot } from '../types';
import { updateReservation, formatDateDDMMAAAA } from '../services/storage';
import { TIME_SLOTS, HOLIDAYS } from '../data/initialData';

const getAvailableSlotsForDate = (dateStr: string) => {
  if (!dateStr) return [];
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const isHoliday = HOLIDAYS.includes(dateStr);
  
  if (isWeekend || isHoliday) {
    return TIME_SLOTS.filter(slot => slot.id.startsWith('turn_weekend_'));
  } else {
    return TIME_SLOTS.filter(slot => slot.id === 'turn_weekday_evening');
  }
};

interface EditReservationModalProps {
  isOpen: boolean;
  reservation: Reservation | null;
  branches: Branch[];
  onClose: () => void;
  onSaved: (updatedList: Reservation[]) => void;
}

export const EditReservationModal: React.FC<EditReservationModalProps> = ({
  isOpen,
  reservation,
  branches,
  onClose,
  onSaved,
}) => {
  const [date, setDate] = useState('');
  const [slotId, setSlotId] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branchName, setBranchName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number | string>(7);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [estimatedKids, setEstimatedKids] = useState<number | string>(20);
  const [additionalPackage, setAdditionalPackage] = useState('');
  const [status, setStatus] = useState<Reservation['status']>('pending');
  const [depositPaid, setDepositPaid] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (reservation && isOpen) {
      setDate(reservation.date || '');
      setSlotId(reservation.slotId || 't1');
      setSlotTime(reservation.slotTime || '15:00 a 17:30 hs');
      setBranchId(reservation.branchId || (branches[0]?.id || 'calle-5'));
      setBranchName(reservation.branchName || (branches[0]?.name || 'El Galpón'));
      setChildName(reservation.childName || '');
      setChildAge(reservation.childAge || 7);
      setParentName(reservation.parentName || '');
      setParentPhone(reservation.parentPhone || '');
      setParentEmail(reservation.parentEmail || '');
      setEstimatedKids(reservation.estimatedKids || 20);
      setAdditionalPackage(reservation.additionalPackage || 'base_20');
      setStatus(reservation.status || 'pending');
      setDepositPaid(reservation.depositPaid ?? false);
      setDepositAmount(reservation.depositAmount || 100000);
      setNotes(reservation.notes || '');
      setSaveSuccess(false);
    }
  }, [reservation, isOpen, branches]);

  if (!isOpen || !reservation) return null;

  const handleBranchChange = (newBranchId: string) => {
    setBranchId(newBranchId);
    const found = branches.find((b) => b.id === newBranchId);
    if (found) {
      setBranchName(found.name);
    }
  };

  const handleDateChange = (newDateStr: string) => {
    setDate(newDateStr);
    const available = getAvailableSlotsForDate(newDateStr);
    if (available.length > 0 && !available.some(s => s.id === slotId)) {
      setSlotId(available[0].id);
      setSlotTime(available[0].timeRange);
    }
  };

  const handleSlotChange = (newSlotId: string) => {
    setSlotId(newSlotId);
    const found = TIME_SLOTS.find((s) => s.id === newSlotId);
    if (found) {
      setSlotTime(found.timeRange);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedFields: Partial<Reservation> = {
        date,
        slotId,
        slotTime,
        branchId,
        branchName,
        childName,
        childAge: Number(childAge) || 7,
        parentName,
        parentPhone,
        parentEmail,
        estimatedKids: Number(estimatedKids) || 20,
        additionalPackage,
        status,
        depositPaid,
        depositAmount: Number(depositAmount) || 100000,
        notes,
      };

      const updated = await updateReservation(reservation.id, updatedFields);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onSaved(updated);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Error updating reservation:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto text-white">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1EB8BF]/15 border border-[#1EB8BF]/30 flex items-center justify-center text-[#1EB8BF]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#1EB8BF] tracking-wider block">
                Edición de Reserva • {formatDateDDMMAAAA(reservation.date)}
              </span>
              <h3 className="font-heading font-black text-base sm:text-lg text-white uppercase">
                Editar Ficha del Cumpleaños
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* SECTION 1: Event Date, Slot & Branch */}
          <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px] uppercase border-b border-zinc-800 pb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Fecha, Turno y Sucursal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Fecha del Evento *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Turno / Horario *</label>
                <select
                  value={slotId}
                  onChange={(e) => handleSlotChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                >
                  {getAvailableSlotsForDate(date).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.timeRange})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Sucursal *</label>
                <select
                  value={branchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Birthday Child & Guests */}
          <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px] uppercase border-b border-zinc-800 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Cumpleañero/a e Invitados</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Nombre del Cumpleañero/a *</label>
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Ej: Bautista Gómez"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Edad a cumplir *</label>
                <input
                  type="number"
                  min="6"
                  max="12"
                  required
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Cantidad de Chicos</label>
                <input
                  type="number"
                  min="5"
                  max="150"
                  value={estimatedKids}
                  onChange={(e) => setEstimatedKids(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Paquete Seleccionado</label>
                <input
                  type="text"
                  value={additionalPackage}
                  onChange={(e) => setAdditionalPackage(e.target.value)}
                  placeholder="Ej: Base 20 chicos"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Parent Contact */}
          <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px] uppercase border-b border-zinc-800 pb-2">
              <User className="w-3.5 h-3.5 text-[#1EB8BF]" />
              <span>Adulto Responsable / Contacto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Celular WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Email</label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Status & Payment */}
          <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px] uppercase border-b border-zinc-800 pb-2">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estado de la Reserva y Seña</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Estado de la Reserva</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Reservation['status'])}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-[#1EB8BF] focus:outline-none font-bold"
                >
                  <option value="pending">Pendiente de Seña</option>
                  <option value="approved">Aprobada / Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase text-[10px]">Seña Pagada ($)</label>
                <input
                  type="number"
                  step="1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:border-[#1EB8BF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={depositPaid}
                    onChange={(e) => setDepositPaid(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="font-bold text-zinc-200 uppercase text-[11px]">Seña Acreditada</span>
                </label>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="font-bold text-zinc-300 uppercase text-[10px]">Notas Internas / Observaciones</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Menú celíaco para 2 niños, piñata provista por la familia..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#1EB8BF] hover:bg-[#19a1a7] text-black font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

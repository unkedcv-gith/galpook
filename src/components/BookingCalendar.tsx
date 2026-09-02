import React, { useState, useMemo, useEffect } from 'react';
import { Reservation, Branch } from '../types';
import { TIME_SLOTS, BRAND_INFO, HOLIDAYS } from '../data/initialData';
import { getReservations, getBlockedDates, addReservation, getBranches, formatDateDDMMAAAA, formatWhatsAppNumber } from '../services/storage';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  MessageCircle, 
  User, 
  Phone, 
  Mail, 
  Send, 
  Gift, 
  MapPin, 
  Clock, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';

interface BookingCalendarProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onReservationCreated?: () => void;
  preselectedBranchId?: string;
}

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

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onReservationCreated,
  preselectedBranchId,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(preselectedBranchId || '');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Form State
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(6);
  const [additionalPackage, setAdditionalPackage] = useState<'base_20' | 'adicional_21_28' | 'adicional_29_35'>('base_20');
  const [adultsFoodInfo, setAdultsFoodInfo] = useState('');
  const [notes, setNotes] = useState('');

  const [submittedReservation, setSubmittedReservation] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load active branches
  useEffect(() => {
    const loadedBranches = getBranches().filter(b => b.isActive);
    setBranches(loadedBranches);
    if (!selectedBranchId && loadedBranches.length > 0) {
      setSelectedBranchId(loadedBranches[0].id);
    }
  }, []);

  const selectedBranch = useMemo(() => {
    return branches.find(b => b.id === selectedBranchId) || branches[0] || null;
  }, [branches, selectedBranchId]);

  // Sync kids with package selection
  const handleKidsCountChange = (count: number) => {
    if (count <= 20) {
      setAdditionalPackage('base_20');
    } else if (count <= 28) {
      setAdditionalPackage('adicional_21_28');
    } else {
      setAdditionalPackage('adicional_29_35');
    }
  };

  // Reactive reservations & blocked dates State
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [allBlockedDates, setAllBlockedDates] = useState<ReturnType<typeof getBlockedDates>>([]);

  const loadData = () => {
    setAllReservations(getReservations());
    setAllBlockedDates(getBlockedDates());
  };

  useEffect(() => {
    loadData();
    const handleStorageUpdate = () => {
      loadData();
    };
    window.addEventListener('storageUpdate', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Filter current bookings & blocked dates for the selected branch
  const reservations = useMemo(() => {
    if (!selectedBranchId || selectedBranchId === 'all') return allReservations;
    return allReservations.filter((r) => r.branchId === selectedBranchId);
  }, [allReservations, selectedBranchId, submittedReservation]);

  const blockedDates = useMemo(() => {
    if (!selectedBranchId || selectedBranchId === 'all') return allBlockedDates;
    return allBlockedDates.filter((b) => !b.branchId || b.branchId === selectedBranchId || b.branchId === 'all');
  }, [allBlockedDates, selectedBranchId]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Check if a date is in the past
  const isPastDate = (dayNumber: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(year, month, dayNumber);
    return dateToCheck < today;
  };

  // Slots availability for selectedDateStr in selectedBranch
  const activeBookingsForSelectedDate = useMemo(() => {
    if (!selectedDateStr) return [];
    return reservations.filter(
      (r) => r.date === selectedDateStr && (r.status === 'approved' || r.status === 'pending')
    );
  }, [reservations, selectedDateStr]);

  const isDateBlocked = useMemo(() => {
    if (!selectedDateStr) return false;
    return blockedDates.some((b) => b.date === selectedDateStr);
  }, [blockedDates, selectedDateStr]);

  const isSlotBooked = (slotId: string) => {
    return activeBookingsForSelectedDate.some((r) => r.slotId === slotId);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (dayNumber: number) => {
    if (isPastDate(dayNumber)) return;
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDateStr(dateString);
    setSelectedSlotId(''); // Reset slot on date change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) {
      alert('Por favor seleccioná la sucursal donde querés realizar el festejo.');
      return;
    }

    if (!selectedDateStr) {
      alert('Por favor hacé clic en un día del calendario para seleccionar la fecha.');
      return;
    }

    if (!selectedSlotId) {
      alert('Por favor elegí un turno horario disponible (Mañana, Tarde Temprano o Tarde/Noche).');
      return;
    }

    if (!parentName || !parentPhone || !childName) {
      alert('Por favor completá los campos obligatorios: Tu Nombre, WhatsApp y Nombre del Cumpleañer@.');
      return;
    }

    const slotObj = TIME_SLOTS.find((s) => s.id === selectedSlotId);
    setIsSubmitting(true);

    try {
      const newRes = await addReservation({
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        date: selectedDateStr,
        slotId: selectedSlotId,
        slotTime: slotObj?.timeRange || '15:00 a 17:30 hs',
        parentName,
        parentPhone,
        parentEmail,
        childName,
        childAge,
        estimatedKids: 0,
        additionalPackage,
        adultsFoodInfo,
        notes,
      });

      setSubmittedReservation(newRes);
      if (onReservationCreated) onReservationCreated();

      // Smoothly scroll to the confirmation receipt view
      setTimeout(() => {
        const target = document.getElementById('reservar');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Error creating reservation:', err);
      alert('Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedReservation(null);
    setSelectedSlotId('');
    setSelectedDateStr('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setChildName('');
    setChildAge(6);
    setNotes('');
  };

  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [selectedDateStr]);

  return (
    <section id="reservar" className="w-full bg-gradient-to-b from-[#1EB8BF] via-[#1EB8BF] via-45% to-black text-white py-14 sm:py-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header Bento Box */}
        <div className="bg-black/75 backdrop-blur-md rounded-3xl border-2 border-white/20 p-6 sm:p-10 text-center space-y-3 shadow-2xl text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1EB8BF] text-black font-heading font-black text-xs tracking-widest uppercase shadow-md">
            Almanaque & Reservas
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Reservá tu <span className="text-[#F2C700] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Fecha y Sucursal</span>
          </h2>
          <p className="text-zinc-200 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            Elegí tu sucursal de El Galpón, seleccioná el día en el calendario para consultar turnos disponibles y solicitá tu reserva para congelar tarifa.
          </p>
        </div>

        {submittedReservation ? (
          /* Confirmation Receipt View */
          <div className="max-w-2xl mx-auto bg-black/85 backdrop-blur-md border-2 border-white/20 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl text-white">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-[#A3BA13] text-[#A3BA13] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-[#1EB8BF]/20 text-[#1EB8BF] border border-[#1EB8BF] rounded-full text-xs font-black uppercase">
                {submittedReservation.branchName}
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase">
                ¡Solicitud de Reserva Registrada!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300">
                Tu solicitud de turno para el cumple de <strong className="text-[#F2C700]">{submittedReservation.childName}</strong> ya fue ingresada con éxito.
              </p>
            </div>

            {/* Voucher Details */}
            <div className="bg-zinc-950/80 border-2 border-zinc-800 rounded-2xl p-5 text-left space-y-3 font-sans text-xs sm:text-sm">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold uppercase">Sucursal:</span>
                <span className="text-white font-extrabold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1EB8BF]" /> {submittedReservation.branchName}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold uppercase">Fecha Solicitada:</span>
                <span className="text-white font-extrabold">{formatDateDDMMAAAA(submittedReservation.date)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold uppercase">Horario del Turno:</span>
                <span className="text-[#F2C700] font-black">{submittedReservation.slotTime}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold uppercase">Adulto Responsable:</span>
                <span className="text-white font-medium">{submittedReservation.parentName} ({submittedReservation.parentPhone})</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-zinc-400 font-bold uppercase">Estado:</span>
                <span className="text-amber-400 font-black uppercase tracking-wider">Pendiente de Seña ($100.000)</span>
              </div>
            </div>

            {/* Direct WhatsApp Confirmation Button */}
            <div className="space-y-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?phone=${selectedBranch?.whatsappNumber ? formatWhatsAppNumber(selectedBranch.whatsappNumber) : '5492216105296'}&text=${encodeURIComponent(
                  `¡Hola ${submittedReservation.branchName}! 👋 Acabo de generar una solicitud de reserva web para el cumpleaños de *${submittedReservation.childName}* el día *${formatDateDDMMAAAA(submittedReservation.date)}* en el turno *${submittedReservation.slotTime}* 🎪🎉. Mi nombre es ${submittedReservation.parentName}. ¿Cómo coordinamos el pago de la seña de $100.000? 🎈`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-heading font-black text-sm uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-black" />
                <span>Enviar reserva de turno</span>
              </a>

              <button
                onClick={handleResetForm}
                className="w-full py-3 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                ← Realizar otra consulta o reserva
              </button>
            </div>
          </div>
        ) : (
          /* Normal Interactive Booking Workflow */
          <div className="space-y-8">
            
            {/* ========================================================================= */}
            {/* STEP 1: MANDATORY BRANCH / SUCURSAL SELECTOR                              */}
            {/* ========================================================================= */}
            <div className="bg-black/80 backdrop-blur-md rounded-3xl border-2 border-white/20 p-5 sm:p-8 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1EB8BF] text-black font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase">
                      Paso 1: Seleccioná la Sucursal
                    </h3>
                    <p className="text-xs text-zinc-300 font-medium">
                      Elige el local donde deseas celebrar el cumpleaños infantil
                    </p>
                  </div>
                </div>

                {selectedBranch && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-zinc-300 self-start sm:self-auto">
                    <MapPin className="w-3.5 h-3.5 text-[#1EB8BF]" />
                    <span>Sucursal seleccionada: <strong className="text-white">{selectedBranch.name}</strong></span>
                  </div>
                )}
              </div>

              {/* Branch Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pt-1">
                {branches.map((branch) => {
                  const isSelected = selectedBranchId === branch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => {
                        setSelectedBranchId(branch.id);
                        setSelectedSlotId(''); // Reset slot on branch change
                      }}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer flex items-start gap-4 ${
                        isSelected
                          ? 'bg-zinc-900/90 border-[#1EB8BF] shadow-[0_0_25px_rgba(30,184,191,0.35)] scale-[1.01]'
                          : 'bg-black/60 border-white/15 hover:border-white/40 hover:bg-zinc-900/40'
                      }`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                          isSelected ? 'bg-[#1EB8BF] text-black' : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <MapPin className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-heading font-black text-base sm:text-lg text-white uppercase truncate">
                            {branch.name}
                          </h4>
                          {isSelected && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#1EB8BF] text-black text-[10px] font-black uppercase">
                              Activa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 font-medium flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#ED3078]" /> {branch.address}, {branch.city}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#A3BA13]" /> Tel: {branch.phone}
                        </p>
                        
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1.5">
                          {branch.id === 'calle-5' ? (
                            <>
                              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-300">
                                <span><User className="w-3 h-3 inline mr-1 text-[#ED3078]" />Máx: 40 Chicos / 30 Adultos</span>
                                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-white">667 MT2</span>
                              </div>
                              <p className="text-[9px] text-[#A3BA13] font-bold">
                                + INCLUYE RELOJ LOCO Y PLAZA BLANDA (menores 5 años)
                              </p>
                            </>
                          ) : branch.id === 'calle-13' ? (
                            <>
                              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-300">
                                <span><User className="w-3 h-3 inline mr-1 text-[#1EB8BF]" />Máx: 35 Chicos / 20 Adultos</span>
                                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-white">560 MT2</span>
                              </div>
                              <p className="text-[9px] text-[#A3BA13] font-bold">
                                + INCLUYE CANCHA DE BASQUET (No incluye Reloj Loco)
                              </p>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 2: NEUTRAL MONTHLY CALENDAR & ON-DEMAND BOTTOM TIME SLOTS            */}
            {/* ========================================================================= */}
            <div className="bg-black/80 backdrop-blur-md rounded-3xl border-2 border-white/20 p-5 sm:p-8 space-y-6 shadow-xl">
              
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-xl bg-[#F2C700] text-black font-black text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase">
                    Paso 2: Elegí una Fecha en el Almanaque
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium">
                    Hacé clic en cualquier día para consultar los turnos disponibles en <strong className="text-[#1EB8BF]">{selectedBranch?.name}</strong>
                  </p>
                </div>
              </div>

              {/* Month Navigation & Grid */}
              <div className="max-w-3xl mx-auto space-y-4">
                
                {/* Month Selector Bar */}
                <div className="flex items-center justify-between bg-zinc-950/80 border border-white/15 rounded-2xl px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleMonthChange('prev')}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 transition-colors cursor-pointer"
                    title="Mes Anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center">
                    <span className="font-heading font-black text-lg sm:text-xl text-white uppercase tracking-wider">
                      {monthName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMonthChange('next')}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 transition-colors cursor-pointer"
                    title="Mes Siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day Name Header Row */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black text-zinc-400 uppercase tracking-wider py-1">
                  <div>Dom</div>
                  <div>Lun</div>
                  <div>Mar</div>
                  <div>Mié</div>
                  <div>Jue</div>
                  <div>Vie</div>
                  <div>Sáb</div>
                </div>

                {/* Calendar Days Grid (CLEAN & NEUTRAL DESIGN: All future days identical) */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-11 sm:h-14 rounded-xl opacity-0 pointer-events-none" />
                  ))}

                  {/* Day Buttons */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const formattedMonth = String(month + 1).padStart(2, '0');
                    const formattedDay = String(dayNum).padStart(2, '0');
                    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
                    const isPast = isPastDate(dayNum);
                    const isSelected = selectedDateStr === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDateClick(dayNum)}
                        className={`h-11 sm:h-14 rounded-xl flex flex-col items-center justify-center font-heading font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                          isPast
                            ? 'bg-zinc-900/30 text-zinc-600 border border-transparent cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#1EB8BF] text-black font-black border-2 border-white shadow-[0_0_20px_rgba(30,184,191,0.8)] scale-105 z-10'
                            : 'bg-zinc-900/70 hover:bg-zinc-800 text-white border border-white/10 hover:border-[#1EB8BF]/60'
                        }`}
                      >
                        <span>{dayNum}</span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* ========================================================================= */}
              {/* ON-DEMAND BOTTOM TIME SLOTS PANEL (Appears upon clicking a date)           */}
              {/* ========================================================================= */}
              {selectedDateStr ? (
                <div className="pt-4 border-t border-white/15 animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#F2C700]" />
                      <h4 className="font-heading font-black text-base sm:text-lg text-white uppercase">
                        Turnos para el <span className="text-[#F2C700] capitalize">{selectedDateFormatted}</span>
                      </h4>
                    </div>
                    <span className="text-xs text-zinc-300 font-medium">
                      Sucursal: <strong className="text-white">{selectedBranch?.name}</strong>
                    </span>
                  </div>

                  {isDateBlocked ? (
                    <div className="p-4 bg-zinc-950/80 border-2 border-[#ED3078] rounded-2xl text-center space-y-1">
                      <p className="font-heading font-black text-sm text-[#ED3078] uppercase">
                        Fecha No Disponible para Eventos
                      </p>
                      <p className="text-xs text-zinc-300">
                        Esta fecha se encuentra reservada para mantenimiento o evento exclusivo en {selectedBranch?.name}. Por favor selecciona otro día en el calendario.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {getAvailableSlotsForDate(selectedDateStr).map((slot) => {
                        const isBooked = isSlotBooked(slot.id);
                        const isSelected = selectedSlotId === slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                              isBooked
                                ? 'bg-zinc-950/50 border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-gradient-to-br from-zinc-900 to-black border-[#F2C700] text-white shadow-[0_0_20px_rgba(242,199,0,0.35)] scale-[1.02]'
                                : 'bg-black/60 border-white/15 text-zinc-200 hover:border-[#1EB8BF] hover:bg-zinc-900/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="font-heading font-black text-sm uppercase">
                                {slot.title}
                              </span>
                              {isBooked ? (
                                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase">
                                  Ocupado
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  isSelected ? 'bg-[#F2C700] text-black' : 'bg-[#1EB8BF]/20 text-[#1EB8BF] border border-[#1EB8BF]/40'
                                }`}>
                                  {isSelected ? 'Seleccionado' : 'Disponible'}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <p className={`font-black text-base ${isSelected ? 'text-[#F2C700]' : 'text-white'}`}>
                                {slot.timeRange}
                              </p>
                              <p className="text-[11px] text-zinc-400 line-clamp-2">
                                {slot.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-4 bg-zinc-950/40 border border-white/10 rounded-2xl text-center flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <Info className="w-4 h-4 text-[#1EB8BF]" />
                  <span>Seleccioná un día del calendario arriba para desplegar el estado y disponibilidad de los turnos.</span>
                </div>
              )}

            </div>

            {/* ========================================================================= */}
            {/* STEP 3: RESERVATION DETAILS & CONTACT FORM                                */}
            {/* ========================================================================= */}
            {selectedSlotId && (
              <form 
                onSubmit={handleSubmit}
                className="bg-black/80 backdrop-blur-md rounded-3xl border-2 border-white/20 p-5 sm:p-8 space-y-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300"
              >
                <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#ED3078] text-white font-black text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase">
                      Paso 3: Completá los Datos del Festejo
                    </h3>
                    <p className="text-xs text-zinc-300 font-medium">
                      Turno: <strong className="text-[#F2C700]">{selectedDateFormatted}</strong> ({TIME_SLOTS.find(s => s.id === selectedSlotId)?.timeRange}) en <strong className="text-[#1EB8BF]">{selectedBranch?.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Parent Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#1EB8BF]" /> Tu Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Mariana Gómez"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                    />
                  </div>

                  {/* Parent WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#25D366]" /> Tu Celular / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 221 456-7890"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#25D366] focus:outline-none"
                    />
                  </div>

                  {/* Child Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#ED3078]" /> Nombre del Cumpleañer@ *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Felipe"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#ED3078] focus:outline-none"
                    />
                  </div>

                  {/* Child Age */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-white uppercase">
                      Edad a Cumplir
                    </label>
                    <select
                      value={childAge}
                      onChange={(e) => setChildAge(Number(e.target.value))}
                      className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-3 py-3 text-xs sm:text-sm text-white focus:border-[#1EB8BF] focus:outline-none cursor-pointer"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((age) => (
                        <option key={age} value={age}>{age} años</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Base Contract Box */}
                <div className="bg-zinc-950/90 border border-[#A3BA13] rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="font-heading font-black text-[#A3BA13] text-lg uppercase flex items-center gap-2">
                      <Gift className="w-5 h-5" /> Contrato Base Incluido
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-white font-black uppercase text-[10px]">
                      Tarifa Congelada c/ Seña
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-zinc-300">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> 2 1/2 hs de evento con profesores</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> 20 Chicos y 20 Adultos incluidos</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> Menú de chicos y adultos de regalo</li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> Atracciones guiadas y juegos</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> Personal de cocina, mozo y vajilla</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0 mt-0.5" /> Tarjeta virtual, seguro, WIFI y grupo electrógeno</li>
                    </ul>
                  </div>
                  <div className="text-[10px] text-zinc-400 bg-white/5 p-2 rounded flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-[#1EB8BF] shrink-0" />
                    <span>Se pueden agregar invitados adicionales según la capacidad de cada sucursal (Máx Calle 5: 40 chicos / 30 adultos. Máx Calle 13: 35 chicos / 20 adultos).</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-300 uppercase">
                    Comentarios o Consultas Especiales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Temática, alimentos especiales para adultos, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#F2C700] via-[#e6bd00] to-[#cfa300] hover:brightness-105 active:scale-[0.99] text-black font-heading font-black text-base uppercase py-4 px-6 rounded-2xl shadow-[0_6px_25px_rgba(242,199,0,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Solicitar Reserva para {selectedBranch?.name}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

      </div>
    </section>
  );
};

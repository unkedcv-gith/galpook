import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  MessageCircle, 
  Star, 
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Zap
} from 'lucide-react';
import { getPricingSettings, formatCurrency, listenToPricingSettings } from '../services/storage';
import { BRAND_INFO, INITIAL_DAYCARE_DAILY_RATES } from '../data/initialData';
import { PricingSettings } from '../types';

interface DaycareSimulatorProps {
  embedded?: boolean;
}

export const DaycareSimulator: React.FC<DaycareSimulatorProps> = ({ embedded = false }) => {
  const [pricing, setPricing] = useState<PricingSettings>(getPricingSettings);
  
  // Modality: 'daily' (Por Día) or 'monthly' (Por Mes)
  const [simulationMode, setSimulationMode] = useState<'daily' | 'monthly'>('daily');
  
  // Daily scheme states (Por un día y 1, 2, 3 o 4 horas)
  const [selectedDailyHours, setSelectedDailyHours] = useState<number>(2);

  // Monthly scheme states (Tal cual estaba antes)
  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [selectedHours, setSelectedHours] = useState<number>(2);

  useEffect(() => {
    const handleUpdate = () => {
      setPricing(getPricingSettings());
    };
    window.addEventListener('storageUpdate', handleUpdate);
    window.addEventListener('pricingUpdate', handleUpdate);
    const unsub = listenToPricingSettings((updated) => setPricing(updated));

    return () => {
      window.removeEventListener('storageUpdate', handleUpdate);
      window.removeEventListener('pricingUpdate', handleUpdate);
      unsub();
    };
  }, []);

  // Allowed hour options for monthly depend on days: 5hs is available for 1 day
  const monthlyHourOptions = selectedDays === 1 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];

  // Adjust selected monthly hours if user switches from 1 day (5hs) to multi-days
  useEffect(() => {
    if (selectedDays > 1 && selectedHours > 4) {
      setSelectedHours(4);
    }
  }, [selectedDays, selectedHours]);

  // DAILY PRICING CALCULATION
  const safeDailyRates = (pricing.daycare.dailyRates && pricing.daycare.dailyRates.length > 0)
    ? pricing.daycare.dailyRates
    : INITIAL_DAYCARE_DAILY_RATES;
  const currentDailyOption = safeDailyRates.find((r) => r.hours === selectedDailyHours);
  const calculatedDailyPrice = currentDailyOption ? currentDailyOption.price : 0;

  // MONTHLY PRICING CALCULATION
  const currentMonthlyOption = pricing.daycare.options.find(
    (opt) => opt.days === selectedDays && opt.hours === selectedHours
  );
  const calculatedMonthlyPrice = currentMonthlyOption ? currentMonthlyOption.price : 0;

  // WhatsApp Messages
  const whatsappDailyMessage = `Hola! Estuve calculando en el simulador de la web el Pase por 1 Día para el Espacio UP: 1 día puntual (${selectedDailyHours} ${
    selectedDailyHours === 1 ? 'hora' : 'horas'
  }) por un arancel de ${formatCurrency(calculatedDailyPrice)}. ¿Tienen cupo disponible para esta semana?`;

  const whatsappMonthlyMessage = `Hola! Estuve calculando en el simulador de la web para el Espacio UP: plan mensual de ${selectedDays} ${
    selectedDays === 1 ? 'día' : 'días'
  } por semana (${selectedHours} ${
    selectedHours === 1 ? 'hora' : 'horas'
  } por día) por un valor de ${formatCurrency(calculatedMonthlyPrice)} mensual. ¿Tienen vacantes disponibles?`;

  const currentWhatsappMessage = simulationMode === 'daily' ? whatsappDailyMessage : whatsappMonthlyMessage;
  const whatsappHref = `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(currentWhatsappMessage)}`;

  return (
    <div
      id="simulador-up"
      className={
        embedded
          ? "space-y-6 pt-8 border-t border-white/15"
          : "bg-zinc-950/80 border-2 border-white/20 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md"
      }
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#A3BA13] text-black flex items-center justify-center font-black shadow-md shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>Simulador de Tarifas Espacio UP</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                simulationMode === 'daily' ? 'bg-[#A3BA13] text-black' : 'bg-[#F2C700] text-black'
              }`}>
                {simulationMode === 'daily' ? 'Por Día' : 'Plan Mensual'}
              </span>
            </h3>
            <p className="text-xs text-zinc-300 font-medium">
              Elegí entre un pase diario puntual o un plan mensual fijo para simular el arancel en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A3BA13] font-black bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
          <Star className="w-3.5 h-3.5" />
          <span>Aranceles Actualizados</span>
        </div>
      </div>

      {/* PASO PREVIO: Selector de Modalidad (Por Día vs Mensual) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F2C700]" /> 1. ¿Cómo necesitás el servicio? Elegí la modalidad:
          </label>
          <span className="text-[11px] text-zinc-400 hidden sm:inline-block">
            Podés cambiar en cualquier momento
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Opción 1: Por Día */}
          <button
            type="button"
            onClick={() => setSimulationMode('daily')}
            className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden cursor-pointer border-2 ${
              simulationMode === 'daily'
                ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-[#A3BA13] shadow-[0_0_20px_rgba(163,186,19,0.3)] scale-[1.01]'
                : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-white/10 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                  simulationMode === 'daily' ? 'bg-[#A3BA13] text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-heading font-black text-sm sm:text-base text-white uppercase block">
                    Pase Por Día
                  </span>
                  <span className="text-[10px] font-bold text-[#A3BA13] uppercase tracking-wide">
                    Tarifa Ocasional / Eventual
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                simulationMode === 'daily' ? 'bg-[#A3BA13] text-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                Por jornada
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-normal leading-relaxed pt-1">
              Ideal para paros docentes, días puntuales sin cole, imprevistos o salidas. Contratás <strong>1 solo día por las horas que necesites (de 1 a 10 hs)</strong> sin compromiso mensual.
            </p>
          </button>

          {/* Opción 2: Mensual */}
          <button
            type="button"
            onClick={() => setSimulationMode('monthly')}
            className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden cursor-pointer border-2 ${
              simulationMode === 'monthly'
                ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-[#F2C700] shadow-[0_0_20px_rgba(242,199,0,0.3)] scale-[1.01]'
                : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-white/10 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                  simulationMode === 'monthly' ? 'bg-[#F2C700] text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-heading font-black text-sm sm:text-base text-white uppercase block">
                    Plan Mensual
                  </span>
                  <span className="text-[10px] font-bold text-[#F2C700] uppercase tracking-wide">
                    Concurrencia Regular Fija
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                simulationMode === 'monthly' ? 'bg-[#F2C700] text-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                Cuota Mensual
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-normal leading-relaxed pt-1">
              Para familias que necesitan cuidado regular de lunes a viernes. Elegí de <strong>1 a 5 días semanales</strong> y de <strong>1 a 4 horas por día</strong> con cupo garantizado.
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2 border-t border-white/10">
        
        {/* ========================================================================= */}
        {/* CONTROLES: SEGÚN MODALIDAD SELECCIONADA                                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* CASO 1: SIMULACIÓN POR DÍA */}
          {simulationMode === 'daily' && (
            <div className="space-y-4">
              {/* Paro en el cole callout */}
              <div className="bg-zinc-950/80 border border-white/20 rounded-2xl p-3.5 sm:p-4 space-y-1.5 shadow-inner">
                <div className="text-[#ED3078] font-heading font-black text-sm sm:text-base flex items-center gap-2 uppercase">
                  <Zap className="w-5 h-5 text-[#F2C700] shrink-0" /> ¿Hay paro en el cole o no tenés quien cuide a tu peke?
                </div>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  ¡Traélo a El Galpón! Mucha diversión asegurada en un solo lugar adaptado con docentes calificados y actividades saludables.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#A3BA13]" /> 2. Cantidad de Horas en el Día
                  </label>
                  <span className="text-[10px] font-bold text-[#A3BA13] bg-[#A3BA13]/10 px-2 py-0.5 rounded-md border border-[#A3BA13]/30">
                    Pase por 1 día puntual
                  </span>
                </div>
                
                {/* 1 a 10 hs por día */}
                <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((h) => {
                    const isSelected = selectedDailyHours === h;
                    const rateForH = safeDailyRates.find((r) => r.hours === h);
                    const priceForH = rateForH ? rateForH.price : 0;
                    
                    return (
                      <button
                        key={`daily-hour-${h}`}
                        type="button"
                        onClick={() => setSelectedDailyHours(h)}
                        className={`p-2 sm:p-2.5 rounded-xl font-heading font-black text-xs sm:text-sm uppercase transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#A3BA13] text-black font-black shadow-[0_0_15px_rgba(163,186,19,0.5)] scale-102 border-2 border-white'
                            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/10'
                        }`}
                      >
                        <span>{h} hs</span>
                        <span className="text-[9px] font-normal tracking-tight opacity-90">
                          {formatCurrency(priceForH)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advantages Bullet Points for Daily */}
              <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0" />
                  <span>Sin costo de matrícula ni permanencia: pagás únicamente el día que asiste.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Clock className="w-4 h-4 text-[#A3BA13] shrink-0" />
                  <span>Franja horaria a elección de 7:30 a 17:00 hs (dentro del horario de UP).</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Zap className="w-4 h-4 text-[#A3BA13] shrink-0" />
                  <span>Incluye todas las actividades: muro de escalada, tirolesa, recreación y cuidado.</span>
                </div>
              </div>
            </div>
          )}

          {/* CASO 2: SIMULACIÓN MENSUAL (TAL CUAL ESTABA) */}
          {simulationMode === 'monthly' && (
            <div className="space-y-4">
              {/* Days Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#F2C700]" /> 2. Cantidad de Días a la Semana
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((d) => {
                    const isSelected = selectedDays === d;
                    return (
                      <button
                        key={`monthly-day-${d}`}
                        type="button"
                        onClick={() => setSelectedDays(d)}
                        className={`p-3 rounded-xl font-heading font-black text-xs sm:text-sm uppercase transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#F2C700] text-black font-black shadow-[0_0_15px_rgba(242,199,0,0.5)] scale-102 border-2 border-white'
                            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/10'
                        }`}
                      >
                        <span>{d}</span>
                        <span className="text-[9px] font-normal tracking-tight">
                          {d === 1 ? 'día/sem' : 'días/sem'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F2C700]" /> 3. Cantidad de Horas Diarias
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {monthlyHourOptions.map((h) => {
                    const isSelected = selectedHours === h;
                    return (
                      <button
                        key={`monthly-hour-${h}`}
                        type="button"
                        onClick={() => setSelectedHours(h)}
                        className={`p-3 rounded-xl font-heading font-black text-xs sm:text-sm uppercase transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#F2C700] text-black font-black shadow-[0_0_15px_rgba(242,199,0,0.5)] scale-102 border-2 border-white'
                            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/10'
                        }`}
                      >
                        <span>{h} hs</span>
                        <span className="text-[9px] font-normal tracking-tight">por día</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advantages Bullet Points for Monthly */}
              <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-[#F2C700] shrink-0" />
                  <span>Vacante reservada y asegurada todos los meses con arancel congelado.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <ShieldCheck className="w-4 h-4 text-[#F2C700] shrink-0" />
                  <span>Cupo reducido con profesores de educación física y recreación infantil.</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* OUTPUT & WHATSAPP CTA COLUMN                                              */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-2 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl text-center flex flex-col justify-between ${
          simulationMode === 'daily' ? 'border-[#A3BA13]/70' : 'border-[#F2C700]/70'
        }`}>
          
          <div className="space-y-1">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">
              {simulationMode === 'daily' ? 'Tarifa Por Día Estimada' : 'Cuota Mensual Estimada'}
            </span>
            <div className={`text-3xl sm:text-4xl font-heading font-black tracking-tight ${
              simulationMode === 'daily' ? 'text-[#A3BA13]' : 'text-[#F2C700]'
            }`}>
              {formatCurrency(simulationMode === 'daily' ? calculatedDailyPrice : calculatedMonthlyPrice)}
              <span className="text-xs font-bold text-zinc-400 block mt-0.5">
                {simulationMode === 'daily' ? '/ pase por día' : '/ mes'}
              </span>
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs space-y-1 text-left">
            <div className="flex justify-between text-zinc-300 font-medium">
              <span>Modalidad:</span>
              <strong className={`font-bold ${simulationMode === 'daily' ? 'text-[#A3BA13]' : 'text-[#F2C700]'}`}>
                {simulationMode === 'daily' ? 'Pase Por Día (Puntual)' : 'Plan Mensual (Recurrente)'}
              </strong>
            </div>

            {simulationMode === 'daily' ? (
              <>
                <div className="flex justify-between text-zinc-300 font-medium">
                  <span>Jornada:</span>
                  <strong className="text-white font-bold">1 día puntual</strong>
                </div>
                <div className="flex justify-between text-zinc-300 font-medium">
                  <span>Permanencia:</span>
                  <strong className="text-white font-bold">{selectedDailyHours} {selectedDailyHours === 1 ? 'hora' : 'horas'} en el día</strong>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-zinc-300 font-medium">
                  <span>Frecuencia:</span>
                  <strong className="text-white font-bold">{selectedDays} {selectedDays === 1 ? 'día' : 'días'} por semana</strong>
                </div>
                <div className="flex justify-between text-zinc-300 font-medium">
                  <span>Permanencia:</span>
                  <strong className="text-white font-bold">{selectedHours} {selectedHours === 1 ? 'hora' : 'horas'} por día</strong>
                </div>
              </>
            )}

            <div className="flex justify-between text-zinc-300 font-medium border-t border-white/10 pt-1">
              <span>Espacio:</span>
              <strong className="text-white font-bold">Espacio UP Deportivo & Cuidado</strong>
            </div>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-105 active:scale-[0.98] text-white font-heading font-black text-xs sm:text-sm uppercase py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>
              {simulationMode === 'daily' ? 'Consultar Disponibilidad para este Día' : 'Consultar Vacante con este Plan'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Calculator, Clock, Calendar, CheckCircle2, MessageCircle, Star, ShieldCheck } from 'lucide-react';
import { getPricingSettings, formatCurrency, listenToPricingSettings } from '../services/storage';
import { BRAND_INFO } from '../data/initialData';
import { PricingSettings } from '../types';

export const DaycareSimulator: React.FC = () => {
  const [pricing, setPricing] = useState<PricingSettings>(getPricingSettings);
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

  // Allowed hour options depend on days: 5hs is available for 1 day
  const hourOptions = selectedDays === 1 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];

  // Adjust selected hours if user switches from 1 day (5hs) to multi-days
  useEffect(() => {
    if (selectedDays > 1 && selectedHours > 4) {
      setSelectedHours(4);
    }
  }, [selectedDays, selectedHours]);

  const currentOption = pricing.daycare.options.find(
    (opt) => opt.days === selectedDays && opt.hours === selectedHours
  );

  const calculatedPrice = currentOption ? currentOption.price : 0;

  const whatsappMessage = `Hola! Estuve calculando en el simulador de la web para el Espacio UP: plan de ${selectedDays} ${
    selectedDays === 1 ? 'día' : 'días'
  } por semana (${selectedHours} ${
    selectedHours === 1 ? 'hora' : 'horas'
  } por día) por un valor de ${formatCurrency(calculatedPrice)} mensual. ¿Tienen vacantes disponibles?`;

  const whatsappHref = `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div id="simulador-up" className="bg-zinc-950/80 border-2 border-white/20 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#A3BA13] text-black flex items-center justify-center font-black shadow-md shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>Simulador de Tarifas Espacio UP</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F2C700] text-black">
                Mensual
              </span>
            </h3>
            <p className="text-xs text-zinc-300 font-medium">
              Elegí los días y las horas que necesitás para calcular el arancel en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A3BA13] font-black bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
          <Star className="w-3.5 h-3.5" />
          <span>Aranceles Actualizados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Days Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#A3BA13]" /> 1. Cantidad de Días a la Semana
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((d) => {
                const isSelected = selectedDays === d;
                return (
                  <button
                    key={`day-${d}`}
                    type="button"
                    onClick={() => setSelectedDays(d)}
                    className={`p-3 rounded-xl font-heading font-black text-xs sm:text-sm uppercase transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#A3BA13] text-black font-black shadow-[0_0_15px_rgba(163,186,19,0.5)] scale-102 border-2 border-white'
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
              <Clock className="w-4 h-4 text-[#F2C700]" /> 2. Cantidad de Horas Diarias
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {hourOptions.map((h) => {
                const isSelected = selectedHours === h;
                return (
                  <button
                    key={`hour-${h}`}
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

          {/* Advantages Bullet Points */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2 text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-[#A3BA13] shrink-0" />
              <span>Franja horaria flexible: de 7:30 a 17:00 hs según tus necesidades.</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-[#A3BA13] shrink-0" />
              <span>Cupo reducido con profesores de educación física y recreación infantil.</span>
            </div>
          </div>
        </div>

        {/* Output & WhatsApp CTA Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-2 border-[#A3BA13]/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl text-center flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">
              Cuota Mensual Estimada
            </span>
            <div className="text-3xl sm:text-4xl font-heading font-black text-[#F2C700] tracking-tight">
              {formatCurrency(calculatedPrice)}
              <span className="text-xs font-bold text-zinc-400 block mt-0.5">/ mes</span>
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs space-y-1 text-left">
            <div className="flex justify-between text-zinc-300 font-medium">
              <span>Frecuencia:</span>
              <strong className="text-white font-bold">{selectedDays} {selectedDays === 1 ? 'día' : 'días'} por semana</strong>
            </div>
            <div className="flex justify-between text-zinc-300 font-medium">
              <span>Permanencia:</span>
              <strong className="text-white font-bold">{selectedHours} {selectedHours === 1 ? 'hora' : 'horas'} por día</strong>
            </div>
            <div className="flex justify-between text-zinc-300 font-medium border-t border-white/10 pt-1">
              <span>Plan:</span>
              <strong className="text-[#A3BA13] font-bold">Espacio UP Deportivo & Cuidado</strong>
            </div>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-105 active:scale-[0.98] text-white font-heading font-black text-xs sm:text-sm uppercase py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>Consultar Vacante con este Plan</span>
          </a>
        </div>
      </div>
    </div>
  );
};

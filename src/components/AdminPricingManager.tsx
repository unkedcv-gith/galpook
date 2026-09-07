import React, { useState, useEffect } from 'react';
import { 
  PricingSettings, 
  DaycarePricingOption, 
  BirthdayMonthPrice, 
  BirthdayAdditionalPrice 
} from '../types';
import { 
  getPricingSettings, 
  savePricingSettings, 
  formatCurrency, 
  listenToPricingSettings 
} from '../services/storage';
import { INITIAL_PRICING_SETTINGS } from '../data/initialData';
import { 
  Tag, 
  Save, 
  RotateCcw, 
  Check, 
  Dumbbell, 
  Baby, 
  Cake, 
  Star, 
  AlertCircle,
  HelpCircle,
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react';

interface AdminPricingManagerProps {
  isSuperAdmin: boolean;
}

export const AdminPricingManager: React.FC<AdminPricingManagerProps> = ({ isSuperAdmin }) => {
  const [pricing, setPricing] = useState<PricingSettings>(getPricingSettings);
  const [activeSubSection, setActiveSubSection] = useState<'fitness' | 'daycare' | 'birthdays'>('fitness');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(5);

  useEffect(() => {
    const unsub = listenToPricingSettings((updated) => {
      setPricing(updated);
    });
    return () => {
      unsub();
    };
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="font-heading font-black text-white text-lg uppercase">Acceso Restringido</h3>
        <p className="text-sm text-zinc-300">
          La gestión de precios y tarifas está reservada exclusivamente para el usuario SuperAdmin.
        </p>
      </div>
    );
  }

  const handleFitnessChange = (key: 'onceAWeek' | 'twiceAWeek', value: string) => {
    const num = parseInt(value, 10) || 0;
    setPricing((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        [key]: num,
      },
    }));
  };

  const handleDaycarePriceChange = (days: number, hours: number, value: string) => {
    const num = parseInt(value, 10) || 0;
    setPricing((prev) => {
      const exists = prev.daycare.options.some((o) => o.days === days && o.hours === hours);
      let updatedOptions: DaycarePricingOption[];
      if (exists) {
        updatedOptions = prev.daycare.options.map((o) =>
          o.days === days && o.hours === hours ? { ...o, price: num } : o
        );
      } else {
        updatedOptions = [...prev.daycare.options, { days, hours, price: num }];
      }
      return {
        ...prev,
        daycare: {
          ...prev.daycare,
          options: updatedOptions,
        },
      };
    });
  };

  const handleBirthdayDepositChange = (value: string) => {
    setPricing((prev) => ({
      ...prev,
      birthdays: {
        ...prev.birthdays,
        depositAmount: parseInt(value, 10) || 0,
      },
    }));
  };

  const handleBirthdayMonthPriceChange = (monthIndex: number, value: string) => {
    const num = parseInt(value, 10) || 0;
    setPricing((prev) => ({
      ...prev,
      birthdays: {
        ...prev.birthdays,
        monthlyBasePrices: prev.birthdays.monthlyBasePrices.map((m) =>
          m.monthIndex === monthIndex ? { ...m, basePrice: num } : m
        ),
      },
    }));
  };

  const handleBirthdayAdditionalChange = (id: string, field: 'price' | 'description' | 'name', value: any) => {
    setPricing((prev) => ({
      ...prev,
      birthdays: {
        ...prev.birthdays,
        additionals: prev.birthdays.additionals.map((a) => {
          if (a.id !== id) return a;
          if (field === 'price') {
            return { ...a, price: parseInt(value, 10) || 0 };
          }
          return { ...a, [field]: value };
        }),
      },
    }));
  };

  const handleSave = () => {
    savePricingSettings(pricing);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('¿Estás seguro de restablecer todos los precios y tarifas a los valores iniciales por defecto?')) {
      setPricing(INITIAL_PRICING_SETTINGS);
      savePricingSettings(INITIAL_PRICING_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-zinc-950/80 border-2 border-white/20 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A3BA13] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Módulo Exclusivo SuperAdmin
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              Gestión de Precios & Aranceles
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-2xl">
              Configurá los precios de Fitness, la matriz de cálculo del simulador de Espacio UP y las tarifas mensuales de Cumpleaños con sus adicionales. Todos los cambios se reflejan de inmediato para los usuarios.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              title="Restablecer valores a los por defecto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Valores por Defecto</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#A3BA13] hover:bg-white text-black font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(163,186,19,0.5)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Precios</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="bg-[#A3BA13]/20 border-2 border-[#A3BA13] text-white px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in shadow-lg">
            <div className="w-6 h-6 rounded-full bg-[#A3BA13] text-black flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
              ¡Precios guardados y sincronizados correctamente en la nube y en el sitio!
            </span>
          </div>
        )}

        {/* Navigation Subtabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubSection('fitness')}
            className={`p-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'fitness'
                ? 'bg-[#1EB8BF] text-black shadow-md'
                : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>1. Fitness & Talleres</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('daycare')}
            className={`p-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'daycare'
                ? 'bg-[#A3BA13] text-black shadow-md'
                : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>2. Simulador Espacio UP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('birthdays')}
            className={`p-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'birthdays'
                ? 'bg-[#ED3078] text-white shadow-md'
                : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span>3. Cumpleaños & Adicionales</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECCIÓN FITNESS                                                        */}
      {/* ========================================================================= */}
      {activeSubSection === 'fitness' && (
        <div className="bg-zinc-950/80 border-2 border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4 space-y-1">
            <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#1EB8BF]" /> Precios de la Sección Fitness
            </h3>
            <p className="text-xs text-zinc-300 font-medium">
              Estos aranceles se muestran en la tarjeta de actividades físicas y talleres del sitio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {/* 1 vez por semana */}
            <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-sm text-white uppercase">1 vez por semana</span>
                <span className="text-xs font-bold text-[#1EB8BF] bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                  {formatCurrency(pricing.fitness.onceAWeek)}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Cuota mensual por 1 clase semanal.</p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor en Pesos ($):</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={pricing.fitness.onceAWeek}
                  onChange={(e) => handleFitnessChange('onceAWeek', e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-xl px-4 py-2.5 text-white font-mono text-base font-bold focus:outline-hidden focus:border-[#1EB8BF]"
                />
              </div>
            </div>

            {/* 2 veces por semana */}
            <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-sm text-white uppercase">2 veces por semana</span>
                <span className="text-xs font-bold text-[#F2C700] bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                  {formatCurrency(pricing.fitness.twiceAWeek)}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Cuota mensual por 2 clases semanales.</p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor en Pesos ($):</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={pricing.fitness.twiceAWeek}
                  onChange={(e) => handleFitnessChange('twiceAWeek', e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-xl px-4 py-2.5 text-white font-mono text-base font-bold focus:outline-hidden focus:border-[#F2C700]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECCIÓN ESPACIO UP (SIMULADOR)                                         */}
      {/* ========================================================================= */}
      {activeSubSection === 'daycare' && (
        <div className="bg-zinc-950/80 border-2 border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
                <Baby className="w-5 h-5 text-[#A3BA13]" /> Matriz del Simulador Espacio UP
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#F2C700] text-black self-start sm:self-auto">
                Valores Mensuales
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-medium">
              Ajustá los importes mensuales para cada combinación de días y horas. Los padres verán estos números reflejados en tiempo real en el simulador.
            </p>
          </div>

          {/* Day selection tabs for matrix navigation */}
          <div className="space-y-2">
            <span className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#A3BA13]" /> Seleccioná la cantidad de días para editar:
            </span>
            <div className="grid grid-cols-5 gap-2">
              {[5, 4, 3, 2, 1].map((d) => (
                <button
                  key={`day-tab-${d}`}
                  type="button"
                  onClick={() => setSelectedDayTab(d)}
                  className={`p-3 rounded-xl font-heading font-black text-xs sm:text-sm uppercase transition-all cursor-pointer ${
                    selectedDayTab === d
                      ? 'bg-[#A3BA13] text-black shadow-lg scale-102 border-2 border-white'
                      : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
                  }`}
                >
                  {d} {d === 1 ? 'Día' : 'Días'}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs for currently selected day tab */}
          <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-heading font-black text-white text-base uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F2C700]" />
                <span>Configuración para {selectedDayTab} {selectedDayTab === 1 ? 'día por semana' : 'días por semana'}</span>
              </h4>
              <span className="text-xs text-zinc-400 font-medium">
                {selectedDayTab === 1 ? '5 opciones de permanencia' : '4 opciones de permanencia'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(selectedDayTab === 1 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).map((hours) => {
                const opt = pricing.daycare.options.find(
                  (o) => o.days === selectedDayTab && o.hours === hours
                );
                const currentVal = opt ? opt.price : 0;

                return (
                  <div
                    key={`opt-${selectedDayTab}-${hours}`}
                    className="bg-black/60 border border-white/15 rounded-xl p-4 space-y-2 hover:border-[#A3BA13]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-xs text-white uppercase">
                        {hours} {hours === 1 ? 'hora diaria' : 'horas diarias'}
                      </span>
                      <span className="text-[11px] font-bold text-[#A3BA13]">
                        {formatCurrency(currentVal)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase font-bold">
                        Precio Mensual ($):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={currentVal}
                        onChange={(e) => handleDaycarePriceChange(selectedDayTab, hours, e.target.value)}
                        className="w-full bg-zinc-950 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm font-bold focus:outline-hidden focus:border-[#A3BA13]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECCIÓN CUMPLEAÑOS & ADICIONALES                                       */}
      {/* ========================================================================= */}
      {activeSubSection === 'birthdays' && (
        <div className="bg-zinc-950/80 border-2 border-white/15 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Sub-block A: Configuración de Seña */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-4 space-y-1">
              <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Valor de la Seña
              </h3>
              <p className="text-xs text-zinc-300 font-medium">
                Monto fijo requerido para confirmar la reserva y congelar la fecha.
              </p>
            </div>
            
            <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 max-w-sm">
              <div className="space-y-2">
                <label className="text-xs text-zinc-300 uppercase font-bold flex items-center justify-between">
                  <span>Monto ($):</span>
                  <span className="text-emerald-400">{formatCurrency(pricing.birthdays.depositAmount)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={pricing.birthdays.depositAmount}
                  onChange={(e) => handleBirthdayDepositChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Sub-block B: Base Monthly Prices */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="border-b border-white/10 pb-4 space-y-1">
              <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
                <Cake className="w-5 h-5 text-[#ED3078]" /> Tarifas Base Mensuales de Cumpleaños
              </h3>
              <p className="text-xs text-zinc-300 font-medium">
                En el Paso 2 del proceso de reserva, cuando el cliente elija un mes en el almanaque, se mostrará el valor base configurado aquí para ese mes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {pricing.birthdays.monthlyBasePrices.map((m) => (
                <div
                  key={`month-${m.monthIndex}`}
                  className="bg-zinc-900/80 border border-white/15 rounded-2xl p-3.5 space-y-2 hover:border-[#ED3078]/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-sm text-white uppercase">
                      {m.monthName}
                    </span>
                    <span className="text-xs font-bold text-[#F2C700] bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                      {formatCurrency(m.basePrice)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">
                      Tarifa Base ($):
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={m.basePrice}
                      onChange={(e) => handleBirthdayMonthPriceChange(m.monthIndex, e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-hidden focus:border-[#ED3078]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-block B: Additionals */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="border-b border-white/10 pb-3 space-y-1">
              <h4 className="font-heading text-lg font-black text-white uppercase flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#1EB8BF]" /> Valores de Adicionales de Cumpleaños
              </h4>
              <p className="text-xs text-zinc-300 font-medium">
                Estos valores se muestran debajo de la tarifa base en el Paso 2 para que los clientes conozcan el costo de superar los 20 chicos base o agregar adultos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricing.birthdays.additionals.map((add) => (
                <div
                  key={add.id}
                  className="bg-zinc-900/80 border border-white/15 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xs sm:text-sm text-white uppercase">
                      {add.name}
                    </span>
                    <span className="text-xs font-bold text-[#1EB8BF] bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                      +{formatCurrency(add.price)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase font-bold">
                        Precio ($):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={add.price}
                        onChange={(e) => handleBirthdayAdditionalChange(add.id, 'price', e.target.value)}
                        className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-hidden focus:border-[#1EB8BF]"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase font-bold">
                        Descripción o Rango:
                      </label>
                      <input
                        type="text"
                        value={add.description}
                        onChange={(e) => handleBirthdayAdditionalChange(add.id, 'description', e.target.value)}
                        className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-hidden focus:border-[#1EB8BF]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { FAQ_ITEMS, BRAND_INFO } from '../data/initialData';
import { ChevronDown, ChevronUp, AlertCircle, MessageCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq_1');
  const [filter, setFilter] = useState<'todos' | 'cumpleanos' | 'talleres'>('todos');

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (filter === 'todos') return true;
    return item.category === filter;
  });

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faqs" className="w-full bg-gradient-to-b from-[#F2C700] via-[#F2C700] via-45% to-[#1EB8BF] text-black py-16 sm:py-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header Bento Box */}
        <div className="bg-black/60 backdrop-blur-md rounded-3xl border-2 border-white/20 p-6 sm:p-10 shadow-2xl text-center space-y-3 text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F2C700] text-black font-heading font-black text-xs tracking-widest uppercase shadow-md">
            Preguntas Frecuentes
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Resolvemos tus <span className="text-[#1EB8BF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Dudas</span>
          </h2>
          <p className="text-zinc-200 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            Toda la información clave extraída de nuestra experiencia cuidando y entreteniendo a los chicos.
          </p>

          {/* Filter Pills */}
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setFilter('todos')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                filter === 'todos'
                  ? 'bg-[#1EB8BF] text-black border-white shadow-md'
                  : 'bg-black/60 text-white border-white/20 hover:border-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('cumpleanos')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                filter === 'cumpleanos'
                  ? 'bg-[#ED3078] text-white border-white shadow-md'
                  : 'bg-black/60 text-white border-white/20 hover:border-white'
              }`}
            >
              🎂 Cumpleaños
            </button>
            <button
              onClick={() => setFilter('talleres')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                filter === 'talleres'
                  ? 'bg-[#A3BA13] text-black border-white shadow-md'
                  : 'bg-black/60 text-white border-white/20 hover:border-white'
              }`}
            >
              🏃 Talleres
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={`border-2 rounded-2xl transition-all overflow-hidden shadow-lg backdrop-blur-md ${
                  isOpen
                    ? 'bg-black/60 text-white border-white'
                    : 'bg-black/60 text-white border-white/20 hover:border-white/60'
                }`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-heading font-black text-base sm:text-lg text-white uppercase cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-black font-black text-xs sm:text-sm font-bold bg-[#F2C700] px-2.5 py-1 rounded-lg">
                      {item.numberTag.replace('/', '')}
                    </span>
                    <span>{item.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#F2C700] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed border-t border-white/15 space-y-3">
                    <p>{item.answer}</p>
                    {item.highlight && (
                      <div className="bg-zinc-950/60 border border-[#ED3078] px-3.5 py-2 rounded-xl text-xs font-black text-[#ED3078] inline-flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#F2C700] shrink-0" />
                        <span>Importante: {item.highlight}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Callout Bento Box */}
        <div className="bg-black/60 backdrop-blur-md border-2 border-white/20 rounded-3xl p-6 text-center max-w-3xl mx-auto space-y-3 shadow-2xl text-white">
          <h3 className="font-heading text-xl font-black text-white uppercase">
            ¿Tenés alguna otra duda específica?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-200 font-medium max-w-xl mx-auto">
            Escribinos directo por WhatsApp y te ayudamos a coordinar todo de forma rápida y personalizada.
          </p>
          <div className="pt-1">
            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent('Hola! Tengo una consulta sobre los eventos/talleres de El Galpón.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-[#F2C700] hover:bg-white text-black font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Hablar por WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};


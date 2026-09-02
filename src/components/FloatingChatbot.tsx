import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { BRAND_INFO, FAQ_ITEMS } from '../data/initialData';

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: '¡Hola! Soy el asistente virtual de El Galpón 🤖. ¿En qué te puedo ayudar hoy?', isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInputValue('');

    // Very basic keyword matching for demo purposes
    setTimeout(() => {
      let botResponse = '';
      const lowerText = userText.toLowerCase();
      
      if (lowerText.includes('precio') || lowerText.includes('valor') || lowerText.includes('cuanto') || lowerText.includes('sale')) {
        botResponse = 'Los valores dependen de la fecha y cantidad de invitados. Si reservás con seña, congelás el valor total. ¿Querés que te derive a WhatsApp para un presupuesto exacto?';
      } else if (lowerText.includes('ver') || lowerText.includes('conocer') || lowerText.includes('visitar') || lowerText.includes('mostrar')) {
        botResponse = 'No solemos mostrar los salones vacíos porque cada evento es único y se arma al momento. ¡Tenemos videos geniales para mostrarte! Si querés igual coordinar una visita rápida, escribinos por WhatsApp.';
      } else if (lowerText.includes('cumple') || lowerText.includes('edades')) {
        botResponse = 'Nuestros cumples son para chicos de 6 a 12 años, duran 2 horas y media y son súper activos. Base 20 chicos, máximo hasta 35 (o 40 según la sucursal).';
      } else if (lowerText.includes('talleres') || lowerText.includes('fitness') || lowerText.includes('pekes') || lowerText.includes('cross')) {
        botResponse = 'Tenemos FITNESS dividido en: Pekes en Acción (3 a 6 años) y Crossteens (7 a 11 años). ¿Te paso horarios por WhatsApp?';
      } else if (lowerText.includes('up') || lowerText.includes('cuidado') || lowerText.includes('dia')) {
        botResponse = 'UP es nuestro espacio de cuidado y actividades deportivas. Ideal si hay paro o necesitás hacer algo. De lunes a viernes de 7:30 a 17:00 hs.';
      } else if (lowerText.includes('sucursal') || lowerText.includes('direccion') || lowerText.includes('donde')) {
        botResponse = 'Tenemos dos sucursales en La Plata: "El Galpón Calle 5" y "El Galpón Calle 13". Cada una tiene juegos diferentes como Muro de Escalada y Camas Elásticas.';
      } else {
        botResponse = '¡Entiendo! Para darte una respuesta más precisa o consultar disponibilidad, te recomiendo hablar con una persona de nuestro equipo en WhatsApp.';
      }

      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90vw] sm:w-[350px] h-[450px] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1EB8BF] flex items-center justify-center border-2 border-black">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-heading font-black text-white text-sm uppercase">GalpoBot</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Asistente Virtual</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.isBot 
                    ? 'bg-zinc-800/80 text-zinc-100 rounded-tl-sm' 
                    : 'bg-[#1EB8BF] text-black font-medium rounded-tr-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input & CTA */}
          <div className="p-3 bg-zinc-900 border-t border-white/10 space-y-3">
            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent('Hola! Quisiera hablar con un asesor.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase py-2.5 rounded-xl transition-colors shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Hablar con un Humano
            </a>
            
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu consulta..." 
                className="flex-1 bg-black border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1EB8BF]"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-[#ED3078] hover:bg-[#d62a69] text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button Toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
          title="Asistente Virtual"
          aria-label="Abrir chat de consultas"
        >
          {/* Outer Circular SVG with Curved Rotating Text */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <svg 
              className="absolute inset-0 w-full h-full animate-[spin_18s_linear_infinite] group-hover:animate-[spin_8s_linear_infinite] pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]" 
              viewBox="0 0 100 100"
            >
              <defs>
                <path
                  id="globalCircleTextPath"
                  d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                />
              </defs>
              <text 
                fill="#ffffff" 
                fontSize="9" 
                fontWeight="900" 
                className="font-heading uppercase tracking-[0.16em]"
              >
                <textPath href="#globalCircleTextPath" startOffset="0%">
                  • GALPOBOT • DUDAS • CONSULTAS •
                </textPath>
              </text>
            </svg>

            {/* Central Bot Round Button */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#1EB8BF] text-black flex items-center justify-center shadow-[0_0_20px_rgba(30,184,191,0.7)] border-2 border-black group-hover:bg-[#F2C700] transition-all duration-300">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

import { FaqItem, WorkshopProgram, TimeSlot, Reservation, AttractionItem, Branch, AppUser, Inquiry } from '../types';

export const BRAND_INFO = {
  name: 'El Galpón',
  tagline: 'Una excusa más para NO usar pantallas',
  subtitle: 'Nuestras actividades pensadas con un propósito: entretenimiento sano.',
  phone: '221 573-1047',
  whatsappUrl: 'https://wa.me/5492215731047',
  instagram: '@up.deportivoyrecreativo',
  instagramUrl: 'https://instagram.com/up.deportivoyrecreativo',
  hours: 'Lunes a Viernes de 7:30 a 17:00 hs (Talleres) | Sábados y Domingos (Cumpleaños)',
  address: 'El Galpón - Espacio Recreativo Deportivo',
};

export const DEFAULT_BANK_INFO = {
  bankName: 'Banco Galicia / Mercado Pago',
  accountHolder: 'El Galpón Recreativo S.R.L.',
  cuit: '30-71689452-3',
  cbu: '0070123430004567890123',
  alias: 'ELGALPON.FESTEJOS',
  depositAmount: 100000,
};

// Initial Branches (Calle 5 y Calle 13)
export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'calle-5',
    name: 'El Galpón Calle 5',
    address: 'Calle 5 e/ 58 y 59 Nº 1234',
    city: 'La Plata',
    phone: '221 573-1047',
    whatsappNumber: '5492215731047',
    franquistaUserId: 'user_fran_calle5',
    franquistaName: 'Martín Rodríguez',
    franquistaEmail: 'franquicia5@elgalpon.com',
    isActive: true,
    color: '#ED3078',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'calle-13',
    name: 'El Galpón Calle 13',
    address: 'Calle 13 e/ 45 y 46 Nº 567',
    city: 'La Plata',
    phone: '221 573-1047',
    whatsappNumber: '5492215731047',
    franquistaUserId: 'user_fran_calle13',
    franquistaName: 'Valeria Rossi',
    franquistaEmail: 'franquicia13@elgalpon.com',
    isActive: true,
    color: '#1EB8BF',
    createdAt: new Date().toISOString(),
  },
];

// Initial Users for 4-level Role Hierarchy
export const INITIAL_USERS: AppUser[] = [
  {
    uid: 'user_superadmin',
    email: 'superadmin@elgalpon.com',
    username: 'superadmin',
    displayName: 'SuperAdmin Dev',
    password: 'superadmin2026',
    role: 'superadmin',
    phone: '221 500-0001',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'user_admin',
    email: 'admin@elgalpon.com',
    username: 'admin',
    displayName: 'Dueño General (Admin)',
    password: 'admin2026',
    role: 'admin',
    phone: '221 500-0002',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'user_fran_calle5',
    email: 'franquicia5@elgalpon.com',
    username: 'franquicia5',
    displayName: 'Martín Rodríguez (Franquista Calle 5)',
    password: 'franquicia5',
    role: 'franquista',
    assignedBranchId: 'calle-5',
    assignedBranchName: 'El Galpón Calle 5',
    phone: '221 573-1047',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'user_fran_calle13',
    email: 'franquicia13@elgalpon.com',
    username: 'franquicia13',
    displayName: 'Valeria Rossi (Franquista Calle 13)',
    password: 'franquicia13',
    role: 'franquista',
    assignedBranchId: 'calle-13',
    assignedBranchName: 'El Galpón Calle 13',
    phone: '221 573-1047',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const TIME_SLOTS: TimeSlot[] = [
  {
    id: 'turn_weekday_evening',
    title: 'Turno Tarde/Noche',
    timeRange: '18:30 a 21:00 hs',
    description: 'Turno exclusivo de Lunes a Viernes.',
  },
  {
    id: 'turn_weekend_1',
    title: 'Turno Mediodía',
    timeRange: '12:30 a 15:00 hs',
    description: 'Ideal para almorzar e iniciar el día con diversión.',
  },
  {
    id: 'turn_weekend_2',
    title: 'Turno Tarde',
    timeRange: '16:00 a 18:30 hs',
    description: 'El turno preferido para merendar y jugar.',
  },
  {
    id: 'turn_weekend_3',
    title: 'Turno Noche',
    timeRange: '19:30 a 22:00 hs',
    description: 'Perfecto para finalizar el día con la mejor energía.',
  },
];

export const HOLIDAYS: string[] = [
  // Agregar feriados en formato 'YYYY-MM-DD' si se requiere
];

export const ATTRACTIONS: AttractionItem[] = [
  {
    id: 'muro',
    title: 'Muro de Escalada',
    description: 'Paredes adaptadas con tomas, arnés de seguridad y colchonetas de protección.',
    icon: 'Mountain',
    staffSupervised: true,
  },
  {
    id: 'tirolesa',
    title: 'Tirolesa de Vuelo',
    description: 'Aventura aérea de gran velocidad con asistencia directa de profes.',
    icon: 'Zap',
    staffSupervised: true,
  },
  {
    id: 'circuitos',
    title: 'Circuitos Deportivos',
    description: 'Obstáculos, túneles, carrera de destreza y juegos de posta por equipos.',
    icon: 'Trophy',
    staffSupervised: false,
  },
  {
    id: 'telas_aros',
    title: 'Telas, Aros y Reloj Loco',
    description: 'Acrobacia, telas suspendidas, juego de esquivar y equilibrio dinámico.',
    icon: 'Activity',
    staffSupervised: true,
  },
  {
    id: 'elasticas',
    title: 'Camas Elásticas',
    description: 'Saltos y piruetas controladas bajo la guía de nuestros instructores.',
    icon: 'Smile',
    staffSupervised: true,
  },
  {
    id: 'arte_creatividad',
    title: 'Arte y Expresión Corporal',
    description: 'Taller creativo, pintura libre y dinámicas de movimiento lúdico.',
    icon: 'Palette',
    staffSupervised: false,
  },
];

export const WORKSHOP_PROGRAMS: WorkshopProgram[] = [
  {
    id: 'pekes_en_accion',
    title: 'Pekes en Acción',
    subtitle: 'Fitness y juego para los chicos',
    ageRange: 'De 3 a 6 años',
    schedule: 'Martes y Jueves (17:30 a 18:30 hs)',
    description: 'Desarrollo motriz, iniciación deportiva, esquivar obstáculos y juegos cooperativos en un entorno protegido.',
    highlights: ['Psicomotricidad', 'Juegos con pelotas y colchonetas', 'Profes especializados', 'Cero pantallas'],
    color: 'cyan',
    iconName: 'Baby',
  },
  {
    id: 'crossteens',
    title: 'Crossteens',
    subtitle: 'Fitness y agilidad para los chicos',
    ageRange: 'De 7 a 11 años',
    schedule: 'Martes y Jueves (18:30 a 19:30 hs)',
    description: 'Circuitos de agilidad, velocidad, salto y juegos en equipo diseñados para descargar energía de forma saludable.',
    highlights: ['Circuitos de alta agilidad', 'Desafíos en equipo', 'Muro y tirolesa', 'Entrenamiento funcional guiado'],
    color: 'pink',
    iconName: 'Dumbbell',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq_1',
    numberTag: '1',
    question: '¿Por qué damos solo 1 super pancho por chico?',
    answer: 'A diferencia de una casita de fiestas convencional donde comen sentados durante 40 minutos con animación pasiva, en El Galpón los chicos COMEN EN 10 MINUTOS. Si comieran más en tan poco tiempo y luego salieran a correr, saltar en camas elásticas y dar vueltas carnero, vomitarían o se sentirían mal. Priorizamos la salud y seguridad de los pekes.',
    category: 'cumpleanos',
    highlight: 'Cuidado gastrointestinal para juego activo',
  },
  {
    id: 'faq_2',
    numberTag: '2',
    question: '¿Por qué el festejo dura 2 horas y media (2 1/2 hs)?',
    answer: 'El Galpón es un lugar donde los chicos hacen deporte de alta intensidad desde que llegan hasta que se van. Terminan realmente muy cansados y satisfechos. Hemos probado hacer festejos de 3 horas como el resto de los salones, pero los chicos en la última media hora ya no querían jugar porque no daban más del agotamiento sano.',
    category: 'cumpleanos',
    highlight: '2:30 hs exactas de máxima energía',
  },
  {
    id: 'faq_3',
    numberTag: '3',
    question: '¿Puede participar de todos los juegos cualquier invitado?',
    answer: 'El muro de escalada, tirolesa, tela, aro, reloj loco y camas elásticas están a cargo de profesores de educación física. Solo pueden subir los niños que tengan la pulsera correspondiente y estén a su cuidado directo. El resto de los invitados puede participar alegremente en todos los circuitos deportivos.',
    category: 'cumpleanos',
    highlight: 'Atracciones de altura supervisadas por profes',
  },
  {
    id: 'faq_4',
    numberTag: '4',
    question: '¿Se puede agregar más comida para el evento?',
    answer: 'Sí, por supuesto, pero SOLO para el sector de ADULTOS. Recordemos que los niños están haciendo deporte constante y comer de más les hace mal. Les pedimos que nos avisen qué catering o comida van a traer para aconsejarlos, ya que 2:30 hs pasan volando y a veces traen demasiada cantidad.',
    category: 'cumpleanos',
    highlight: 'Comida extra habilitada para adultos',
  },
  {
    id: 'faq_5',
    numberTag: '5',
    question: '¿Puedo ir a ver el galpón antes de reservar?',
    answer: 'No solemos mostrarlos a los salones vacíos por una razón: no somos una típica casita que tiene todo armado. En El Galpón cada cumple es diferente, depende la cantidad de chicos, profesores contratados, la edad del grupo y la intensidad. Tenemos muchas actividades y armamos el salón justo para los eventos. Cuando lo hemos mostrado, solo ven un galpón vacío con un muro sobre una pared, porque los materiales están a un costado y el sector donde comen los chicos está sin armar para aprovechar todo el espacio. Por eso hicimos videos con una fotógrafa profesional para que puedan ver que las actividades son totalmente diferentes a una animación tradicional y apreciar las instalaciones en acción. Te podemos enviar más videos o fotos si es necesario. Si de igual forma querés ir, tendríamos que coordinar para que pases rápido antes de que lleguen los padres a un evento.',
    category: 'cumpleanos',
    highlight: 'Videos de eventos reales',
  },
  {
    id: 'faq_6',
    numberTag: '6',
    question: '¿Se congelan los precios con la seña?',
    answer: '¡Totalmente! Al abonar la seña no solo garantizás la reserva exclusiva de la fecha, sino que también CONGELAS EL VALOR TOTAL del contrato base y de los adicionales que sumemos, aunque los agreguemos una semana antes del evento. Así ya vas a saber exactamente lo que te resta abonar según los invitados confirmados que tengas.',
    category: 'cumpleanos',
    highlight: 'Congelamiento de tarifa garantizado',
  },
  {
    id: 'faq_7',
    numberTag: '7',
    question: '¿Puedo invitar a más de 20 chicos?',
    answer: 'El contrato base cubre 20 chicos e incluye hasta 35 invitados totales (contando al cumpleañer@). Una semana antes del evento revisamos las confirmaciones para determinar si aplica el Adicional 1 (chicos 21 al 28) o el Adicional 2 (chicos 29 al 35).',
    category: 'cumpleanos',
    highlight: 'Base 20 niños, ampliable hasta 35',
  },
  {
    id: 'faq_8',
    numberTag: '8',
    question: '¿Puedo ir pagando en cuotas o adelantos mensuales?',
    answer: 'Sí! Podés ir realizando adelantos en efectivo. Solo coordinamos el día, horario y la sucursal para encontrarnos e ir abonando el saldo del evento a tu ritmo hasta la fecha del festejo.',
    category: 'cumpleanos',
    highlight: 'Planes de pago flexibles en efectivo',
  },
];

// Helper dates relative to today for dynamic initial demo reservations
const getDemoDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Calculate dates for current week days (today, tomorrow, weekend)
const now = new Date();
const currentDayOfWeek = now.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

const getDayInCurrentWeek = (dayOffsetFromMonday: number) => {
  const d = new Date(now);
  d.setDate(now.getDate() + diffToMonday + dayOffsetFromMonday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_INQUIRIES: Inquiry[] = [];

export const INITIAL_BLOCKED_DATES: { branchId?: string; date: string; reason: string }[] = [
  {
    branchId: 'calle-5',
    date: getDayInCurrentWeek(1),
    reason: 'Mantenimiento preventivo Muro y Tirolesa Calle 5',
  },
];

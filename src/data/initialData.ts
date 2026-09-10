import { 
  FaqItem, 
  WorkshopProgram, 
  TimeSlot, 
  Reservation, 
  AttractionItem, 
  Branch, 
  AppUser, 
  Inquiry,
  PricingSettings,
  DaycarePricingOption,
  DaycareDailyOption,
  BirthdayMonthPrice,
  BirthdayAdditionalPrice
} from '../types';

export const BRAND_INFO = {
  name: 'El Galpón',
  tagline: 'Una excusa más para NO usar pantallas',
  subtitle: 'Nuestras actividades pensadas con un propósito: entretenimiento sano.',
  phone: '221 573-1047',
  whatsappUrl: 'https://wa.me/5492215731047',
  instagramMain: '@elgalponlaplata',
  instagramMainUrl: 'https://instagram.com/elgalponlaplata',
  instagram: '@up.deportivoyrecreativo',
  instagramUrl: 'https://instagram.com/up.deportivoyrecreativo',
  hours: 'Lunes a Viernes de 7:30 a 17:00 hs (Talleres) | Turnos de 2:30hs, Todos los días! (Cumpleaños)',
  address: 'El Galpón - Espacio Recreativo Deportivo',
};

export const DEFAULT_BANK_INFO = {
  bankName: 'Mercado Pago',
  accountHolder: 'Romina Finocchi',
  cuit: '',
  cbu: '',
  alias: 'elgalpon.5',
  depositAmount: 100000,
};

// Initial Branches (Calle 5 y Calle 13)
export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'calle-5',
    name: 'El Galpón Calle 5',
    address: 'Calle 5 e/ 34 y 35',
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
    address: 'Calle 13 e/ 530 y 531',
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
];

export const WORKSHOP_PROGRAMS: WorkshopProgram[] = [
  {
    id: 'pekes_en_accion',
    title: 'Pekes en Acción',
    subtitle: 'Fitness y juego para los chicos',
    ageRange: 'De 3 a 6 años',
    schedule: 'Martes y Jueves (17:30 a 18:30 hs)',
    pricing: {
      onceAWeek: '1 vez por semana $32.000 (mensual)',
      twiceAWeek: '2 veces por semana $52.000 (mensual)',
    },
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
    pricing: {
      onceAWeek: '1 vez por semana $32.000 (mensual)',
      twiceAWeek: '2 veces por semana $52.000 (mensual)',
    },
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
    answer: 'El contrato base cubre 20 chicos e incluye hasta 35 invitados totales (contando al cumpleañer@). Una semana antes del evento revisamos las confirmaciones para determinar si aplica el Adicional 1 (chicos 21 al 28) o el Adicional 2 (chicos 29 al 35). La sucursal de calle 5 tiene un 3er Adicional de 5 chicos más (40 totales).',
    category: 'cumpleanos',
    highlight: 'Base 20 niños, ampliable hasta 35',
  },
  {
    id: 'faq_8',
    numberTag: '8',
    question: '¿Puedo ir pagando en cuotas o adelantos mensuales?',
    answer: 'La mitad del contrato base se puede transferir y la otra mitad es en efectivo coordinando para pasar por alguna de las sucursales.',
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

export const INITIAL_DAYCARE_OPTIONS: DaycarePricingOption[] = [
  // 5 días
  { days: 5, hours: 1, price: 90000 },
  { days: 5, hours: 2, price: 118000 },
  { days: 5, hours: 3, price: 141000 },
  { days: 5, hours: 4, price: 158000 },
  // 4 días
  { days: 4, hours: 1, price: 87000 },
  { days: 4, hours: 2, price: 118000 },
  { days: 4, hours: 3, price: 124200 },
  { days: 4, hours: 4, price: 155000 },
  // 3 días
  { days: 3, hours: 1, price: 66000 },
  { days: 3, hours: 2, price: 96000 },
  { days: 3, hours: 3, price: 111200 },
  { days: 3, hours: 4, price: 124200 },
  // 2 días
  { days: 2, hours: 1, price: 52000 },
  { days: 2, hours: 2, price: 87000 },
  { days: 2, hours: 3, price: 96000 },
  { days: 2, hours: 4, price: 118000 },
  // 1 día
  { days: 1, hours: 1, price: 34000 },
  { days: 1, hours: 2, price: 52000 },
  { days: 1, hours: 3, price: 66000 },
  { days: 1, hours: 4, price: 87000 },
  { days: 1, hours: 5, price: 90000 },
];

export const INITIAL_DAYCARE_DAILY_RATES: DaycareDailyOption[] = [
  { hours: 1, price: 9500 },
  { hours: 2, price: 16000 },
  { hours: 3, price: 21000 },
  { hours: 4, price: 26000 },
  { hours: 5, price: 30000 },
];

export const INITIAL_CALLE5_ADDITIONALS: BirthdayAdditionalPrice[] = [
  {
    id: 'calle5_add_8',
    name: '+8 CHICOS',
    badge: 'NENE 21 AL 28',
    description: 'Para recibir del nene 21 al 28. Incluye más personal y comida.',
    price: 210000,
    branchId: 'calle-5',
  },
  {
    id: 'calle5_add_15',
    name: '+15 CHICOS',
    badge: 'NENE 29 AL 35',
    description: 'Para recibir del nene 29 al 35. Incluye más personal y comida.',
    price: 275000,
    branchId: 'calle-5',
  },
  {
    id: 'calle5_add_20',
    name: '+20 CHICOS',
    badge: 'NENE 36 AL 40 • MÁXIMO',
    description: 'Para recibir del nene 36 al 40. Máximo de nenes permitido en Calle 5.',
    price: 335000,
    branchId: 'calle-5',
    isMaxChicos: true,
  },
  {
    id: 'calle5_add_10_adultos',
    name: '+10 ADULTOS',
    badge: 'ADULTO 21 AL 30',
    description: 'Para recibir del adulto 21 al 30. Incluye mozo, vajilla y pizza/empanadas extra.',
    price: 150000,
    branchId: 'calle-5',
  },
];

export const INITIAL_CALLE13_ADDITIONALS: BirthdayAdditionalPrice[] = [
  {
    id: 'calle13_add_8',
    name: '+8 CHICOS',
    badge: 'NENE 21 AL 28',
    description: 'Para recibir del nene 21 al 28. Incluye más personal y comida.',
    price: 210000,
    branchId: 'calle-13',
  },
  {
    id: 'calle13_add_15',
    name: '+15 CHICOS',
    badge: 'NENE 29 AL 35 • MÁXIMO',
    description: 'Para recibir del nene 29 al 35. Máximo de nenes permitido en Calle 13.',
    price: 275000,
    branchId: 'calle-13',
    isMaxChicos: true,
  },
];

export const INITIAL_BIRTHDAY_ADDITIONALS: BirthdayAdditionalPrice[] = [
  ...INITIAL_CALLE5_ADDITIONALS,
  ...INITIAL_CALLE13_ADDITIONALS,
];

export const INITIAL_BIRTHDAY_MONTHS: BirthdayMonthPrice[] = [
  { monthIndex: 0, monthName: 'Enero', basePrice: 500000, basePriceCalle5: 520000, basePriceCalle13: 480000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 1, monthName: 'Febrero', basePrice: 500000, basePriceCalle5: 520000, basePriceCalle13: 480000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 2, monthName: 'Marzo', basePrice: 520000, basePriceCalle5: 540000, basePriceCalle13: 500000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 3, monthName: 'Abril', basePrice: 520000, basePriceCalle5: 540000, basePriceCalle13: 500000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 4, monthName: 'Mayo', basePrice: 550000, basePriceCalle5: 570000, basePriceCalle13: 520000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 5, monthName: 'Junio', basePrice: 550000, basePriceCalle5: 570000, basePriceCalle13: 520000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 6, monthName: 'Julio', basePrice: 580000, basePriceCalle5: 600000, basePriceCalle13: 550000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 7, monthName: 'Agosto', basePrice: 580000, basePriceCalle5: 600000, basePriceCalle13: 550000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 8, monthName: 'Septiembre', basePrice: 600000, basePriceCalle5: 600000, basePriceCalle13: 550000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 9, monthName: 'Octubre', basePrice: 620000, basePriceCalle5: 620000, basePriceCalle13: 570000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 10, monthName: 'Noviembre', basePrice: 640000, basePriceCalle5: 640000, basePriceCalle13: 590000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
  { monthIndex: 11, monthName: 'Diciembre', basePrice: 660000, basePriceCalle5: 660000, basePriceCalle13: 610000, additionalsCalle5: INITIAL_CALLE5_ADDITIONALS, additionalsCalle13: INITIAL_CALLE13_ADDITIONALS },
];

export const INITIAL_PRICING_SETTINGS: PricingSettings = {
  fitness: {
    onceAWeek: 32000,
    twiceAWeek: 52000,
  },
  daycare: {
    options: INITIAL_DAYCARE_OPTIONS,
    dailyRates: INITIAL_DAYCARE_DAILY_RATES,
  },
  birthdays: {
    depositAmount: 100000,
    monthlyBasePrices: INITIAL_BIRTHDAY_MONTHS,
    additionals: INITIAL_BIRTHDAY_ADDITIONALS,
  },
  updatedAt: new Date().toISOString(),
};

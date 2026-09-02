export type UserRole = 'superadmin' | 'admin' | 'franquista' | 'web_user';

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Branch {
  id: string; // e.g. "calle-5", "calle-13"
  name: string; // "El Galpón Calle 5"
  address: string; // "Calle 5 e/ 58 y 59"
  city: string; // "La Plata"
  phone: string; // "+54 9 221 610-5296"
  whatsappNumber: string; // "5492216105296"
  franquistaUserId?: string;
  franquistaName?: string;
  franquistaEmail?: string;
  isActive: boolean;
  color?: string;
  createdAt: string;
}

export interface AppUser {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  password?: string;
  role: UserRole;
  assignedBranchId?: string; // required if role === 'franquista'
  assignedBranchName?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LiabilityWaiver {
  id: string;
  reservationId: string;
  signedAt: string; // ISO date string
  
  // Titular / Adulto Responsable
  signerFullName: string;
  signerDni: string;
  signerPhone: string;
  signerEmail: string;
  signerAddress: string;
  relationship: 'madre' | 'padre' | 'tutor' | 'familiar' | 'otro';
  relationshipDetail?: string;

  // Datos del Agasajado / Menores
  childFullName: string;
  childAge: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalInsurance?: string; // Obra Social / Prepaga
  medicalConditions?: string; // Alergias, asma, medicación, observaciones

  // Cláusulas Aceptadas
  acceptedRules: boolean; // Reglamento interno, uso de calzado e indumentaria
  acceptedPhysicalFitness: boolean; // Aptitud física para juegos deportivos y de altura
  acceptedRiskAssumption: boolean; // Asunción de riesgos inherentes al juego deportivo
  acceptedMedicalEmergencyAuth: boolean; // Autorización de primeros auxilios y emergencia médica
  acceptedTermsAndConditions?: boolean; // Aceptación explícita de términos y condiciones en la 3ra pantalla
  
  // Firma Digital
  signatureDataUrl: string; // Canvas base64 data url
  status: 'signed' | 'pending';
  deviceInfo?: string;
}

export interface Reservation {
  id: string;
  branchId: string; // "calle-5" | "calle-13"
  branchName: string;
  createdAt: string;
  date: string; // YYYY-MM-DD
  monthKey?: string; // YYYY-MM for fast monthly aggregation
  slotId: string;
  slotTime: string; // e.g. "15:00 a 17:30 hs"
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  childName: string;
  childAge: number;
  estimatedKids: number;
  status: ReservationStatus;
  depositPaid: boolean;
  depositAmount: number;
  totalPrice?: number;
  notes?: string;
  additionalPackage: 'base_20' | 'adicional_21_28' | 'adicional_29_35';
  adultsFoodInfo?: string;
  createdByRole?: UserRole;
  
  // Liability Waiver Integration
  waiverStatus?: 'pending' | 'signed';
  liabilityWaiver?: LiabilityWaiver;
}

export interface Inquiry {
  id: string;
  branchId: string;
  branchName: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  topic: 'cumpleanos' | 'talleres' | 'por_un_dia' | 'general';
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  title: string;
  timeRange: string;
  description: string;
}

export interface BlockedDate {
  id?: string;
  branchId?: string; // specific to branch or 'all'
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface FaqItem {
  id: string;
  numberTag: string;
  question: string;
  answer: string;
  category: 'cumpleanos' | 'talleres' | 'por_un_dia';
  highlight?: string;
}

export interface WorkshopProgram {
  id: string;
  title: string;
  subtitle: string;
  ageRange: string;
  schedule: string;
  description: string;
  highlights: string[];
  color: 'cyan' | 'pink' | 'yellow' | 'lime';
  iconName: string;
}

export interface AttractionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  staffSupervised: boolean;
}

export interface ReviewItem {
  id: string;
  author: string;
  event: string;
  comment: string;
  rating: number;
}

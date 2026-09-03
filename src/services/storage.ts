import { Reservation, BlockedDate, Branch, AppUser, Inquiry, UserRole, LiabilityWaiver } from '../types';
import { 
  INITIAL_RESERVATIONS, 
  INITIAL_BLOCKED_DATES, 
  INITIAL_BRANCHES, 
  INITIAL_USERS, 
  INITIAL_INQUIRIES 
} from '../data/initialData';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';

const RESERVATIONS_KEY = 'up_galpon_reservations_v3';
const BLOCKED_DATES_KEY = 'up_galpon_blocked_dates_v3';
const BRANCHES_KEY = 'up_galpon_branches_v3';
const USERS_KEY = 'up_galpon_users_v3';
const INQUIRIES_KEY = 'up_galpon_inquiries_v3';
const AUTH_USER_KEY = 'up_galpon_auth_user_v3';

// Helper to remove any undefined fields before Firestore operations
const sanitizeForFirestore = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Normalize branch identifiers across forms, database and user roles
export const normalizeBranchId = (idOrName?: string): string => {
  if (!idOrName) return 'calle-5';
  const clean = String(idOrName).toLowerCase().trim();
  if (clean === 'calle-5' || clean === 'calle 5' || clean === 'calle5' || clean.includes('calle 5') || clean.includes('calle-5') || clean.includes('5')) {
    if (!clean.includes('13')) return 'calle-5';
  }
  if (clean === 'calle-13' || clean === 'calle 13' || clean === 'calle13' || clean.includes('calle 13') || clean.includes('calle-13') || clean.includes('13')) {
    return 'calle-13';
  }
  return clean;
};

// Robust parser to ensure all bookings from Firestore map properly
export const parseReservationFromFirestore = (d: any): Reservation => {
  const data = (d && typeof d.data === 'function' ? d.data() : d || {}) as Record<string, any>;
  const rawId = data.id || (d && d.id) || `res_${Date.now().toString(36)}`;
  const branchId = normalizeBranchId(data.branchId || (data.branch && data.branch.id) || (data.branchName && data.branchName.includes('13') ? 'calle-13' : 'calle-5'));
  const branchName = data.branchName || (branchId === 'calle-13' ? 'El Galpón Calle 13' : 'El Galpón Calle 5');
  const date = data.date || new Date().toISOString().split('T')[0];

  return {
    ...data,
    id: rawId,
    branchId,
    branchName,
    date,
    monthKey: data.monthKey || date.substring(0, 7),
    slotId: data.slotId || 'turn_afternoon_1',
    slotTime: data.slotTime || '15:00 a 17:30 hs',
    parentName: data.parentName || data.name || 'Cliente',
    parentPhone: data.parentPhone || data.phone || '',
    parentEmail: data.parentEmail || data.email || '',
    childName: data.childName || 'Cumpleañer@',
    childAge: Number(data.childAge) || 6,
    estimatedKids: Number(data.estimatedKids) || 0,
    status: data.status || 'pending',
    depositPaid: Boolean(data.depositPaid),
    depositAmount: Number(data.depositAmount) || 0,
    waiverStatus: data.waiverStatus || 'pending',
    createdAt: data.createdAt || new Date().toISOString(),
    notes: data.notes || '',
    additionalPackage: data.additionalPackage || 'base_20',
    adultsFoodInfo: data.adultsFoodInfo || '',
  } as Reservation;
};

// -------------------------------------------------------------
// BRANCHES (SUCURSALES) MANAGEMENT
// -------------------------------------------------------------
export const getBranches = (): Branch[] => {
  try {
    const data = localStorage.getItem(BRANCHES_KEY);
    if (!data) {
      localStorage.setItem(BRANCHES_KEY, JSON.stringify(INITIAL_BRANCHES));
      return INITIAL_BRANCHES;
    }
    const list: Branch[] = JSON.parse(data);
    const updated = list.map((b) => {
      if (b.whatsappNumber === '5492215731047' || b.whatsappNumber === '5492214893221' || !b.whatsappNumber) {
        return { ...b, phone: '221 610-5296', whatsappNumber: '5492216105296' };
      }
      return b;
    });
    return updated;
  } catch {
    return INITIAL_BRANCHES;
  }
};

export const saveBranches = (branches: Branch[]): void => {
  localStorage.setItem(BRANCHES_KEY, JSON.stringify(branches));
};

export const addBranch = async (branchData: Omit<Branch, 'id' | 'createdAt'>): Promise<Branch> => {
  const current = getBranches();
  const branchId = `branch_${Date.now().toString(36)}`;
  const newBranch: Branch = {
    ...branchData,
    id: branchId,
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, newBranch];
  saveBranches(updated);

  // Sync to Firestore in background without blocking UI
  try {
    const branchRef = doc(db, 'branches', branchId);
    setDoc(branchRef, sanitizeForFirestore(newBranch)).catch((e) => console.warn('Firestore branch sync:', e));
  } catch (err) {
    console.warn('Firestore branch sync error:', err);
  }

  return newBranch;
};

export const updateBranch = async (id: string, branchData: Partial<Branch>): Promise<Branch[]> => {
  const current = getBranches();
  const updated = current.map((b) => (b.id === id ? { ...b, ...branchData } : b));
  saveBranches(updated);

  try {
    const branchRef = doc(db, 'branches', id);
    updateDoc(branchRef, sanitizeForFirestore(branchData)).catch((e) => console.warn('Firestore update:', e));
  } catch (err) {
    console.warn('Firestore branch update error:', err);
  }

  return updated;
};

export const deleteBranch = async (id: string): Promise<Branch[]> => {
  const current = getBranches();
  const updated = current.filter((b) => b.id !== id);
  saveBranches(updated);

  try {
    const branchRef = doc(db, 'branches', id);
    deleteDoc(branchRef).catch((e) => console.warn('Firestore delete:', e));
  } catch (err) {
    console.warn('Firestore branch delete error:', err);
  }

  return updated;
};

// -------------------------------------------------------------
// USERS & RBAC ROLES (SuperAdmin, Admin, Franquistas)
// -------------------------------------------------------------
export const getAppUsers = (): AppUser[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
};

export const saveAppUsers = (users: AppUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const addAppUser = async (userData: Omit<AppUser, 'uid' | 'createdAt'>): Promise<AppUser> => {
  const current = getAppUsers();
  const uid = `usr_${Date.now().toString(36)}`;
  const newUser: AppUser = {
    ...userData,
    uid,
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, newUser];
  saveAppUsers(updated);

  try {
    const userRef = doc(db, 'users', uid);
    setDoc(userRef, sanitizeForFirestore(newUser)).catch((e) => console.warn('Firestore user sync:', e));
  } catch (err) {
    console.warn('Firestore user sync error:', err);
  }

  return newUser;
};

export const updateAppUser = async (uid: string, userData: Partial<AppUser>): Promise<AppUser[]> => {
  const current = getAppUsers();
  const updated = current.map((u) => (u.uid === uid ? { ...u, ...userData } : u));
  saveAppUsers(updated);

  try {
    const userRef = doc(db, 'users', uid);
    updateDoc(userRef, sanitizeForFirestore(userData)).catch((e) => console.warn('Firestore user update:', e));
  } catch (err) {
    console.warn('Firestore user update error:', err);
  }

  return updated;
};

export const deleteAppUser = async (uid: string): Promise<AppUser[]> => {
  const current = getAppUsers();
  const updated = current.filter((u) => u.uid !== uid);
  saveAppUsers(updated);

  try {
    const userRef = doc(db, 'users', uid);
    deleteDoc(userRef).catch((e) => console.warn('Firestore user delete:', e));
  } catch (err) {
    console.warn('Firestore user delete error:', err);
  }

  return updated;
};

// -------------------------------------------------------------
// AUTHENTICATION & CURRENT SESSION WITH ROLES
// -------------------------------------------------------------
export const getCurrentUser = (): AppUser | null => {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: AppUser | null): void => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const isAdminAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return !!user && (user.role === 'superadmin' || user.role === 'admin' || user.role === 'franquista');
};

export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
};

// -------------------------------------------------------------
// RESERVATIONS (RESERVAS) MANAGEMENT
// -------------------------------------------------------------
export const resetToDemoReservations = (): Reservation[] => {
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(INITIAL_RESERVATIONS));
  return INITIAL_RESERVATIONS;
};

export const getReservations = (filterBranchId?: string): Reservation[] => {
  try {
    const data = localStorage.getItem(RESERVATIONS_KEY);
    let list: Reservation[] = INITIAL_RESERVATIONS;
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        list = parsed;
      } else {
        list = INITIAL_RESERVATIONS;
        localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(INITIAL_RESERVATIONS));
      }
    } else {
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(INITIAL_RESERVATIONS));
    }
    if (filterBranchId && filterBranchId !== 'all') {
      return list.filter((r) => r.branchId === filterBranchId);
    }
    return list;
  } catch {
    return INITIAL_RESERVATIONS;
  }
};

export const getReservationById = (id: string): Reservation | null => {
  const list = getReservations();
  return list.find((r) => r.id === id) || null;
};

export const fetchReservationByIdAsync = async (id: string): Promise<Reservation | null> => {
  // 1. Try local storage first
  const local = getReservationById(id);
  if (local) return local;

  // 2. Try Firestore remote database
  try {
    const docRef = doc(db, 'bookings', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Reservation;
      const current = getReservations();
      if (!current.some((r) => r.id === data.id)) {
        saveReservations([data, ...current]);
      }
      return data;
    }
  } catch (err) {
    console.warn('Firestore fetch reservation notice:', err);
  }

  return null;
};

export const saveReservations = (reservations: Reservation[]): void => {
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  window.dispatchEvent(new Event('storageUpdate'));
};

export const addReservation = async (
  reservation: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'depositPaid' | 'depositAmount' | 'monthKey'>
): Promise<Reservation> => {
  const current = getReservations();
  const id = `res_${Date.now().toString(36)}`;
  const monthKey = reservation.date.substring(0, 7); // YYYY-MM

  const newReservation: Reservation = {
    ...reservation,
    id,
    monthKey,
    createdAt: new Date().toISOString(),
    status: 'pending',
    depositPaid: false,
    depositAmount: 0,
    waiverStatus: 'pending',
  };
  const updated = [newReservation, ...current];
  saveReservations(updated);

  // Sync to Firestore asynchronously in background (never blocks UI)
  try {
    const resRef = doc(db, 'bookings', id);
    const sanitized = sanitizeForFirestore(newReservation);
    setDoc(resRef, sanitized).catch((err) => {
      console.warn('Firestore booking background sync notice:', err);
    });
  } catch (err) {
    console.warn('Firestore booking sync notice:', err);
  }

  return newReservation;
};

export const updateReservationStatus = async (
  id: string,
  status: Reservation['status'],
  depositPaid?: boolean,
  depositAmount?: number
): Promise<Reservation[]> => {
  const current = getReservations();
  let updatedItem: Reservation | null = null;

  const updated = current.map((r) => {
    if (r.id === id) {
      updatedItem = {
        ...r,
        status,
        depositPaid: depositPaid !== undefined ? depositPaid : r.depositPaid,
        depositAmount: depositAmount !== undefined ? depositAmount : (status === 'approved' ? 100000 : r.depositAmount),
        waiverStatus: r.waiverStatus || 'pending',
      };
      return updatedItem;
    }
    return r;
  });
  saveReservations(updated);

  if (updatedItem) {
    try {
      const resRef = doc(db, 'bookings', id);
      const updates = sanitizeForFirestore({
        status,
        depositPaid: (updatedItem as Reservation).depositPaid,
        depositAmount: (updatedItem as Reservation).depositAmount,
        waiverStatus: (updatedItem as Reservation).waiverStatus || 'pending',
      });
      updateDoc(resRef, updates).catch((e) => console.warn('Firestore update:', e));
    } catch (err) {
      console.warn('Firestore booking update notice:', err);
    }
  }

  return updated;
};

export const updateReservation = async (
  id: string,
  updatedFields: Partial<Reservation>
): Promise<Reservation[]> => {
  const current = getReservations();
  let updatedItem: Reservation | null = null;

  const updated = current.map((r) => {
    if (r.id === id) {
      const monthKey = updatedFields.date ? updatedFields.date.substring(0, 7) : r.monthKey;
      updatedItem = {
        ...r,
        ...updatedFields,
        monthKey,
      };
      return updatedItem;
    }
    return r;
  });
  saveReservations(updated);

  if (updatedItem) {
    try {
      const resRef = doc(db, 'bookings', id);
      const updates = sanitizeForFirestore(updatedFields);
      updateDoc(resRef, updates).catch((e) => console.warn('Firestore update:', e));
    } catch (err) {
      console.warn('Firestore booking update notice:', err);
    }
  }

  return updated;
};

export const deleteReservation = async (id: string): Promise<Reservation[]> => {
  const current = getReservations();
  const updated = current.filter((r) => r.id !== id);
  saveReservations(updated);

  try {
    const resRef = doc(db, 'bookings', id);
    deleteDoc(resRef).catch((e) => console.warn('Firestore delete:', e));
  } catch (err) {
    console.warn('Firestore booking delete error:', err);
  }

  return updated;
};

// -------------------------------------------------------------
// DATE FORMATTING HELPERS (dd/mm/aaaa)
// -------------------------------------------------------------
export const formatDateDDMMAAAA = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const formatDateWithWeekday = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    const weekday = dateObj.toLocaleDateString('es-AR', { weekday: 'short' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '');
    const day = String(d).padStart(2, '0');
    const month = String(m).padStart(2, '0');
    return `${capitalizedWeekday} ${day}/${month}/${y}`;
  } catch {
    return formatDateDDMMAAAA(dateStr);
  }
};

// -------------------------------------------------------------
// LIABILITY WAIVER (DESLIGAMIENTO DE RESPONSABILIDAD)
// -------------------------------------------------------------
export const saveLiabilityWaiver = async (
  reservationId: string,
  waiver: LiabilityWaiver
): Promise<Reservation | null> => {
  const current = getReservations();
  let targetReservation: Reservation | null = current.find((r) => r.id === reservationId) || null;

  if (!targetReservation) {
    targetReservation = await fetchReservationByIdAsync(reservationId);
  }

  const updatedReservation: Reservation = {
    ...(targetReservation || {
      id: reservationId,
      branchId: 'calle-5',
      branchName: 'El Galpón',
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      slotId: 't1',
      slotTime: '15:00 a 17:30 hs',
      parentName: waiver.signerFullName,
      parentPhone: waiver.signerPhone,
      parentEmail: waiver.signerEmail,
      childName: waiver.childFullName,
      childAge: waiver.childAge,
      estimatedKids: 20,
      status: 'approved',
      depositPaid: true,
      depositAmount: 50000,
      additionalPackage: 'base_20',
    }),
    waiverStatus: 'signed',
    liabilityWaiver: waiver,
  };

  const updatedList = [
    updatedReservation,
    ...current.filter((r) => r.id !== reservationId),
  ];
  saveReservations(updatedList);

  // Sync to Firestore 'bookings' and 'waivers' collections
  try {
    const resRef = doc(db, 'bookings', reservationId);
    setDoc(
      resRef,
      sanitizeForFirestore({
        ...updatedReservation,
        waiverStatus: 'signed',
        liabilityWaiver: waiver,
      }),
      { merge: true }
    ).catch((e) => console.warn('Firestore booking waiver update notice:', e));

    const waiverRef = doc(db, 'waivers', waiver.id || reservationId);
    setDoc(waiverRef, sanitizeForFirestore(waiver)).catch((e) =>
      console.warn('Firestore waiver collection notice:', e)
    );
  } catch (err) {
    console.warn('Firestore waiver notice:', err);
  }

  return updatedReservation;
};

export const formatWhatsAppNumber = (phoneStr: string): string => {
  let clean = phoneStr.replace(/\D/g, '');
  if (clean.startsWith('549')) return clean;
  if (clean.startsWith('54')) return `549${clean.slice(2)}`;
  if (clean.startsWith('0')) clean = clean.slice(1);
  if (clean.startsWith('15')) clean = clean.slice(2);
  return `549${clean}`;
};

export const generateWaiverShareLink = (reservationId: string): string => {
  try {
    const origin = window.location.origin;
    let pathname = window.location.pathname;
    
    // Remove any trailing index.html
    pathname = pathname.replace(/\/index\.html$/, '');
    if (!pathname.endsWith('/')) {
      pathname = pathname + '/';
    }

    return `${origin}${pathname}?waiver=${encodeURIComponent(reservationId)}`;
  } catch (e) {
    return `${window.location.href}?waiver=${encodeURIComponent(reservationId)}`;
  }
};

export const generateWaiverWhatsAppMessage = (reservation: Reservation): string => {
  const waiverUrl = generateWaiverShareLink(reservation.id);
  const cleanPhone = formatWhatsAppNumber(reservation.parentPhone);
  const formattedDate = formatDateDDMMAAAA(reservation.date);
  
  const text = `¡Hola ${reservation.parentName}! 👋 Confirmamos con éxito la recepción del pedido de reserva para el cumpleaños de *${reservation.childName}* el día *${formattedDate}* (${reservation.slotTime}) en *${reservation.branchName}* 🎪🎉.\n\nPara completar la habilitación del evento, por favor ingresá al siguiente enlace para leer y aceptar los *Términos y Condiciones de la Reserva*:\n\n👉 ${waiverUrl}\n\nQuedamos a disposición para cualquier consulta. ¡Nos vemos pronto para festejar! 🎈`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
};

export const generateDepositRequestWhatsAppMessage = (
  reservation: Reservation,
  bankAlias: string = 'ELGALPON.FESTEJOS',
  bankCbu: string = '0070123430004567890123',
  depositAmount: number = 100000
): string => {
  const cleanPhone = formatWhatsAppNumber(reservation.parentPhone);
  const formattedDate = formatDateDDMMAAAA(reservation.date);
  
  const text = `¡Hola *${reservation.parentName}*! 👋\n\nTe confirmamos la *recepción de tu pedido de reserva* para el cumpleaños de *${reservation.childName}* (${reservation.childAge} años) en *${reservation.branchName}* 🎪🎉:\n\n📅 *Fecha:* ${formattedDate}\n⏰ *Turno:* ${reservation.slotTime}\n👥 *Chicos estimados:* ${reservation.estimatedKids} invitados\n\nPara confirmar definitivamente la fecha en el calendario y reservar el salón en exclusividad, se debe realizar una seña de *$${depositAmount.toLocaleString('es-AR')}*:\n\n🏦 *DATOS PARA LA TRANSFERENCIA:*\n• *Titular:* El Galpón Recreativo S.R.L.\n• *Alias:* ${bankAlias}\n• *CBU:* ${bankCbu}\n• *Monto Seña:* $${depositAmount.toLocaleString('es-AR')}\n\n⚠️ *IMPORTANTE:* Una vez realizada la transferencia, *por favor envíanos el comprobante por este mismo chat de WhatsApp* para registrar la confirmación en el sistema y remitirte el formulario de habilitación/deslinde.\n\n¡Muchas gracias! Quedamos a la espera de tu comprobante. 🎈`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
};

// -------------------------------------------------------------
// INQUIRIES (CONSULTAS WEB) MANAGEMENT
// -------------------------------------------------------------
export const getInquiries = (): Inquiry[] => {
  try {
    const data = localStorage.getItem(INQUIRIES_KEY);
    if (!data) {
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(INITIAL_INQUIRIES));
      return INITIAL_INQUIRIES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_INQUIRIES;
  }
};

export const saveInquiries = (inquiries: Inquiry[]): void => {
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
};

export const addInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> => {
  const current = getInquiries();
  const id = `inq_${Date.now().toString(36)}`;
  const newInquiry: Inquiry = {
    ...inquiryData,
    id,
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  const updated = [newInquiry, ...current];
  saveInquiries(updated);

  try {
    const inqRef = doc(db, 'inquiries', id);
    setDoc(inqRef, sanitizeForFirestore(newInquiry)).catch((e) => console.warn('Firestore inquiry notice:', e));
  } catch (err) {
    console.warn('Firestore inquiry error:', err);
  }

  return newInquiry;
};

export const updateInquiryStatus = async (id: string, status: Inquiry['status']): Promise<Inquiry[]> => {
  const current = getInquiries();
  const updated = current.map((i) => (i.id === id ? { ...i, status } : i));
  saveInquiries(updated);

  try {
    const inqRef = doc(db, 'inquiries', id);
    updateDoc(inqRef, { status }).catch((e) => console.warn('Firestore inq status update:', e));
  } catch (err) {
    console.warn('Firestore inq status error:', err);
  }

  return updated;
};

// -------------------------------------------------------------
// BLOCKED DATES (BLOQUEO DE FECHAS) MANAGEMENT
// -------------------------------------------------------------
export const getBlockedDates = (branchId?: string): BlockedDate[] => {
  try {
    const data = localStorage.getItem(BLOCKED_DATES_KEY);
    let list: BlockedDate[] = INITIAL_BLOCKED_DATES;
    if (data) {
      list = JSON.parse(data);
    } else {
      localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(INITIAL_BLOCKED_DATES));
    }
    if (branchId && branchId !== 'all') {
      return list.filter((b) => !b.branchId || b.branchId === branchId || b.branchId === 'all');
    }
    return list;
  } catch {
    return INITIAL_BLOCKED_DATES;
  }
};

export const toggleBlockDate = (
  date: string, 
  reason: string = 'Fecha no disponible',
  branchId: string = 'all'
): BlockedDate[] => {
  const current = getBlockedDates();
  const exists = current.some((b) => b.date === date && (!b.branchId || b.branchId === branchId));
  let updated: BlockedDate[];
  if (exists) {
    updated = current.filter((b) => !(b.date === date && (!b.branchId || b.branchId === branchId)));
  } else {
    updated = [...current, { date, reason, branchId }];
  }
  localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(updated));
  return updated;
};

// -------------------------------------------------------------
// FIRESTORE INITIAL SYNC HELPER (Loads remote data if online)
// -------------------------------------------------------------
export const syncWithRemoteFirestore = async (): Promise<void> => {
  try {
    // 1. Sync Branches
    const branchesSnapshot = await getDocs(collection(db, 'branches'));
    if (!branchesSnapshot.empty) {
      const remoteBranches: Branch[] = [];
      branchesSnapshot.forEach((d) => remoteBranches.push(d.data() as Branch));
      if (remoteBranches.length > 0) {
        const localBranches = getBranches();
        const mergedBranchesMap = new Map<string, Branch>();
        localBranches.forEach(b => mergedBranchesMap.set(b.id, b));
        remoteBranches.forEach(b => mergedBranchesMap.set(b.id, b));
        saveBranches(Array.from(mergedBranchesMap.values()));
      }
    } else {
      // Seed initial branches to Firestore
      const initial = getBranches();
      for (const b of initial) {
        setDoc(doc(db, 'branches', b.id), sanitizeForFirestore(b)).catch(() => {});
      }
    }

    // 2. Sync App Users (SuperAdmin, Admin, Franquistas)
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (!usersSnapshot.empty) {
      const remoteUsers: AppUser[] = [];
      usersSnapshot.forEach((d) => remoteUsers.push(d.data() as AppUser));
      if (remoteUsers.length > 0) {
        const localUsers = getAppUsers();
        const userMap = new Map<string, AppUser>();
        localUsers.forEach(u => userMap.set(u.uid, u));
        remoteUsers.forEach(u => userMap.set(u.uid, u));
        saveAppUsers(Array.from(userMap.values()));
      }
    } else {
      // First time: Seed initial admin & superadmin users to Firestore collection 'users'
      const initialUsers = getAppUsers();
      for (const user of initialUsers) {
        setDoc(doc(db, 'users', user.uid), sanitizeForFirestore(user)).catch(() => {});
      }
    }

    // 3. Sync Bookings / Reservas
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const remoteBookings: Reservation[] = [];
    if (!bookingsSnapshot.empty) {
      bookingsSnapshot.forEach((d) => {
        remoteBookings.push(parseReservationFromFirestore(d));
      });
    }

    const localBookings = getReservations();
    const bookingMap = new Map<string, Reservation>();
    localBookings.forEach((b) => bookingMap.set(b.id, b));
    remoteBookings.forEach((b) => bookingMap.set(b.id, b));

    const mergedBookings = Array.from(bookingMap.values()).sort(
      (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );
    saveReservations(mergedBookings);

    // 4. Sync Inquiries / Consultas Web
    const inquiriesSnapshot = await getDocs(collection(db, 'inquiries'));
    if (!inquiriesSnapshot.empty) {
      const remoteInquiries: Inquiry[] = [];
      inquiriesSnapshot.forEach((d) => {
        const data = d.data() as Inquiry;
        remoteInquiries.push({ ...data, id: data.id || d.id });
      });
      const localInquiries = getInquiries();
      const inqMap = new Map<string, Inquiry>();
      localInquiries.forEach((i) => inqMap.set(i.id, i));
      remoteInquiries.forEach((i) => inqMap.set(i.id, i));
      saveInquiries(Array.from(inqMap.values()));
    }
  } catch (e) {
    console.warn('Firestore sync notice (running on local storage):', e);
  }
};

// -------------------------------------------------------------
// FIRESTORE REAL-TIME SUBSCRIPTIONS
// -------------------------------------------------------------
export const listenToFirestoreBookings = (onUpdate?: (bookings: Reservation[]) => void) => {
  try {
    const unsub = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const remoteBookings: Reservation[] = [];
        snapshot.forEach((d) => {
          remoteBookings.push(parseReservationFromFirestore(d));
        });

        const localBookings = getReservations();
        const bookingMap = new Map<string, Reservation>();
        localBookings.forEach((b) => bookingMap.set(b.id, b));
        remoteBookings.forEach((b) => bookingMap.set(b.id, b));

        const merged = Array.from(bookingMap.values()).sort(
          (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        );
        saveReservations(merged);
        if (onUpdate) onUpdate(merged);
      },
      (err) => {
        console.warn('Firestore onSnapshot error on bookings:', err);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('Firestore listen bookings init notice:', err);
    return () => {};
  }
};

// -------------------------------------------------------------
// BACKUP & RESTORE UTILITIES (SUPER ADMIN)
// -------------------------------------------------------------
export interface BackupData {
  version: string;
  timestamp: string;
  dateFormatted: string;
  reservationsCount: number;
  inquiriesCount: number;
  branchesCount: number;
  usersCount: number;
  reservations: Reservation[];
  inquiries: Inquiry[];
  branches: Branch[];
  appUsers: AppUser[];
}

export const generateCompleteBackup = (): BackupData => {
  const reservations = getReservations();
  const inquiries = getInquiries();
  const branches = getBranches();
  const appUsers = getAppUsers();
  const now = new Date();

  return {
    version: '1.0',
    timestamp: now.toISOString(),
    dateFormatted: now.toLocaleDateString('es-AR') + ' ' + now.toLocaleTimeString('es-AR'),
    reservationsCount: reservations.length,
    inquiriesCount: inquiries.length,
    branchesCount: branches.length,
    usersCount: appUsers.length,
    reservations,
    inquiries,
    branches,
    appUsers,
  };
};

export const downloadBackupAsJSON = () => {
  const backup = generateCompleteBackup();
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(backup, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `backup_elgalpon_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  
  // Guardar fecha del último backup realizado
  localStorage.setItem('elgalpon_last_backup_date', new Date().toISOString());
};

export const getLastBackupDate = (): string | null => {
  return localStorage.getItem('elgalpon_last_backup_date');
};


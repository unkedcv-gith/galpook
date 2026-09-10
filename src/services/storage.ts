import { Reservation, BlockedDate, Branch, AppUser, Inquiry, UserRole, LiabilityWaiver, PricingSettings, BirthdayAdditionalPrice, BirthdayMonthPrice, CalendarBlock, CalendarBlockType } from '../types';
import { 
  INITIAL_RESERVATIONS, 
  INITIAL_BLOCKED_DATES, 
  INITIAL_BRANCHES, 
  INITIAL_USERS, 
  INITIAL_INQUIRIES,
  INITIAL_PRICING_SETTINGS,
  DEFAULT_BANK_INFO
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
const CALENDAR_BLOCKS_KEY = 'up_galpon_calendar_blocks_v3';
const BRANCHES_KEY = 'up_galpon_branches_v3';
const USERS_KEY = 'up_galpon_users_v3';
const INQUIRIES_KEY = 'up_galpon_inquiries_v3';
const AUTH_USER_KEY = 'up_galpon_auth_user_v3';
const PRICING_KEY = 'salongalpon_pricing_settings_v1';

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
    parentName: data.parentName || data.name || (data.liabilityWaiver && data.liabilityWaiver.signerFullName) || 'Cliente',
    parentPhone: data.parentPhone || data.phone || (data.liabilityWaiver && data.liabilityWaiver.signerPhone) || '',
    parentEmail: data.parentEmail || data.email || (data.liabilityWaiver && data.liabilityWaiver.signerEmail) || '',
    childName: data.childName || (data.liabilityWaiver && data.liabilityWaiver.childFullName) || 'Cumpleañer@',
    childAge: Number(data.childAge) || (data.liabilityWaiver && Number(data.liabilityWaiver.childAge)) || 6,
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
      const mod = { ...b };
      if (mod.id === 'calle-5' || mod.name.toLowerCase().includes('5')) {
        if (mod.address.includes('58') || mod.address.includes('59') || !mod.address) {
          mod.address = 'Calle 5 e/ 34 y 35';
        }
      }
      if (mod.id === 'calle-13' || mod.name.toLowerCase().includes('13')) {
        if (mod.address.includes('45') || mod.address.includes('46') || !mod.address) {
          mod.address = 'Calle 13 e/ 530 y 531';
        }
      }
      if (b.whatsappNumber === '5492216105296' || b.whatsappNumber === '5492214893221' || !b.whatsappNumber) {
        mod.phone = '221 573-1047';
        mod.whatsappNumber = '5492215731047';
      }
      return mod;
    });
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(updated));
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
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_SECURITY_KEY = 'up_galpon_login_security_v1';

interface LoginSecurityState {
  clientFailedCount: number;
  cooldownUntil: number; // timestamp ms
}

export const getLoginSecurityState = (): { isThrottled: boolean; cooldownSeconds: number } => {
  try {
    const raw = localStorage.getItem(LOGIN_SECURITY_KEY);
    if (!raw) return { isThrottled: false, cooldownSeconds: 0 };
    const parsed: LoginSecurityState = JSON.parse(raw);
    const now = Date.now();
    if (parsed.cooldownUntil && parsed.cooldownUntil > now) {
      return {
        isThrottled: true,
        cooldownSeconds: Math.ceil((parsed.cooldownUntil - now) / 1000),
      };
    }
    return { isThrottled: false, cooldownSeconds: 0 };
  } catch {
    return { isThrottled: false, cooldownSeconds: 0 };
  }
};

export const recordClientFailedAttempt = (): { isThrottled: boolean; cooldownSeconds: number; clientAttempts: number } => {
  try {
    let state: LoginSecurityState = { clientFailedCount: 0, cooldownUntil: 0 };
    const raw = localStorage.getItem(LOGIN_SECURITY_KEY);
    if (raw) {
      state = JSON.parse(raw);
    }
    state.clientFailedCount = (state.clientFailedCount || 0) + 1;
    const now = Date.now();

    // Progressive cooldown against brute force attacks:
    // 3 failed attempts: 15 seconds cooldown
    // 4 failed attempts: 30 seconds cooldown
    // >= 5 failed attempts: 60 seconds cooldown
    let cooldownMs = 0;
    if (state.clientFailedCount >= 5) {
      cooldownMs = 60 * 1000;
    } else if (state.clientFailedCount >= 4) {
      cooldownMs = 30 * 1000;
    } else if (state.clientFailedCount >= 3) {
      cooldownMs = 15 * 1000;
    }

    if (cooldownMs > 0) {
      state.cooldownUntil = now + cooldownMs;
    }

    localStorage.setItem(LOGIN_SECURITY_KEY, JSON.stringify(state));

    return {
      isThrottled: cooldownMs > 0,
      cooldownSeconds: Math.ceil(cooldownMs / 1000),
      clientAttempts: state.clientFailedCount,
    };
  } catch {
    return { isThrottled: false, cooldownSeconds: 0, clientAttempts: 1 };
  }
};

export const resetClientLoginSecurity = (): void => {
  localStorage.removeItem(LOGIN_SECURITY_KEY);
};

export const registerFailedUserAttempt = async (
  usernameOrEmail: string
): Promise<{ userFound: boolean; isLocked: boolean; attempts: number; remaining: number; user?: AppUser }> => {
  const clean = usernameOrEmail.trim().toLowerCase();
  const users = getAppUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
  );

  if (!user) {
    return { userFound: false, isLocked: false, attempts: 0, remaining: 0 };
  }

  const newAttempts = (user.failedAttempts || 0) + 1;
  user.failedAttempts = newAttempts;

  if (newAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    user.isLocked = true;
    user.lockedAt = new Date().toISOString();
    user.lockedReason = 'Bloqueado por superar 5 intentos fallidos de inicio de sesión';
  }

  saveAppUsers(users);

  try {
    const userRef = doc(db, 'users', user.uid);
    updateDoc(
      userRef,
      sanitizeForFirestore({
        failedAttempts: user.failedAttempts,
        isLocked: !!user.isLocked,
        lockedAt: user.lockedAt || null,
        lockedReason: user.lockedReason || null,
      })
    ).catch((e) => console.warn('Firestore failed attempt update notice:', e));
  } catch (err) {
    console.warn('Firestore failed attempt update error:', err);
  }

  return {
    userFound: true,
    isLocked: !!user.isLocked,
    attempts: newAttempts,
    remaining: Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - newAttempts),
    user,
  };
};

export const registerSuccessfulUserLogin = async (uid: string): Promise<void> => {
  resetClientLoginSecurity();
  const users = getAppUsers();
  const user = users.find((u) => u.uid === uid);
  if (user && (user.failedAttempts || user.isLocked)) {
    user.failedAttempts = 0;
    saveAppUsers(users);
    try {
      const userRef = doc(db, 'users', uid);
      updateDoc(
        userRef,
        sanitizeForFirestore({
          failedAttempts: 0,
        })
      ).catch((e) => console.warn('Firestore reset login attempts notice:', e));
    } catch (err) {
      console.warn('Firestore reset login attempts error:', err);
    }
  }
};

export const unlockAppUser = async (uid: string): Promise<AppUser | null> => {
  const users = getAppUsers();
  let unlockedUser: AppUser | null = null;
  const updated = users.map((u) => {
    if (u.uid === uid) {
      unlockedUser = {
        ...u,
        isLocked: false,
        failedAttempts: 0,
        lockedAt: undefined,
        lockedReason: undefined,
      };
      return unlockedUser;
    }
    return u;
  });

  if (unlockedUser) {
    saveAppUsers(updated);
    try {
      const userRef = doc(db, 'users', uid);
      updateDoc(
        userRef,
        sanitizeForFirestore({
          isLocked: false,
          failedAttempts: 0,
          lockedAt: null,
          lockedReason: null,
        })
      ).catch((e) => console.warn('Firestore unlock user notice:', e));
    } catch (err) {
      console.warn('Firestore unlock user error:', err);
    }
  }

  return unlockedUser;
};

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
  reservation: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'depositPaid' | 'depositAmount' | 'monthKey'> & {
    status?: Reservation['status'];
    depositPaid?: boolean;
    depositAmount?: number;
  }
): Promise<Reservation> => {
  const current = getReservations();
  const id = `res_${Date.now().toString(36)}`;
  const monthKey = reservation.date.substring(0, 7); // YYYY-MM

  const newReservation: Reservation = {
    status: 'pending',
    depositPaid: false,
    depositAmount: 0,
    waiverStatus: 'pending',
    ...reservation,
    id,
    monthKey,
    createdAt: new Date().toISOString(),
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
        depositAmount: depositAmount !== undefined ? depositAmount : (status === 'approved' ? getPricingSettings().birthdays.depositAmount : r.depositAmount),
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

  const baseReservation: Reservation = targetReservation || {
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
  };

  const updatedReservation: Reservation = {
    ...baseReservation,
    parentName: waiver.signerFullName || baseReservation.parentName || 'Cliente',
    parentPhone: waiver.signerPhone || baseReservation.parentPhone || '',
    parentEmail: waiver.signerEmail || baseReservation.parentEmail || '',
    childName: waiver.childFullName || baseReservation.childName || 'Cumpleañer@',
    childAge: waiver.childAge || baseReservation.childAge || 6,
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

export const getCustomBaseUrl = (): string => {
  try {
    return localStorage.getItem('salongalpon_public_base_url') || '';
  } catch {
    return '';
  }
};

export const setCustomBaseUrl = (url: string): void => {
  try {
    if (url && url.trim()) {
      let clean = url.trim();
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      clean = clean.replace(/\/+$/, '');
      localStorage.setItem('salongalpon_public_base_url', clean);
    } else {
      localStorage.removeItem('salongalpon_public_base_url');
    }
  } catch (e) {
    console.warn('Could not save custom base url', e);
  }
};

export const generateWaiverShareLink = (reservationId: string): string => {
  try {
    const customBase = getCustomBaseUrl();
    if (customBase) {
      return `${customBase}/?waiver=${encodeURIComponent(reservationId)}`;
    }

    const origin = window.location.origin;
    let pathname = window.location.pathname;
    
    // Remove any trailing index.html
    pathname = pathname.replace(/\/index\.html$/, '');
    if (!pathname.endsWith('/')) {
      pathname = pathname + '/';
    }

    return `${origin}${pathname}?waiver=${encodeURIComponent(reservationId)}`;
  } catch (e) {
    let href = window.location.href.split('?')[0].split('#')[0];
    href = href.replace(/\/index\.html$/, '');
    if (!href.endsWith('/')) {
      href = href + '/';
    }
    return `${href}?waiver=${encodeURIComponent(reservationId)}`;
  }
};

export const RESERVATION_EXPIRATION_MINUTES = 40;
export const RESERVATION_EXPIRATION_MS = RESERVATION_EXPIRATION_MINUTES * 60 * 1000;

export const isReservationCircuitCompleted = (reservation: Reservation): boolean => {
  return (
    reservation.status === 'approved' ||
    reservation.depositPaid === true ||
    reservation.waiverStatus === 'signed' ||
    reservation.liabilityWaiver?.status === 'signed'
  );
};

export const isReservationExpired = (reservation: Reservation): boolean => {
  if (reservation.status === 'cancelled' || reservation.status === 'rejected') {
    return true;
  }
  // Once the circuit is completed (approved, deposit paid, or terms signed), it never expires
  if (isReservationCircuitCompleted(reservation)) {
    return false;
  }
  // If terms and conditions have not been sent yet, timer has not started
  if (!reservation.termsSentAt) {
    return false;
  }
  const sentTime = new Date(reservation.termsSentAt).getTime();
  if (isNaN(sentTime)) return false;
  return Date.now() - sentTime > RESERVATION_EXPIRATION_MS;
};

export const getRemainingReservationSeconds = (reservation: Reservation): number => {
  if (isReservationCircuitCompleted(reservation)) return Infinity;
  if (!reservation.termsSentAt) return RESERVATION_EXPIRATION_MINUTES * 60;
  const sentTime = new Date(reservation.termsSentAt).getTime();
  if (isNaN(sentTime)) return RESERVATION_EXPIRATION_MINUTES * 60;
  const diffMs = sentTime + RESERVATION_EXPIRATION_MS - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
};

export const markReservationTermsSent = async (id: string): Promise<Reservation | null> => {
  const current = getReservations();
  let updatedItem: Reservation | null = null;
  const nowIso = new Date().toISOString();

  const updated = current.map((r) => {
    if (r.id === id) {
      updatedItem = {
        ...r,
        termsSentAt: nowIso,
      };
      return updatedItem;
    }
    return r;
  });

  if (updatedItem) {
    saveReservations(updated);
    try {
      const resRef = doc(db, 'bookings', id);
      updateDoc(resRef, sanitizeForFirestore({ termsSentAt: nowIso })).catch((e) =>
        console.warn('Firestore mark termsSentAt notice:', e)
      );
    } catch (err) {
      console.warn('Firestore update termsSentAt error:', err);
    }
  }

  return updatedItem;
};

export const markReservationTermsOpened = async (id: string): Promise<Reservation | null> => {
  const current = getReservations();
  let updatedItem: Reservation | null = null;
  const nowIso = new Date().toISOString();

  const updated = current.map((r) => {
    if (r.id === id) {
      const termsSentAt = r.termsSentAt || nowIso;
      const termsOpenedAt = r.termsOpenedAt || nowIso;
      updatedItem = {
        ...r,
        termsSentAt,
        termsOpenedAt,
      };
      return updatedItem;
    }
    return r;
  });

  if (updatedItem) {
    saveReservations(updated);
    try {
      const resRef = doc(db, 'bookings', id);
      updateDoc(
        resRef,
        sanitizeForFirestore({
          termsSentAt: (updatedItem as Reservation).termsSentAt,
          termsOpenedAt: (updatedItem as Reservation).termsOpenedAt,
        })
      ).catch((e) => console.warn('Firestore mark termsOpenedAt notice:', e));
    } catch (err) {
      console.warn('Firestore update termsOpenedAt error:', err);
    }
  }

  return updatedItem;
};

export const resetReservationExpiration = async (id: string): Promise<Reservation | null> => {
  return markReservationTermsSent(id);
};

export const generateWaiverWhatsAppMessage = (reservation: Reservation): string => {
  const waiverUrl = generateWaiverShareLink(reservation.id);
  const cleanPhone = formatWhatsAppNumber(reservation.parentPhone);
  const formattedDate = formatDateDDMMAAAA(reservation.date);
  
  const text = `¡Hola ${reservation.parentName}! 👋 Confirmamos con éxito la recepción del pedido de reserva para el cumpleaños de *${reservation.childName}* el día *${formattedDate}* (${reservation.slotTime}) en *${reservation.branchName}* 🎪🎉.\n\nPara completar la habilitación del evento, por favor ingresá al siguiente enlace para leer y aceptar los *Términos y Condiciones de la Reserva* (incluye las normas, firma digital y los datos para el envío de la seña):\n\n⚠️ *IMPORTANTE:* a partir de ingresar al formulario tenes 40 minutos para mentener tu día y hora de reserva.\n\n👉 ${waiverUrl}\n\nQuedamos a disposición para cualquier consulta. ¡Nos vemos pronto para festejar! 🎈`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
};

export const generateDepositRequestWhatsAppMessage = (
  reservation: Reservation,
  bankAlias: string = DEFAULT_BANK_INFO.alias,
  bankCbu: string = DEFAULT_BANK_INFO.cbu,
  depositAmount: number = getPricingSettings().birthdays.depositAmount
): string => {
  const cleanPhone = formatWhatsAppNumber(reservation.parentPhone);
  const formattedDate = formatDateDDMMAAAA(reservation.date);
  
  const text = `¡Hola *${reservation.parentName}*! 👋\n\nTe confirmamos la *recepción de tu pedido de reserva* para el cumpleaños de *${reservation.childName}* (${reservation.childAge} años) en *${reservation.branchName}* 🎪🎉:\n\n📅 *Fecha:* ${formattedDate}\n⏰ *Turno:* ${reservation.slotTime}\n👥 *Chicos estimados:* ${reservation.estimatedKids} invitados\n\nPara confirmar definitivamente la fecha en el calendario y reservar el salón en exclusividad, se debe realizar una seña de *$${depositAmount.toLocaleString('es-AR')}*:\n\n❌ *La seña no tiene devolución.*\n\n💳 *DATOS PARA LA TRANSFERENCIA:*\n• *Titular:* ${DEFAULT_BANK_INFO.accountHolder}\n• *Alias:* ${DEFAULT_BANK_INFO.alias}${bankCbu ? `\n• *CBU:* ${bankCbu}` : ''}\n• *Monto Seña:* $${depositAmount.toLocaleString('es-AR')}\n\n⚠️ *IMPORTANTE:* Una vez realizada la transferencia, *por favor envíanos el comprobante por este mismo chat de WhatsApp* para registrar la confirmación en el sistema y remitirte el formulario de habilitación/deslinde.\n\n¡Muchas gracias! Quedamos a la espera de tu comprobante. 🎈`;

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
// BLOCKED DATES & CALENDAR BLOCKS (BLOQUEO DE MESES, PERÍODOS Y DÍAS)
// -------------------------------------------------------------
export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const expandDatesFromRange = (startDate: string, endDate: string): string[] => {
  if (!startDate || !endDate) return [];
  const dates: string[] = [];
  const curr = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  if (isNaN(curr.getTime()) || isNaN(end.getTime()) || curr > end) {
    return [startDate];
  }
  // Cap at max 400 days to prevent runaway loops
  let guard = 0;
  while (curr <= end && guard < 400) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
    guard++;
  }
  return dates;
};

export const expandDatesFromMonth = (year: number, monthIndex: number): string[] => {
  const dates: string[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const m = String(monthIndex + 1).padStart(2, '0');
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    dates.push(`${year}-${m}-${dayStr}`);
  }
  return dates;
};

export const getCalendarBlocks = (filterBranchId?: string): CalendarBlock[] => {
  try {
    const data = localStorage.getItem(CALENDAR_BLOCKS_KEY);
    let list: CalendarBlock[] = [];
    if (data) {
      list = JSON.parse(data);
    } else {
      // Migrate from INITIAL_BLOCKED_DATES or BLOCKED_DATES_KEY if first time
      const legacyData = localStorage.getItem(BLOCKED_DATES_KEY);
      const legacyList = legacyData ? JSON.parse(legacyData) : INITIAL_BLOCKED_DATES;
      list = (Array.isArray(legacyList) ? legacyList : []).map((item: any, idx: number) => ({
        id: item.id || `block_legacy_${idx}_${Date.now().toString(36)}`,
        type: 'single_day' as CalendarBlockType,
        branchId: item.branchId || 'all',
        branchName: item.branchId === 'calle-5' ? 'El Galpón Calle 5' : item.branchId === 'calle-13' ? 'El Galpón Calle 13' : 'Todas las Franquicias',
        date: item.date,
        reason: item.reason || 'Fecha bloqueada',
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem(CALENDAR_BLOCKS_KEY, JSON.stringify(list));
    }

    if (filterBranchId && filterBranchId !== 'all') {
      return list.filter((b) => !b.branchId || b.branchId === filterBranchId || b.branchId === 'all');
    }
    return list;
  } catch {
    return [];
  }
};

export const saveCalendarBlocks = (blocks: CalendarBlock[]): void => {
  localStorage.setItem(CALENDAR_BLOCKS_KEY, JSON.stringify(blocks));
  // Keep legacy BLOCKED_DATES_KEY in sync with expanded dates for backward compatibility
  try {
    const expanded = getBlockedDates();
    localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(expanded));
  } catch (e) {
    console.warn('Sync legacy blocked dates notice:', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('calendarBlocksUpdate', { detail: blocks }));
    window.dispatchEvent(new CustomEvent('storageUpdate'));
  }
};

export const addCalendarBlock = async (
  blockData: Omit<CalendarBlock, 'id' | 'createdAt'>
): Promise<CalendarBlock> => {
  const current = getCalendarBlocks();
  const id = `block_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  
  let branchName = blockData.branchName;
  if (!branchName) {
    if (blockData.branchId === 'calle-5') branchName = 'El Galpón Calle 5';
    else if (blockData.branchId === 'calle-13') branchName = 'El Galpón Calle 13';
    else branchName = 'Todas las Franquicias';
  }

  let finalMonthName = blockData.monthName;
  let finalMonthKey = blockData.monthKey;
  if (blockData.type === 'full_month') {
    const y = blockData.year ?? new Date().getFullYear();
    const m = blockData.monthIndex ?? new Date().getMonth();
    finalMonthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    finalMonthName = `${MONTH_NAMES_ES[m]} ${y}`;
  }

  const newBlock: CalendarBlock = {
    ...blockData,
    id,
    branchName,
    monthKey: finalMonthKey,
    monthName: finalMonthName,
    createdAt: new Date().toISOString(),
  };

  const updated = [newBlock, ...current];
  saveCalendarBlocks(updated);

  // Sync to Firestore
  try {
    const blockRef = doc(db, 'calendar_blocks', id);
    setDoc(blockRef, sanitizeForFirestore(newBlock)).catch((e) =>
      console.warn('Firestore calendar_block set notice:', e)
    );
  } catch (err) {
    console.warn('Firestore calendar_block error:', err);
  }

  return newBlock;
};

export const removeCalendarBlock = async (id: string): Promise<CalendarBlock[]> => {
  const current = getCalendarBlocks();
  const updated = current.filter((b) => b.id !== id);
  saveCalendarBlocks(updated);

  try {
    const blockRef = doc(db, 'calendar_blocks', id);
    deleteDoc(blockRef).catch((e) =>
      console.warn('Firestore remove calendar_block notice:', e)
    );
  } catch (err) {
    console.warn('Firestore remove calendar_block error:', err);
  }

  return updated;
};

export const isDateBlocked = (
  dateStr: string, 
  branchId?: string
): { isBlocked: boolean; reason: string; block?: CalendarBlock } => {
  if (!dateStr) return { isBlocked: false, reason: '' };
  const blocks = getCalendarBlocks();

  for (const block of blocks) {
    // Check franchise matching: 'all' applies to every franchise
    const branchMatch = 
      !branchId || 
      branchId === 'all' || 
      !block.branchId || 
      block.branchId === 'all' || 
      block.branchId === branchId;
    if (!branchMatch) continue;

    // 1. Single Day
    if (block.type === 'single_day') {
      if (block.date === dateStr) {
        return { 
          isBlocked: true, 
          reason: block.reason || 'Fecha bloqueada por la administración', 
          block 
        };
      }
    }
    // 2. Date Range
    else if (block.type === 'date_range') {
      if (block.startDate && block.endDate && dateStr >= block.startDate && dateStr <= block.endDate) {
        return { 
          isBlocked: true, 
          reason: block.reason || 'Período bloqueado por la administración', 
          block 
        };
      }
    }
    // 3. Full Month
    else if (block.type === 'full_month') {
      const ym = dateStr.substring(0, 7);
      if (block.monthKey && ym === block.monthKey) {
        return { 
          isBlocked: true, 
          reason: block.reason || 'Mes bloqueado por la administración', 
          block 
        };
      }
      if (block.year !== undefined && block.monthIndex !== undefined) {
        const [yStr, mStr] = dateStr.split('-');
        const y = Number(yStr);
        const m = Number(mStr);
        if (y === block.year && m === block.monthIndex + 1) {
          return { 
            isBlocked: true, 
            reason: block.reason || 'Mes bloqueado por la administración', 
            block 
          };
        }
      }
    }
  }

  return { isBlocked: false, reason: '' };
};

export const isMonthBlocked = (
  year: number, 
  monthIndex: number, 
  branchId?: string
): { isBlocked: boolean; reason: string; block?: CalendarBlock } => {
  const blocks = getCalendarBlocks();
  const targetKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

  for (const block of blocks) {
    const branchMatch = 
      !branchId || 
      branchId === 'all' || 
      !block.branchId || 
      block.branchId === 'all' || 
      block.branchId === branchId;
    if (!branchMatch) continue;

    if (block.type === 'full_month') {
      if (block.monthKey === targetKey || (block.year === year && block.monthIndex === monthIndex)) {
        return { 
          isBlocked: true, 
          reason: block.reason || 'Mes completo bloqueado por la administración', 
          block 
        };
      }
    }
  }

  return { isBlocked: false, reason: '' };
};

export const getBlockedDates = (branchId?: string): BlockedDate[] => {
  const blocks = getCalendarBlocks(branchId);
  const result: BlockedDate[] = [];
  const seen = new Set<string>();

  for (const b of blocks) {
    const bId = b.branchId || 'all';

    if (b.type === 'single_day' && b.date) {
      const key = `${b.date}_${bId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: b.id,
          blockId: b.id,
          blockType: 'single_day',
          branchId: bId,
          date: b.date,
          reason: b.reason,
          createdAt: b.createdAt,
        });
      }
    } else if (b.type === 'date_range' && b.startDate && b.endDate) {
      const days = expandDatesFromRange(b.startDate, b.endDate);
      for (const d of days) {
        const key = `${d}_${bId}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({
            id: `${b.id}_${d}`,
            blockId: b.id,
            blockType: 'date_range',
            branchId: bId,
            date: d,
            reason: b.reason,
            createdAt: b.createdAt,
          });
        }
      }
    } else if (b.type === 'full_month' && b.year !== undefined && b.monthIndex !== undefined) {
      const days = expandDatesFromMonth(b.year, b.monthIndex);
      for (const d of days) {
        const key = `${d}_${bId}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({
            id: `${b.id}_${d}`,
            blockId: b.id,
            blockType: 'full_month',
            branchId: bId,
            date: d,
            reason: b.reason,
            createdAt: b.createdAt,
          });
        }
      }
    }
  }

  return result;
};

export const toggleBlockDate = (
  date: string, 
  reason: string = 'Fecha no disponible',
  branchId: string = 'all'
): BlockedDate[] => {
  const blocks = getCalendarBlocks();
  const existing = blocks.find((b) => 
    b.type === 'single_day' && b.date === date && (!b.branchId || b.branchId === branchId)
  );
  if (existing) {
    removeCalendarBlock(existing.id);
  } else {
    addCalendarBlock({
      type: 'single_day',
      branchId,
      date,
      reason,
    });
  }
  return getBlockedDates(branchId);
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

    // 5. Sync Pricing Settings (Precios y Tarifas de Fitness, Espacio UP y Cumpleaños)
    try {
      const pricingDocRef = doc(db, 'config', 'pricing');
      const pricingSnap = await getDoc(pricingDocRef);
      if (pricingSnap.exists()) {
        const remotePricing = pricingSnap.data() as PricingSettings;
        localStorage.setItem(PRICING_KEY, JSON.stringify(remotePricing));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pricingUpdate', { detail: remotePricing }));
        }
      }
    } catch (e) {
      console.warn('Pricing sync notice:', e);
    }

    // 6. Sync Calendar Blocks (Bloqueos de Meses, Períodos y Días)
    try {
      const blocksSnapshot = await getDocs(collection(db, 'calendar_blocks'));
      if (!blocksSnapshot.empty) {
        const remoteBlocks: CalendarBlock[] = [];
        blocksSnapshot.forEach((d) => remoteBlocks.push(d.data() as CalendarBlock));
        if (remoteBlocks.length > 0) {
          const localBlocks = getCalendarBlocks();
          const blockMap = new Map<string, CalendarBlock>();
          localBlocks.forEach((b) => blockMap.set(b.id, b));
          remoteBlocks.forEach((b) => blockMap.set(b.id, b));
          saveCalendarBlocks(Array.from(blockMap.values()));
        }
      }
    } catch (e) {
      console.warn('Calendar blocks sync notice:', e);
    }
  } catch (e) {
    console.warn('Firestore sync notice (running on local storage):', e);
  }
};

// -------------------------------------------------------------
// FIRESTORE REAL-TIME SUBSCRIPTIONS
// -------------------------------------------------------------
export const listenToFirestoreCalendarBlocks = (onUpdate?: (blocks: CalendarBlock[]) => void) => {
  try {
    const unsub = onSnapshot(
      collection(db, 'calendar_blocks'),
      (snapshot) => {
        const remoteBlocks: CalendarBlock[] = [];
        snapshot.forEach((d) => {
          remoteBlocks.push(d.data() as CalendarBlock);
        });

        const localBlocks = getCalendarBlocks();
        const blockMap = new Map<string, CalendarBlock>();
        localBlocks.forEach((b) => blockMap.set(b.id, b));
        remoteBlocks.forEach((b) => blockMap.set(b.id, b));

        const merged = Array.from(blockMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        saveCalendarBlocks(merged);
        if (onUpdate) onUpdate(merged);
      },
      (err) => {
        if (err?.code === 'unavailable') return;
        console.warn('Firestore onSnapshot error on calendar_blocks:', err);
      }
    );
    return unsub;
  } catch (err: any) {
    if (err?.code !== 'unavailable') {
      console.warn('Firestore listen calendar_blocks init notice:', err);
    }
    return () => {};
  }
};
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
        if (err?.code === 'unavailable') {
          // Firestore operates in offline mode using cache/localStorage until reconnected
          return;
        }
        console.warn('Firestore onSnapshot error on bookings:', err);
      }
    );
    return unsub;
  } catch (err: any) {
    if (err?.code !== 'unavailable') {
      console.warn('Firestore listen bookings init notice:', err);
    }
    return () => {};
  }
};

// -------------------------------------------------------------
// PRICING & TARIFF SETTINGS (SUPER ADMIN ONLY)
// -------------------------------------------------------------
export const getPricingSettings = (): PricingSettings => {
  try {
    const data = localStorage.getItem(PRICING_KEY);
    if (!data) {
      localStorage.setItem(PRICING_KEY, JSON.stringify(INITIAL_PRICING_SETTINGS));
      return INITIAL_PRICING_SETTINGS;
    }
    const parsed = JSON.parse(data);
    const hasFlyerAdditionals = Array.isArray(parsed?.birthdays?.additionals) &&
      parsed.birthdays.additionals.some((a: BirthdayAdditionalPrice) => a.id === 'calle5_add_8' || a.price === 210000);
    const additionalsToUse = hasFlyerAdditionals
      ? parsed.birthdays.additionals
      : INITIAL_PRICING_SETTINGS.birthdays.additionals;

    const hasFlyerMonthly = Array.isArray(parsed?.birthdays?.monthlyBasePrices) &&
      parsed.birthdays.monthlyBasePrices.some((m: BirthdayMonthPrice) => m.basePriceCalle5 === 600000 || m.basePriceCalle13 === 550000);
    const monthlyToUse = hasFlyerMonthly
      ? parsed.birthdays.monthlyBasePrices
      : INITIAL_PRICING_SETTINGS.birthdays.monthlyBasePrices;

    return {
      fitness: {
        onceAWeek: typeof parsed?.fitness?.onceAWeek === 'number' ? parsed.fitness.onceAWeek : INITIAL_PRICING_SETTINGS.fitness.onceAWeek,
        twiceAWeek: typeof parsed?.fitness?.twiceAWeek === 'number' ? parsed.fitness.twiceAWeek : INITIAL_PRICING_SETTINGS.fitness.twiceAWeek,
      },
      daycare: {
        options: Array.isArray(parsed?.daycare?.options) && parsed.daycare.options.length > 0
          ? parsed.daycare.options
          : INITIAL_PRICING_SETTINGS.daycare.options,
        dailyRates: Array.isArray(parsed?.daycare?.dailyRates) && parsed.daycare.dailyRates.length > 0
          ? INITIAL_PRICING_SETTINGS.daycare.dailyRates.map((defaultRate) => {
              const found = parsed.daycare.dailyRates.find((r: DaycareDailyOption) => r.hours === defaultRate.hours);
              return found && typeof found.price === 'number' ? found : defaultRate;
            })
          : INITIAL_PRICING_SETTINGS.daycare.dailyRates,
      },
      birthdays: {
        depositAmount: typeof parsed?.birthdays?.depositAmount === 'number'
          ? parsed.birthdays.depositAmount
          : INITIAL_PRICING_SETTINGS.birthdays.depositAmount,
        monthlyBasePrices: monthlyToUse,
        additionals: additionalsToUse,
      },
      updatedAt: parsed?.updatedAt || new Date().toISOString(),
    };
  } catch {
    return INITIAL_PRICING_SETTINGS;
  }
};

export const savePricingSettings = async (settings: PricingSettings): Promise<PricingSettings> => {
  const payload: PricingSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(PRICING_KEY, JSON.stringify(payload));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storageUpdate'));
      window.dispatchEvent(new CustomEvent('pricingUpdate', { detail: payload }));
    }
  } catch (e) {
    console.warn('Local storage pricing save warning:', e);
  }

  try {
    const pricingDocRef = doc(db, 'config', 'pricing');
    await setDoc(pricingDocRef, sanitizeForFirestore(payload));
  } catch (err) {
    console.warn('Firestore pricing save notice:', err);
  }

  return payload;
};

export const listenToPricingSettings = (onUpdate?: (settings: PricingSettings) => void) => {
  try {
    const pricingDocRef = doc(db, 'config', 'pricing');
    const unsub = onSnapshot(
      pricingDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as PricingSettings;
          localStorage.setItem(PRICING_KEY, JSON.stringify(remoteData));
          if (onUpdate) onUpdate(remoteData);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('pricingUpdate', { detail: remoteData }));
          }
        }
      },
      (err) => {
        if (err?.code !== 'unavailable') {
          console.warn('Firestore listen pricing notice:', err);
        }
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
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
  pricing: PricingSettings;
}

export const generateCompleteBackup = (): BackupData => {
  const reservations = getReservations();
  const inquiries = getInquiries();
  const branches = getBranches();
  const appUsers = getAppUsers();
  const pricing = getPricingSettings();
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
    pricing,
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


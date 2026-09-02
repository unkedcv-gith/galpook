import React, { useState, useEffect, useMemo } from 'react';
import { Reservation, BlockedDate, Branch, AppUser, Inquiry, UserRole } from '../types';
import { 
  getReservations, 
  updateReservationStatus, 
  deleteReservation, 
  getBlockedDates, 
  toggleBlockDate, 
  addReservation, 
  getBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  getAppUsers,
  addAppUser,
  updateAppUser,
  deleteAppUser,
  getInquiries,
  updateInquiryStatus,
  getCurrentUser,
  logoutUser,
  generateWaiverWhatsAppMessage,
  generateWaiverShareLink,
  formatDateDDMMAAAA,
  formatDateWithWeekday,
  formatWhatsAppNumber,
  syncWithRemoteFirestore,
  listenToFirestoreBookings,
  normalizeBranchId
} from '../services/storage';
import { ViewWaiverDocumentModal } from './ViewWaiverDocumentModal';
import { ApproveDepositModal } from './ApproveDepositModal';
import { SendDepositRequestModal } from './SendDepositRequestModal';
import { EditReservationModal } from './EditReservationModal';
import { LiabilityWaiverFormModal } from './LiabilityWaiverFormModal';
import { EditAppUserModal } from './EditAppUserModal';
import { TIME_SLOTS, HOLIDAYS } from '../data/initialData';

const getAvailableSlotsForDate = (dateStr: string) => {
  if (!dateStr) return [];
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const isHoliday = HOLIDAYS.includes(dateStr);
  
  if (isWeekend || isHoliday) {
    return TIME_SLOTS.filter(slot => slot.id.startsWith('turn_weekend_'));
  } else {
    return TIME_SLOTS.filter(slot => slot.id === 'turn_weekday_evening');
  }
};
import logoBlanca from '../assets/images/marca_el_galpon_blanca.svg';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Trash2, 
  MessageCircle, 
  DollarSign, 
  Lock, 
  Plus, 
  LogOut, 
  FileText, 
  Check,
  Building2,
  Users,
  Crown,
  Store,
  MapPin,
  Calendar as CalendarIcon,
  Filter,
  Phone,
  Mail,
  User,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Power,
  UserCheck,
  UserX,
  CreditCard,
  Send,
  ExternalLink,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  AlertTriangle,
  LayoutGrid,
  Columns,
  SlidersHorizontal,
  BadgeCheck,
  Sparkle
} from 'lucide-react';

interface AdminDashboardProps {
  onCloseAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCloseAdmin }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  
  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'reservas' | 'consultas' | 'bloqueo' | 'nueva' | 'sucursales' | 'usuarios'>('reservas');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // 2-Column layout
  const [viewColumns, setViewColumns] = useState<'2col' | '1col'>('2col');

  // Block date form state
  const [blockDateStr, setBlockDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [blockReason, setBlockReason] = useState('Evento Privado / Mantenimiento');
  const [blockBranchId, setBlockBranchId] = useState<string>('all');

  // Manual reservation state
  const [manualBranchId, setManualBranchId] = useState<string>('calle-5');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualSlot, setManualSlot] = useState('turn_afternoon_1');
  const [manualParent, setManualParent] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualChild, setManualChild] = useState('');
  const [manualAge, setManualAge] = useState(6);
  const [manualKids, setManualKids] = useState(20);
  const [manualNotes, setManualNotes] = useState('');

  const handleManualDateChange = (newDateStr: string) => {
    setManualDate(newDateStr);
    const available = getAvailableSlotsForDate(newDateStr);
    if (available.length > 0 && !available.some(s => s.id === manualSlot)) {
      setManualSlot(available[0].id);
    }
  };

  // SuperAdmin: New Branch Form State
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('La Plata');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchWhatsapp, setNewBranchWhatsapp] = useState('');
  const [newBranchFranName, setNewBranchFranName] = useState('');
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  // SuperAdmin: New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('franquista');
  const [newUserBranchId, setNewUserBranchId] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Waiver, Edit & Delete Modals
  const [waiverDocReservation, setWaiverDocReservation] = useState<Reservation | null>(null);
  const [approvalNoticeReservation, setApprovalNoticeReservation] = useState<Reservation | null>(null);
  const [sendDepositModalReservation, setSendDepositModalReservation] = useState<Reservation | null>(null);
  const [directSignReservation, setDirectSignReservation] = useState<Reservation | null>(null);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [appUserToEdit, setAppUserToEdit] = useState<AppUser | null>(null);

  // Time Navigation & Filter - Default to 'all' so reservations are immediately visible
  const [timeFilterMode, setTimeFilterMode] = useState<'weekly' | 'monthly' | 'all'>('all');
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('Sincronizado');

  const loadData = () => {
    const loadedBranches = getBranches();
    setBranches(loadedBranches);
    setReservations(getReservations());
    setInquiries(getInquiries());
    setBlockedDates(getBlockedDates());
    setAppUsers(getAppUsers());

    const user = getCurrentUser();
    setCurrentUser(user);
    if (user && user.role === 'franquista' && user.assignedBranchId) {
      setSelectedBranchFilter(user.assignedBranchId);
      setManualBranchId(user.assignedBranchId);
      setBlockBranchId(user.assignedBranchId);
    } else if (loadedBranches.length > 0) {
      setManualBranchId(loadedBranches[0].id);
    }
  };

  const handleSyncFirestore = async () => {
    setIsSyncingFirebase(true);
    setSyncStatusMsg('Sincronizando...');
    try {
      await syncWithRemoteFirestore();
      loadData();
      setSyncStatusMsg(`Actualizado ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
    } catch (e) {
      console.warn('Sync notice:', e);
      setSyncStatusMsg('Error de red');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  useEffect(() => {
    loadData();
    handleSyncFirestore();

    // Listen to real-time updates from Firestore bookings
    const unsubFirestore = listenToFirestoreBookings((updated) => {
      setReservations(updated);
      setSyncStatusMsg(`En Vivo ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
    });

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const handleStorageUpdate = () => {
      loadData();
    };
    window.addEventListener('storageUpdate', handleStorageUpdate);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('storageUpdate', handleStorageUpdate);
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    onCloseAdmin();
  };

  // Role permissions helpers
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;
  const isFranquista = currentUser?.role === 'franquista';

  // Weekly Date Range (Monday to Sunday)
  const currentWeekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + currentWeekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const formatYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayStr}`;
    };

    const startStr = formatYMD(monday);
    const endStr = formatYMD(sunday);

    return {
      monday,
      sunday,
      startStr,
      endStr,
      label: `${formatDateDDMMAAAA(startStr)} al ${formatDateDDMMAAAA(endStr)}`,
    };
  }, [currentWeekOffset]);

  // Available unique months list
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    reservations.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        monthsSet.add(r.date.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [reservations]);

  const formatMonthLabel = (monthKey: string) => {
    if (monthKey === 'all') return 'Todos los Meses';
    const [y, m] = monthKey.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Filtered reservations list
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const rBranch = normalizeBranchId(r.branchId);

      if (isFranquista && currentUser?.assignedBranchId) {
        const uBranch = normalizeBranchId(currentUser.assignedBranchId);
        if (rBranch !== uBranch) return false;
      } else if (selectedBranchFilter !== 'all') {
        const fBranch = normalizeBranchId(selectedBranchFilter);
        if (rBranch !== fBranch) return false;
      }

      // Time Filter Mode
      if (timeFilterMode === 'weekly') {
        if (r.date < currentWeekRange.startStr || r.date > currentWeekRange.endStr) {
          return false;
        }
      } else if (timeFilterMode === 'monthly') {
        if (selectedMonthFilter !== 'all' && !r.date.startsWith(selectedMonthFilter)) {
          return false;
        }
      }

      if (filterStatus !== 'todos') {
        if (r.status !== filterStatus) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.parentName.toLowerCase().includes(q) ||
          r.childName.toLowerCase().includes(q) ||
          r.parentPhone.toLowerCase().includes(q) ||
          r.branchName.toLowerCase().includes(q) ||
          r.date.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [
    reservations,
    isFranquista,
    currentUser,
    selectedBranchFilter,
    timeFilterMode,
    currentWeekRange,
    selectedMonthFilter,
    filterStatus,
    searchQuery,
  ]);

  // Filtered inquiries list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const inqBranch = normalizeBranchId(inq.branchId);

      if (isFranquista && currentUser?.assignedBranchId) {
        const uBranch = normalizeBranchId(currentUser.assignedBranchId);
        return inqBranch === uBranch;
      }
      if (selectedBranchFilter !== 'all') {
        const fBranch = normalizeBranchId(selectedBranchFilter);
        return inqBranch === fBranch;
      }
      return true;
    });
  }, [inquiries, isFranquista, currentUser, selectedBranchFilter]);

  // Status management
  const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
    const updated = await updateReservationStatus(id, status, status === 'approved');
    setReservations(updated);

    if (status === 'approved') {
      const target = updated.find((r) => r.id === id);
      if (target) {
        setApprovalNoticeReservation(target);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      const updated = await deleteReservation(id);
      setReservations(updated);
    }
  };

  const handleToggleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = toggleBlockDate(blockDateStr, blockReason, blockBranchId);
    setBlockedDates(updated);
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualParent || !manualChild) {
      alert('Por favor completá Nombre del Adulto y Nombre del Cumpleañer@.');
      return;
    }
    const slotObj = TIME_SLOTS.find(s => s.id === manualSlot);
    const branchObj = branches.find(b => b.id === manualBranchId);

    await addReservation({
      branchId: manualBranchId,
      branchName: branchObj?.name || 'El Galpón',
      date: manualDate,
      slotId: manualSlot,
      slotTime: slotObj?.timeRange || '15:00 a 17:30 hs',
      parentName: manualParent,
      parentPhone: manualPhone,
      parentEmail: '',
      childName: manualChild,
      childAge: manualAge,
      estimatedKids: manualKids,
      additionalPackage: manualKids <= 20 ? 'base_20' : manualKids <= 28 ? 'adicional_21_28' : 'adicional_29_35',
      notes: `[Carga Manual por ${currentUser?.displayName || 'Admin'}] ${manualNotes}`,
      createdByRole: currentUser?.role,
    });

    loadData();
    setActiveTab('reservas');
    setManualParent('');
    setManualPhone('');
    setManualChild('');
    setManualNotes('');
  };

  // SuperAdmin: Add new branch
  const handleAddBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchAddress) return;

    await addBranch({
      name: newBranchName,
      address: newBranchAddress,
      city: newBranchCity,
      phone: newBranchPhone || '221 500-0000',
      whatsappNumber: newBranchWhatsapp ? newBranchWhatsapp.replace(/\D/g, '') : '5492215000000',
      franquistaName: newBranchFranName,
      isActive: true,
      color: '#F2C700',
    });

    setNewBranchName('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setNewBranchWhatsapp('');
    setNewBranchFranName('');
    setIsAddingBranch(false);
    loadData();
  };

  // SuperAdmin: Toggle branch status
  const handleToggleBranchActive = async (branchId: string, currentStatus: boolean) => {
    await updateBranch(branchId, { isActive: !currentStatus });
    loadData();
  };

  // SuperAdmin: Toggle user active/paused status
  const handleToggleUserActive = async (uid: string, currentStatus: boolean) => {
    if (uid === currentUser?.uid) {
      alert('No podés pausar tu propio usuario en sesión.');
      return;
    }
    await updateAppUser(uid, { isActive: !currentStatus });
    loadData();
  };

  // SuperAdmin: Add new user
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername) return;

    const assignedBranch = branches.find(b => b.id === newUserBranchId);

    await addAppUser({
      displayName: newUserName,
      username: newUserUsername.toLowerCase().trim(),
      email: newUserEmail || `${newUserUsername.toLowerCase().trim()}@elgalpon.com`,
      password: newUserPassword.trim() || undefined,
      role: newUserRole,
      assignedBranchId: newUserRole === 'franquista' ? newUserBranchId : undefined,
      assignedBranchName: newUserRole === 'franquista' ? assignedBranch?.name : undefined,
      isActive: true,
    });

    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserPassword('');
    setIsAddingUser(false);
    loadData();
  };

  const handleSaveAppUser = async (updatedFields: Partial<AppUser>) => {
    if (appUserToEdit) {
      await updateAppUser(appUserToEdit.uid, updatedFields);
      setAppUserToEdit(null);
      loadData();
    }
  };

  // Analytics Metrics
  const totalInFilter = filteredReservations.length;
  const approvedInFilter = filteredReservations.filter((r) => r.status === 'approved').length;
  const pendingInFilter = filteredReservations.filter((r) => r.status === 'pending').length;
  const totalRevenueDeposits = filteredReservations
    .filter((r) => r.status === 'approved' && r.depositPaid)
    .reduce((sum, r) => sum + (r.depositAmount || 100000), 0);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white overflow-y-auto">
      
      {/* ========================================================================= */}
      {/* TOP ADMIN HEADER BAR                                                      */}
      {/* ========================================================================= */}
      <div className="bg-black border-b-2 border-zinc-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & User Role Badge */}
        <div className="flex items-center gap-3">
          <img src={logoBlanca} alt="El Galpón" className="h-9 w-auto object-contain" />
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-base sm:text-lg text-white uppercase flex items-center gap-2">
                Panel Central
              </h1>

              {/* Dynamic Role Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase flex items-center gap-1 ${
                isSuperAdmin 
                  ? 'bg-[#ED3078] text-white shadow-[0_0_12px_rgba(237,48,120,0.5)]'
                  : isAdmin 
                  ? 'bg-[#F2C700] text-black shadow-[0_0_12px_rgba(242,199,0,0.4)]'
                  : 'bg-[#1EB8BF] text-black shadow-[0_0_12px_rgba(30,184,191,0.4)]'
              }`}>
                {isSuperAdmin ? <Crown className="w-3 h-3" /> : isAdmin ? <Building2 className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                <span>{currentUser?.displayName || (isSuperAdmin ? 'SuperAdmin' : isAdmin ? 'Admin Dueño' : 'Franquista')}</span>
              </span>
            </div>
            
            <p className="text-[11px] text-zinc-400 font-medium">
              {isSuperAdmin 
                ? 'Control total multi-sucursal, control de usuarios y habilitaciones.'
                : isAdmin
                ? 'Supervisión general de todas las franquicias y reservas del negocio.'
                : `Gestión exclusiva de la sucursal: ${currentUser?.assignedBranchName || 'Asignada'}`}
            </p>
          </div>
        </div>

        {/* Branch Switcher & Quick Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          
          {/* Realtime Firebase Sync Badge & Button */}
          <button
            type="button"
            onClick={handleSyncFirestore}
            disabled={isSyncingFirebase}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Sincronizar manualmente con la base de datos de Firebase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingFirebase ? 'animate-spin text-amber-400' : ''}`} />
            <span className="font-bold text-[11px] uppercase tracking-wider">{syncStatusMsg}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#1EB8BF]" />
            {isFranquista ? (
              <span className="font-black text-white">{currentUser?.assignedBranchName || 'Mi Sucursal'}</span>
            ) : (
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-transparent text-white font-black text-xs uppercase focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900 text-white">Todas las Sucursales</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={onCloseAdmin}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-black text-white uppercase transition-colors cursor-pointer"
          >
            Volver a la Web
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-[#ED3078]/20 text-zinc-300 hover:text-[#ED3078] border border-zinc-700 transition-colors cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MAIN ADMIN BODY                                                           */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* CLEAN RESPONSIVE SEGMENTED BUTTON GRID (NO HORIZONTAL SCROLL) */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            
            <button
              onClick={() => setActiveTab('reservas')}
              className={`p-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'reservas'
                  ? 'bg-[#1EB8BF] text-black shadow-md'
                  : 'bg-black/40 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">Reservas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-black/20 text-current">
                {filteredReservations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('consultas')}
              className={`p-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'consultas'
                  ? 'bg-[#F2C700] text-black shadow-md'
                  : 'bg-black/40 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">Consultas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-black/20 text-current">
                {filteredInquiries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bloqueo')}
              className={`p-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'bloqueo'
                  ? 'bg-[#ED3078] text-white shadow-md'
                  : 'bg-black/40 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span className="truncate">Bloqueos</span>
            </button>

            <button
              onClick={() => setActiveTab('nueva')}
              className={`p-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'nueva'
                  ? 'bg-[#A3BA13] text-black shadow-md'
                  : 'bg-black/40 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Carga Manual</span>
            </button>

            {/* SUPERADMIN BUTTONS */}
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('sucursales')}
                  className={`p-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'sucursales'
                      ? 'bg-[#ED3078] text-white shadow-md'
                      : 'bg-black/40 border border-[#ED3078]/40 text-[#ED3078] hover:bg-[#ED3078]/10'
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span className="truncate">Franquicias</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20 text-white">
                    {branches.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`p-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'usuarios'
                      ? 'bg-[#F2C700] text-black shadow-md'
                      : 'bg-black/40 border border-[#F2C700]/40 text-[#F2C700] hover:bg-[#F2C700]/10'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">Usuarios</span>
                </button>
              </>
            )}

          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: RESERVAS & HISTORIAL SEMANAL / MENSUAL                             */}
        {/* ========================================================================= */}
        {activeTab === 'reservas' && (
          <div className="space-y-6">

            {/* ===================================================================== */}
            {/* 1. MÓDULO DE GESTIÓN & CONTROL (DECK ADMINISTRATIVO)                  */}
            {/* Visualmente enmarcado con fondo Obsidian oscuro y borde estructurado   */}
            {/* ===================================================================== */}
            <div className="bg-[#0e1117] border-2 border-zinc-700/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              
              {/* Accent top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#1EB8BF] to-[#ED3078]" />

              {/* Module Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                
                {/* Title & Active Filter Subtitle */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-black text-base sm:text-lg text-white uppercase tracking-wide">
                          Módulo de Gestión de Fichas
                        </h2>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                          Panel de Control
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Visualizando:{' '}
                        <strong className="text-[#1EB8BF]">
                          {timeFilterMode === 'weekly'
                            ? `Semana del ${currentWeekRange.label}`
                            : timeFilterMode === 'monthly'
                            ? `Mes: ${formatMonthLabel(selectedMonthFilter)}`
                            : 'Histórico Completo (Todas)'}
                        </strong>
                        {selectedBranchFilter !== 'all' && ` • ${branches.find(b => b.id === selectedBranchFilter)?.name}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Module Quick Actions: View Selector & Column Toggle */}
                <div className="flex flex-wrap items-center gap-2.5">

                  {/* 1 Col / 2 Cols Grid Switcher */}
                  <div className="inline-flex p-1 rounded-2xl bg-black border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setViewColumns('2col')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewColumns === '2col'
                          ? 'bg-[#1EB8BF] text-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Ver fichas a 2 columnas"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">2 Cols</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewColumns('1col')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewColumns === '1col'
                          ? 'bg-[#1EB8BF] text-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Ver fichas a 1 columna completa"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">1 Col</span>
                    </button>
                  </div>

                  {/* View Mode Selector (Semanal / Mensual / Todas) */}
                  <div className="inline-flex p-1 rounded-2xl bg-black border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setTimeFilterMode('weekly')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        timeFilterMode === 'weekly'
                          ? 'bg-amber-400 text-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Semanal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeFilterMode('monthly')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        timeFilterMode === 'monthly'
                          ? 'bg-amber-400 text-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Mensual</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeFilterMode('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        timeFilterMode === 'all'
                          ? 'bg-amber-400 text-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Todas</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Weekly Navigation Controls */}
              {timeFilterMode === 'weekly' && (
                <div className="bg-black/70 border border-zinc-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                      title="Semana Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentWeekOffset(0)}
                      className={`px-3 py-2 rounded-xl text-xs font-black uppercase cursor-pointer transition-colors ${
                        currentWeekOffset === 0
                          ? 'bg-white text-black'
                          : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Ir a Semana Actual"
                    >
                      Esta Semana
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                      title="Semana Siguiente"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 font-bold">Rango de Fichas:</span>
                    <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black">
                      📅 {currentWeekRange.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Monthly Dropdown Filter */}
              {timeFilterMode === 'monthly' && (
                <div className="bg-black/70 border border-zinc-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 font-bold">Seleccionar mes para filtrar fichas:</span>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5">
                    <CalendarIcon className="w-4 h-4 text-amber-400" />
                    <select
                      value={selectedMonthFilter}
                      onChange={(e) => setSelectedMonthFilter(e.target.value)}
                      className="bg-transparent text-white font-black text-xs uppercase focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-zinc-900 text-white">Todos los Meses</option>
                      {availableMonths.map((monthKey) => (
                        <option key={monthKey} value={monthKey} className="bg-zinc-900 text-white">
                          {formatMonthLabel(monthKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-black/70 border border-zinc-800/90 rounded-2xl p-4 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase block">Total Fichas</span>
                  <div className="font-heading font-black text-2xl text-white flex items-center justify-between">
                    <span>{totalInFilter}</span>
                    <CalendarIcon className="w-5 h-5 text-[#1EB8BF]" />
                  </div>
                </div>

                <div className="bg-black/70 border border-zinc-800/90 rounded-2xl p-4 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase block">Aprobadas / Con Seña</span>
                  <div className="font-heading font-black text-2xl text-emerald-400 flex items-center justify-between">
                    <span>{approvedInFilter}</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-black/70 border border-zinc-800/90 rounded-2xl p-4 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase block">Pendientes Seña</span>
                  <div className="font-heading font-black text-2xl text-amber-400 flex items-center justify-between">
                    <span>{pendingInFilter}</span>
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-black/70 border border-zinc-800/90 rounded-2xl p-4 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase block">Señas Recaudadas</span>
                  <div className="font-heading font-black text-2xl text-amber-400 flex items-center justify-between">
                    <span>${totalRevenueDeposits.toLocaleString('es-AR')}</span>
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/80 border border-zinc-800 rounded-2xl p-3.5">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar por niño, adulto, celular..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#1EB8BF] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  {['todos', 'pending', 'approved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                        filterStatus === status
                          ? 'bg-white text-black font-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {status === 'todos' ? 'Todos' : status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobadas' : 'Rechazadas'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ===================================================================== */}
            {/* 2. FICHAS DE RESERVA EN SÍ (CARDS A 2 COLUMNAS O 1 COLUMNA)           */}
            {/* Indicador de estado superior asociado a DATOS/REQUISITOS FALTANTES    */}
            {/* ===================================================================== */}
            {filteredReservations.length === 0 ? (
              <div className="bg-[#141721] border border-zinc-800 rounded-3xl p-10 text-center space-y-4">
                <CalendarIcon className="w-10 h-10 text-zinc-500 mx-auto" />
                <h3 className="font-heading font-black text-lg text-white uppercase">
                  {reservations.length > 0 ? 'No hay fichas con los filtros actuales' : 'No hay reservas registradas aún'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  {reservations.length > 0 ? (
                    <>
                      Existen <strong className="text-amber-400">{reservations.length} reserva(s)</strong> en la base de datos de Firebase, pero están ocultas por los filtros activos (
                      {timeFilterMode === 'weekly' ? 'Semanal' : timeFilterMode === 'monthly' ? 'Mensual' : ''}
                      {selectedBranchFilter !== 'all' ? ` / Sucursal: ${selectedBranchFilter}` : ''}
                      {filterStatus !== 'todos' ? ` / Estado: ${filterStatus}` : ''}
                      ).
                    </>
                  ) : (
                    'No se encontró ninguna reserva en el sistema. Podés sincronizar con la nube o crear una nueva ficha manualmente.'
                  )}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {reservations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilterMode('all');
                        if (!isFranquista) setSelectedBranchFilter('all');
                        setFilterStatus('todos');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-heading font-black text-xs uppercase transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Ver Todas las Reservas ({reservations.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncFirestore}
                    disabled={isSyncingFirebase}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                  >
                    <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
                    <span>Sincronizar con Firebase</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${viewColumns === '2col' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-5 items-stretch`}>
                {filteredReservations.map((res) => {
                  const isApproved = res.status === 'approved';
                  const isPending = res.status === 'pending';
                  const isRejected = res.status === 'rejected';
                  const isWaiverSigned = res.liabilityWaiver?.status === 'signed' || res.waiverStatus === 'signed';

                  // Calculate missing data / pending requirements
                  const missingItems: string[] = [];
                  if (!isApproved && !isRejected) missingItems.push('Seña bancaria ($100k)');
                  if (!isWaiverSigned && !isRejected) missingItems.push('Aceptación T&C');
                  if (!res.parentEmail && !isRejected) missingItems.push('Email de contacto');
                  if (!res.adultsFoodInfo && !isRejected) missingItems.push('Menú adultos');

                  // Readiness assessment
                  const isFullyComplete = isApproved && isWaiverSigned && !!res.parentEmail;
                  const isCriticalMissing = isPending && !isWaiverSigned;

                  // Top header color theme based on missing data status
                  let topThemeClass = 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400';
                  let topGlowClass = 'ring-emerald-500/20';
                  let statusBadgeText = 'Ficha Completa (OK)';
                  let statusBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  if (isRejected) {
                    topThemeClass = 'bg-zinc-600';
                    topGlowClass = 'ring-zinc-800';
                    statusBadgeText = 'Reserva Cancelada';
                    statusBadgeColor = 'bg-zinc-800 text-zinc-400 border-zinc-700';
                  } else if (isCriticalMissing) {
                    topThemeClass = 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500';
                    topGlowClass = 'ring-rose-500/20';
                    statusBadgeText = 'Falta Seña y Aceptación de T&C';
                    statusBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                  } else if (isPending) {
                    topThemeClass = 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500';
                    topGlowClass = 'ring-amber-500/20';
                    statusBadgeText = 'Falta Aprobación de Seña';
                    statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  } else if (!isWaiverSigned) {
                    topThemeClass = 'bg-gradient-to-r from-cyan-500 via-sky-400 to-[#1EB8BF]';
                    topGlowClass = 'ring-cyan-500/20';
                    statusBadgeText = 'Falta Aceptación de T&C';
                    statusBadgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                  } else if (!isFullyComplete) {
                    topThemeClass = 'bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500';
                    topGlowClass = 'ring-teal-500/20';
                    statusBadgeText = 'Faltan Datos Menores';
                    statusBadgeColor = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
                  }

                  return (
                    <div
                      key={res.id}
                      className={`bg-[#141722] border border-zinc-700/80 hover:border-zinc-500/90 rounded-2xl p-4.5 sm:p-5 pt-5 transition-all flex flex-col justify-between relative shadow-lg group hover:shadow-2xl overflow-hidden ring-1 ${topGlowClass}`}
                    >
                      {/* ACCENT TOP STATUS BAR (Indica visualmente el estado de datos faltantes en el borde superior) */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${topThemeClass}`} />

                      {/* CARD TOP ZONE: Date, Turno, Branch & Status Badges */}
                      <div className="space-y-3.5">
                        
                        {/* Header: Date + Branch & Missing Data Status Banner */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/90 pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/90 border border-zinc-700/80 text-white text-xs font-black">
                              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span className="capitalize">{formatDateWithWeekday(res.date)}</span>
                              <span className="text-zinc-600">•</span>
                              <Clock className="w-3.5 h-3.5 text-[#1EB8BF]" />
                              <span className="text-zinc-300 font-bold">{res.slotTime}</span>
                            </div>

                            <div className="px-2.5 py-1 rounded-xl bg-zinc-800/90 border border-zinc-700/60 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#1EB8BF]" />
                              <span className="truncate max-w-[120px]">{res.branchName}</span>
                            </div>
                          </div>

                          {/* Missing-Data State Pill */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase flex items-center gap-1.5 border transition-all ${statusBadgeColor}`}
                            >
                              {isFullyComplete ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : isRejected ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>{statusBadgeText}</span>
                            </span>
                          </div>
                        </div>

                        {/* CARD BODY: Birthday Child Specs */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h4 className="font-heading font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
                              Cumple de <span className="text-amber-400">{res.childName}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-200 font-sans font-bold">
                                {res.childAge} años
                              </span>
                            </h4>
                            <span className="text-xs text-zinc-400 font-bold">
                              Invitados: <strong className="text-zinc-200">{res.estimatedKids} chicos</strong>
                            </span>
                          </div>

                          {/* Customer Specs Box */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 bg-black/60 border border-zinc-800/80 rounded-xl p-3">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">Titular: <strong className="text-white">{res.parentName}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-[#1EB8BF] shrink-0" />
                              <span>Cel: <strong className="text-white font-mono">{res.parentPhone}</strong></span>
                            </div>
                            {res.parentEmail ? (
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span className="truncate text-zinc-400">Email: <strong className="text-zinc-200 font-normal">{res.parentEmail}</strong></span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 sm:col-span-2 text-amber-400/90">
                                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="text-[11px] italic font-medium">Email no informado aún</span>
                              </div>
                            )}
                          </div>

                          {/* Requirements / Missing Data checklist strip */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {/* Deposit check / status */}
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 border ${
                                isApproved
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              {isApproved ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-rose-400" />}
                              <span>{isApproved ? 'Seña: ENTREGADA (OK)' : 'Seña: PENDIENTE'}</span>
                            </span>

                            {/* Terms & Conditions Acceptance Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 border ${
                                isWaiverSigned
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {isWaiverSigned ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                              <span>{isWaiverSigned ? 'Términos: ACEPTADOS' : 'Términos: PENDIENTES'}</span>
                            </span>

                            {/* Missing summary warning badge if items pending */}
                            {missingItems.length > 0 && !isRejected && (
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1 pl-1">
                                <span className="text-amber-400 font-black">•</span> Faltan: {missingItems.join(', ')}
                              </span>
                            )}
                          </div>

                          {/* Notes if any */}
                          {res.notes && (
                            <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-2.5 text-xs text-zinc-300 flex items-start gap-2">
                              <span className="text-amber-400 font-black uppercase text-[10px] shrink-0">Nota:</span>
                              <span className="italic text-zinc-300">{res.notes}</span>
                            </div>
                          )}

                          {/* Signed Waiver Quick Peek */}
                          {isWaiverSigned && res.liabilityWaiver && (
                            <div className="bg-teal-950/30 border border-teal-800/50 rounded-xl p-2.5 text-xs text-teal-200 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <Shield className="w-4 h-4 text-teal-400 shrink-0" />
                                <span className="truncate text-[11px]">
                                  Términos aceptados por <strong>{res.liabilityWaiver.signerFullName}</strong> (DNI {res.liabilityWaiver.signerDni})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setWaiverDocReservation(res)}
                                className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-black font-black text-[10px] uppercase transition-colors shrink-0 cursor-pointer"
                              >
                                Ver Acta
                              </button>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* CARD FOOTER: Logical Action Toolbar */}
                      <div className="mt-4 pt-3.5 border-t border-zinc-800/90 flex flex-wrap items-center justify-between gap-2">
                        
                        {/* Primary Workflow Actions */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          
                          {/* 1. Terms & Conditions Link Actions (First Place) */}
                          <div>
                            {!isWaiverSigned ? (
                              <a
                                href={generateWaiverWhatsAppMessage(res)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-[#25D366] text-emerald-300 hover:text-black border border-emerald-500/50 font-black text-[11px] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                                title="Enviar enlace de Términos y Condiciones al WhatsApp del usuario"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] group-hover:text-black" />
                                <span>ENVIAR TÉRMINOS Y CONDICIONES</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setWaiverDocReservation(res)}
                                className="w-full px-2.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-black border border-teal-500/40 font-black text-[11px] uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="Ver Términos y Condiciones aceptados"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ver Términos Aceptados</span>
                              </button>
                            )}
                          </div>

                          {/* 2. Deposit Actions Side-by-side (Underneath) */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Send Bank Details / Request Deposit */}
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => setSendDepositModalReservation(res)}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 font-black text-[11px] uppercase flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                title="Enviar por WhatsApp datos bancarios para realizar la seña"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Enviar Datos Seña</span>
                              </button>
                            )}

                            {/* Assign / Enable Deposit Payment Button */}
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(res.id, 'approved')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-heading font-black text-[11px] uppercase flex items-center gap-1 transition-all cursor-pointer shadow-md"
                                title="Asignar y habilitar entrega de la seña"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Habilitar / Seña Entregada</span>
                              </button>
                            ) : isApproved ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(res.id, 'pending')}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-zinc-800 text-emerald-300 hover:text-white border border-emerald-700/60 font-bold text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1"
                                title="Desmarcar entrega de seña"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Seña Entregada (Cambiar)</span>
                              </button>
                            ) : null}
                          </div>

                        </div>

                        {/* Right Group: Edit, Direct Chat & Delete */}
                        <div className="flex items-center gap-1.5">
                          
                          {/* EDIT RESERVATION BUTTON */}
                          <button
                            type="button"
                            onClick={() => setReservationToEdit(res)}
                            className="p-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold text-[11px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                            title="Editar datos de la ficha de reserva"
                          >
                            <Edit2 className="w-3 h-3 text-amber-400" />
                            <span>Editar</span>
                          </button>

                          {/* Direct WhatsApp Chat */}
                          <a
                            href={`https://api.whatsapp.com/send?phone=${formatWhatsAppNumber(res.parentPhone)}&text=${encodeURIComponent(
                              `¡Hola ${res.parentName}! 👋 Te escribimos desde *${res.branchName}* por la reserva para el cumple de *${res.childName}* 🎪🎉.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 px-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 font-bold text-[11px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                            title="Abrir chat directo de WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Chat</span>
                          </a>

                          {/* DELETE RESERVATION BUTTON */}
                          <button
                            type="button"
                            onClick={() => setReservationToDelete(res)}
                            className="p-1.5 rounded-xl bg-zinc-950 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-800/50 transition-colors cursor-pointer"
                            title="Eliminar Reserva"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CONSULTAS WEB                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'consultas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-black text-lg text-white uppercase flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#F2C700]" /> Consultas Web Recibidas
              </h2>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center space-y-2">
                <MessageCircle className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="font-heading font-black text-lg text-white uppercase">No hay consultas pendientes</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredInquiries.map((inq) => (
                  <div key={inq.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-[#1EB8BF] font-black text-xs uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {inq.branchName}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">{new Date(inq.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>

                    <div>
                      <h4 className="font-heading font-black text-base text-white">{inq.senderName} ({inq.senderPhone})</h4>
                      <p className="text-xs text-zinc-300 mt-1 bg-black/50 p-3 rounded-xl border border-zinc-800">{inq.message}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${formatWhatsAppNumber(inq.senderPhone)}&text=${encodeURIComponent(
                          `¡Hola ${inq.senderName}! 👋 Te escribimos desde *${inq.branchName}* por tu consulta en nuestra web.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#25D366] text-black font-black text-xs flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Responder por WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BLOQUEO DE FECHAS                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'bloqueo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-white uppercase flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#ED3078]" /> Bloquear Día
              </h3>

              <form onSubmit={handleToggleBlock} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Sucursal a Bloquear</label>
                  <select
                    disabled={isFranquista}
                    value={blockBranchId}
                    onChange={(e) => setBlockBranchId(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="all">Todas las Sucursales</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Fecha</label>
                  <input
                    type="date"
                    required
                    value={blockDateStr}
                    onChange={(e) => setBlockDateStr(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Motivo</label>
                  <input
                    type="text"
                    required
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#ED3078] hover:bg-[#d82469] text-white font-black text-xs uppercase py-3 rounded-xl transition-all cursor-pointer"
                >
                  Alternar Bloqueo de Fecha
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-white uppercase">Fechas Bloqueadas Activas</h3>
              {blockedDates.length === 0 ? (
                <p className="text-xs text-zinc-400">No hay fechas bloqueadas actualmente.</p>
              ) : (
                <div className="space-y-2">
                  {blockedDates.map((b, idx) => (
                    <div key={idx} className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="font-black text-white text-xs block">{b.date}</span>
                        <span className="text-[11px] text-zinc-400">{b.reason}</span>
                      </div>
                      <button
                        onClick={() => toggleBlockDate(b.date, b.reason, b.branchId || 'all')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-bold text-red-400 hover:bg-zinc-700 cursor-pointer"
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CARGA MANUAL DE RESERVA                                            */}
        {/* ========================================================================= */}
        {activeTab === 'nueva' && (
          <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Plus className="w-5 h-5 text-[#A3BA13]" />
              <h2 className="font-heading font-black text-lg text-white uppercase">Carga Manual de Festejo</h2>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 uppercase">Sucursal</label>
                <select
                  disabled={isFranquista}
                  value={manualBranchId}
                  onChange={(e) => setManualBranchId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Fecha</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => handleManualDateChange(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Turno</label>
                  <select
                    value={manualSlot}
                    onChange={(e) => setManualSlot(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    {getAvailableSlotsForDate(manualDate).map((s) => (
                      <option key={s.id} value={s.id}>{s.title} ({s.timeRange})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Nombre Adulto *</label>
                  <input
                    type="text"
                    required
                    value={manualParent}
                    onChange={(e) => setManualParent(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Celular WhatsApp</label>
                  <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Cumpleañer@ *</label>
                  <input
                    type="text"
                    required
                    value={manualChild}
                    onChange={(e) => setManualChild(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase">Edad</label>
                  <input
                    type="number"
                    min="6"
                    max="12"
                    value={manualAge}
                    onChange={(e) => setManualAge(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 uppercase">Notas internas</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#A3BA13] text-black font-black text-xs uppercase py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Guardar Reserva Manual
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5 (SUPERADMIN): GESTIÓN DE SUCURSALES / FRANQUICIAS                    */}
        {/* ========================================================================= */}
        {isSuperAdmin && activeTab === 'sucursales' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div>
                <h2 className="font-heading font-black text-lg text-white uppercase flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#ED3078]" /> Franquicias & Sucursales Activas
                </h2>
                <p className="text-xs text-zinc-400">Escala el negocio añadiendo nuevas sucursales y franquistas</p>
              </div>

              <button
                onClick={() => setIsAddingBranch(!isAddingBranch)}
                className="px-3.5 py-2 rounded-xl bg-[#ED3078] text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Nueva Sucursal
              </button>
            </div>

            {/* New Branch Form Drawer */}
            {isAddingBranch && (
              <form onSubmit={handleAddBranchSubmit} className="bg-zinc-900 border-2 border-[#ED3078] rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
                <h3 className="font-heading font-black text-base text-white uppercase">Alta de Nueva Sucursal</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Nombre de Sucursal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: El Galpón Calle 20"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Dirección *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Calle 20 Nº 1450"
                      value={newBranchAddress}
                      onChange={(e) => setNewBranchAddress(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Teléfono de Contacto</label>
                    <input
                      type="text"
                      placeholder="221 555-4321"
                      value={newBranchPhone}
                      onChange={(e) => setNewBranchPhone(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">WhatsApp para Derivación (Directo)</label>
                    <input
                      type="text"
                      placeholder="5492215554321"
                      value={newBranchWhatsapp}
                      onChange={(e) => setNewBranchWhatsapp(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingBranch(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#ED3078] text-white text-xs font-black uppercase"
                  >
                    Guardar y Habilitar Sucursal
                  </button>
                </div>
              </form>
            )}

            {/* Branches List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {branches.map((b) => {
                const branchResCount = reservations.filter(r => r.branchId === b.id).length;
                return (
                  <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#1EB8BF]" />
                        <h4 className="font-heading font-black text-base text-white uppercase">{b.name}</h4>
                      </div>
                      <button
                        onClick={() => handleToggleBranchActive(b.id, b.isActive)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer ${
                          b.isActive ? 'bg-[#A3BA13] text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {b.isActive ? 'Activa' : 'Pausada'}
                      </button>
                    </div>

                    <p className="text-xs text-zinc-300">{b.address}, {b.city}</p>
                    <p className="text-xs text-zinc-400">WhatsApp: {b.whatsappNumber} • Tel: {b.phone}</p>
                    
                    <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
                      <span>Reservas históricas: <strong className="text-white">{branchResCount}</strong></span>
                      <span className="text-[11px] text-zinc-500 font-mono">ID: {b.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6 (SUPERADMIN): GESTIÓN DE USUARIOS Y CONTROL DE ACCESO              */}
        {/* ========================================================================= */}
        {isSuperAdmin && activeTab === 'usuarios' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div>
                <h2 className="font-heading font-black text-lg text-white uppercase flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#F2C700]" /> Control y Gestión de Usuarios
                </h2>
                <p className="text-xs text-zinc-400">Pausa, inhabilita o activa accesos para Admins y Franquistas</p>
              </div>

              <button
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="px-3.5 py-2 rounded-xl bg-[#F2C700] text-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Nuevo Usuario
              </button>
            </div>

            {/* New User Form Drawer */}
            {isAddingUser && (
              <form onSubmit={handleAddUserSubmit} className="bg-zinc-900 border-2 border-[#F2C700] rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
                <h3 className="font-heading font-black text-base text-white uppercase">Alta de Usuario con Rol</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Laura Benítez"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Nombre de Usuario (Login) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: franquicia20"
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Email (Opcional)</label>
                    <input
                      type="email"
                      placeholder="Ej: usuario@elgalpon.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Contraseña Personalizada</label>
                    <input
                      type="text"
                      placeholder="Ej: clave1234 (o dejar vacío para default)"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase">Rol Asignado *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="franquista">Franquista (Gestor de Sucursal)</option>
                      <option value="admin">Admin (Dueño del Negocio)</option>
                      <option value="superadmin">SuperAdmin (Desarrollador)</option>
                    </select>
                  </div>

                  {newUserRole === 'franquista' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300 uppercase">Sucursal Asignada *</label>
                      <select
                        value={newUserBranchId}
                        onChange={(e) => setNewUserBranchId(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="">Seleccionar Sucursal</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#F2C700] text-black text-xs font-black uppercase"
                  >
                    Dar de Alta Usuario
                  </button>
                </div>
              </form>
            )}

            {/* Users List with Active/Paused Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appUsers.map((u) => {
                const isUserActive = u.isActive !== false;
                const isSelf = u.uid === currentUser?.uid;

                return (
                  <div key={u.uid} className={`bg-zinc-900 border-2 rounded-3xl p-5 space-y-3 transition-all ${
                    isUserActive ? 'border-zinc-800' : 'border-[#ED3078]/60 bg-red-950/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-zinc-400" />
                        <div>
                          <span className="font-heading font-black text-base text-white block">{u.displayName}</span>
                          <span className="text-[11px] text-zinc-400 font-mono">@{u.username}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'superadmin' 
                          ? 'bg-[#ED3078] text-white' 
                          : u.role === 'admin' 
                          ? 'bg-[#F2C700] text-black' 
                          : 'bg-[#1EB8BF] text-black'
                      }`}>
                        {u.role}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 space-y-1">
                      <p>Email: <strong className="text-zinc-200">{u.email}</strong></p>
                      {u.assignedBranchName && (
                        <p className="text-[#1EB8BF] font-bold">Sucursal Asignada: {u.assignedBranchName}</p>
                      )}
                    </div>

                    {/* SuperAdmin Action Bar: Pause / Inhabilitar & Edit */}
                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isUserActive ? 'bg-[#A3BA13]' : 'bg-[#ED3078]'}`} />
                        <span className={`text-[11px] font-black uppercase ${isUserActive ? 'text-[#A3BA13]' : 'text-[#ED3078]'}`}>
                          {isUserActive ? 'Habilitado / Activo' : 'Pausado / Inhabilitado'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAppUserToEdit(u)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-zinc-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {!isSelf ? (
                          <button
                            type="button"
                            onClick={() => handleToggleUserActive(u.uid, isUserActive)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                              isUserActive
                                ? 'bg-zinc-800 hover:bg-[#ED3078] text-zinc-300 hover:text-white border border-zinc-700'
                                : 'bg-[#A3BA13] hover:bg-[#8ea210] text-black shadow-md'
                            }`}
                          >
                            {isUserActive ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Pausar</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Reactivar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-bold uppercase self-center">(Tu usuario)</span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODALS (WAIVER, DEPOSIT, EDIT & DELETE)                                    */}
      {/* ========================================================================= */}

      {/* 1. View Signed Waiver Document Certificate */}
      {waiverDocReservation && (
        <ViewWaiverDocumentModal
          isOpen={!!waiverDocReservation}
          reservation={waiverDocReservation}
          onClose={() => setWaiverDocReservation(null)}
        />
      )}

      {/* 2. Automatic Deposit Approval Notice & WhatsApp Link */}
      {approvalNoticeReservation && (
        <ApproveDepositModal
          isOpen={!!approvalNoticeReservation}
          reservation={approvalNoticeReservation}
          onClose={() => setApprovalNoticeReservation(null)}
        />
      )}

      {/* 3. Send Bank Details / Request Deposit WhatsApp Modal */}
      {sendDepositModalReservation && (
        <SendDepositRequestModal
          isOpen={!!sendDepositModalReservation}
          reservation={sendDepositModalReservation}
          onClose={() => setSendDepositModalReservation(null)}
        />
      )}

      {/* 4. Direct In-Store / Tablet Waiver Signature Modal */}
      {directSignReservation && (
        <LiabilityWaiverFormModal
          isOpen={!!directSignReservation}
          reservationId={directSignReservation.id}
          onClose={() => setDirectSignReservation(null)}
          onWaiverSaved={() => {
            loadData();
            setDirectSignReservation(null);
          }}
        />
      )}

      {/* 5. Edit Reservation Modal */}
      {reservationToEdit && (
        <EditReservationModal
          isOpen={!!reservationToEdit}
          reservation={reservationToEdit}
          branches={branches}
          onClose={() => setReservationToEdit(null)}
          onSaved={(updatedList) => {
            setReservations(updatedList);
            setReservationToEdit(null);
          }}
        />
      )}

      {/* 6. In-App Delete Confirmation Modal (Bypasses iframe popup block) */}
      {reservationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border-2 border-red-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-heading font-black text-lg uppercase text-white">
                ¿Eliminar Ficha de Reserva?
              </h3>
              <p className="text-xs text-zinc-300">
                Estás por eliminar permanentemente la reserva para el cumpleaños de <strong className="text-amber-400 font-bold">{reservationToDelete.childName}</strong> del día <strong className="text-white font-mono">{formatDateDDMMAAAA(reservationToDelete.date)}</strong> ({reservationToDelete.slotTime}) en <strong className="text-white">{reservationToDelete.branchName}</strong>.
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                Esta acción liberará el turno y no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReservationToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={async () => {
                  const updated = await deleteReservation(reservationToDelete.id);
                  setReservations(updated);
                  setReservationToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs uppercase tracking-wide transition-all shadow-lg cursor-pointer"
              >
                Sí, Eliminar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Edit User Modal */}
      {appUserToEdit && (
        <EditAppUserModal
          isOpen={!!appUserToEdit}
          user={appUserToEdit}
          onClose={() => setAppUserToEdit(null)}
          onSave={handleSaveAppUser}
        />
      )}

    </div>
  );
};

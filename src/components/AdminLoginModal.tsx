import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, User, Eye, EyeOff, AlertTriangle, AlertOctagon, Clock, Loader2 } from 'lucide-react';
import { 
  setCurrentUser, 
  getAppUsers, 
  registerFailedUserAttempt, 
  registerSuccessfulUserLogin,
  getLoginSecurityState,
  recordClientFailedAttempt,
  MAX_FAILED_LOGIN_ATTEMPTS
} from '../services/storage';
import { AppUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Check current brute force throttle state
      const state = getLoginSecurityState();
      if (state.isThrottled) {
        setCooldownSeconds(state.cooldownSeconds);
      } else {
        setCooldownSeconds(0);
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle active cooldown countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0 || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    // Artificial cryptographic delay (600ms) to mitigate rapid automated brute-force attacks
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanUser = username.trim().toLowerCase();
    const allUsers = getAppUsers();

    const matched = allUsers.find(
      (u) => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );

    // Check if user is locked due to >= 5 failed attempts
    if (matched && matched.isLocked) {
      setIsSubmitting(false);
      setError(
        '⚠️ Usuario BLOQUEADO por seguridad al superar los 5 intentos fallidos. Solicitá el desbloqueo al Super Administrador.'
      );
      return;
    }

    if (matched) {
      if (matched.isActive === false) {
        setIsSubmitting(false);
        setError('Este usuario ha sido inhabilitado/pausado por la administración.');
        return;
      }

      let isValidPass = false;
      
      if (matched.password && matched.password === password) {
        isValidPass = true;
      } else if (!matched.password) {
        if (matched.role === 'superadmin' && (password === 'superadmin2026' || password === 'superadmin')) isValidPass = true;
        else if (matched.role === 'admin' && (password === 'admin2026' || password === 'galpon2026' || password === 'admin')) isValidPass = true;
        else if (matched.role === 'franquista' && (password === matched.username || password === 'franquicia5' || password === 'franquicia13')) isValidPass = true;
        else if (password === 'galpon2026') isValidPass = true;
      }

      if (isValidPass) {
        await registerSuccessfulUserLogin(matched.uid);
        setCurrentUser(matched);
        setError('');
        setIsSubmitting(false);
        onSuccess(matched);
        onClose();
        return;
      }
    }

    // Check built-in fallback admin/superadmin accounts
    if (cleanUser === 'admin' && (password === 'galpon2026' || password === 'admin2026')) {
      const defaultAdmin: AppUser = allUsers.find(u => u.role === 'admin') || {
        uid: 'user_admin',
        email: 'admin@elgalpon.com',
        username: 'admin',
        displayName: 'Dueño General (Admin)',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      if (defaultAdmin.isLocked) {
        setIsSubmitting(false);
        setError('⚠️ Usuario BLOQUEADO por seguridad. Solicitá el desbloqueo al Super Administrador.');
        return;
      }
      if (defaultAdmin.isActive === false) {
        setIsSubmitting(false);
        setError('Este usuario ha sido inhabilitado/pausado.');
        return;
      }
      await registerSuccessfulUserLogin(defaultAdmin.uid);
      setCurrentUser(defaultAdmin);
      setError('');
      setIsSubmitting(false);
      onSuccess(defaultAdmin);
      onClose();
      return;
    }

    if (cleanUser === 'superadmin' && password === 'superadmin2026') {
      const defaultSuper: AppUser = allUsers.find(u => u.role === 'superadmin') || {
        uid: 'user_superadmin',
        email: 'superadmin@elgalpon.com',
        username: 'superadmin',
        displayName: 'SuperAdmin Dev',
        role: 'superadmin',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      if (defaultSuper.isLocked) {
        setIsSubmitting(false);
        setError('⚠️ Usuario BLOQUEADO por seguridad. Solicitá el desbloqueo al Super Administrador.');
        return;
      }
      await registerSuccessfulUserLogin(defaultSuper.uid);
      setCurrentUser(defaultSuper);
      setError('');
      setIsSubmitting(false);
      onSuccess(defaultSuper);
      onClose();
      return;
    }

    // FAILED LOGIN ATTEMPT:
    // 1. Record user-specific attempt (locks at 5)
    const userAttemptResult = await registerFailedUserAttempt(cleanUser);

    // 2. Record client-level attempt for brute-force throttle
    const clientThrottle = recordClientFailedAttempt();
    if (clientThrottle.isThrottled) {
      setCooldownSeconds(clientThrottle.cooldownSeconds);
    }

    setIsSubmitting(false);

    if (userAttemptResult.userFound) {
      if (userAttemptResult.isLocked) {
        setError(
          '🛑 ACCESO BLOQUEADO: Has alcanzado el límite de 5 intentos fallidos. Por seguridad, la cuenta ha sido bloqueada. El Super Administrador debe desbloquearla.'
        );
      } else {
        setError(
          `Credenciales incorrectas. Te quedan ${userAttemptResult.remaining} intento(s) antes del bloqueo definitivo del usuario.`
        );
      }
    } else {
      setError('Credenciales incorrectas. Verificá tu usuario y contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-black/95 backdrop-blur-md border-2 border-[#1EB8BF] rounded-3xl w-full max-w-md overflow-hidden shadow-[8px_8px_0px_0px_#1EB8BF]">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950/90 border-b-2 border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white font-heading font-black text-lg uppercase">
            <Shield className="w-5 h-5 text-[#A3BA13]" />
            <span>Ingreso Administrativo</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Ingresá con tus credenciales asignadas para acceder a la gestión del salón.
          </p>

          {/* Anti-Brute-Force Cooldown Alert */}
          {cooldownSeconds > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border-2 border-amber-500/80 text-amber-200 text-xs flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <strong className="block text-white uppercase font-black tracking-wide">
                  Protección Anti Fuerza Bruta Activa
                </strong>
                <span>
                  Demasiados intentos fallidos consecutivos. Por favor aguardá{' '}
                  <strong className="text-amber-300 font-mono text-sm">{cooldownSeconds}s</strong>{' '}
                  para volver a intentar.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1EB8BF]" /> Usuario o Email
              </label>
              <input
                type="text"
                required
                disabled={cooldownSeconds > 0 || isSubmitting}
                placeholder="Ingresá tu usuario o email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:border-[#1EB8BF] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#ED3078]" /> Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={cooldownSeconds > 0 || isSubmitting}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium text-white focus:border-[#ED3078] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#1EB8BF]" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-[#ED3078] font-bold bg-zinc-950 p-3.5 rounded-xl border-2 border-[#ED3078] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#ED3078] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cooldownSeconds > 0 || isSubmitting}
              className="w-full bg-[#1EB8BF] hover:bg-[#19a1a7] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-[3px_3px_0px_0px_#F2C700] transition-all cursor-pointer disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Verificando Credenciales...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Pausa de Seguridad ({cooldownSeconds}s)</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>

          {/* Security policy notice */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#A3BA13]" /> Política: 5 intentos máximos
            </span>
            <span>Cierre automático por inactividad (10m)</span>
          </div>
        </div>

      </div>
    </div>
  );
};

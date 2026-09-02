import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, User, Eye, EyeOff } from 'lucide-react';
import { setCurrentUser, getAppUsers } from '../services/storage';
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

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const allUsers = getAppUsers();

    const matched = allUsers.find(
      (u) => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );

    if (matched) {
      if (matched.isActive === false) {
        setError('Este usuario ha sido inhabilitado/pausado.');
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
        setCurrentUser(matched);
        setError('');
        onSuccess(matched);
        onClose();
        return;
      }
    }

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
      if (defaultAdmin.isActive === false) {
        setError('Este usuario ha sido inhabilitado/pausado.');
        return;
      }
      setCurrentUser(defaultAdmin);
      setError('');
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
      setCurrentUser(defaultSuper);
      setError('');
      onSuccess(defaultSuper);
      onClose();
      return;
    }

    setError('Credenciales incorrectas. Verificá tu usuario y contraseña.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-black/90 backdrop-blur-md border-2 border-[#1EB8BF] rounded-3xl w-full max-w-md overflow-hidden shadow-[8px_8px_0px_0px_#1EB8BF]">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950/80 border-b-2 border-zinc-800 flex items-center justify-between">
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
          <p className="text-xs text-zinc-400 font-medium">
            Ingresá con tus credenciales asignadas para acceder a la gestión del salón.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1EB8BF]" /> Usuario o Email
              </label>
              <input
                type="text"
                required
                placeholder="admin / franquicia5 / franquicia13"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:border-[#1EB8BF] focus:outline-none"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium text-white focus:border-[#ED3078] focus:outline-none"
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
              <div className="text-xs text-[#ED3078] font-bold bg-zinc-950 p-3 rounded-xl border-2 border-[#ED3078]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1EB8BF] hover:bg-[#19a1a7] text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-[3px_3px_0px_0px_#F2C700] transition-all cursor-pointer mt-2"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

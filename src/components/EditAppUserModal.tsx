import React, { useState, useEffect } from 'react';
import { X, User, KeyRound, Shield, AlertOctagon, Unlock } from 'lucide-react';
import { AppUser } from '../types';

interface EditAppUserModalProps {
  isOpen: boolean;
  user: AppUser | null;
  onClose: () => void;
  onSave: (updatedUser: Partial<AppUser>) => void;
}

export const EditAppUserModal: React.FC<EditAppUserModalProps> = ({ isOpen, user, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [unlockChecked, setUnlockChecked] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
      setPassword(user.password || '');
      setEmail(user.email || '');
      setUnlockChecked(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<AppUser> = {
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim()
    };
    if (password.trim()) {
      payload.password = password.trim();
    }
    if (unlockChecked) {
      payload.isLocked = false;
      payload.failedAttempts = 0;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 bg-black border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
                Gestión de Usuario
              </span>
              <h3 className="font-heading font-black text-base text-white uppercase">
                Editar Datos y Accesos
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 uppercase">Nombre Completo</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 uppercase">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#1EB8BF]" /> Nombre de Usuario (Login)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#F2C700]" /> Nueva Contraseña
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar en blanco para mantener actual"
                className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600"
              />
            </div>

            {/* Account Lock Status & Unlock Option */}
            {user.isLocked && (
              <div className="p-3.5 bg-rose-950/70 border-2 border-rose-500/70 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase block">Cuenta Bloqueada por Seguridad</span>
                    <span className="text-[11px] text-zinc-300">
                      Superó los 5 intentos fallidos permitidos.
                    </span>
                  </div>
                </div>
                <label className="flex items-center gap-2 p-2 bg-black/60 rounded-xl cursor-pointer hover:bg-black/90 transition-colors border border-rose-500/40">
                  <input
                    type="checkbox"
                    checked={unlockChecked}
                    onChange={(e) => setUnlockChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 accent-emerald-500"
                  />
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                    <Unlock className="w-3.5 h-3.5" />
                    Desbloquear esta cuenta y reestablecer intentos a 0
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#F2C700] hover:bg-[#e6bd00] text-black font-black text-xs uppercase cursor-pointer shadow-lg shadow-[#F2C700]/20"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

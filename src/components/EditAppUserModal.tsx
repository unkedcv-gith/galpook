import React, { useState, useEffect } from 'react';
import { X, User, KeyRound, Shield } from 'lucide-react';
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

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
      setPassword(user.password || '');
      setEmail(user.email || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      email: email.trim()
    });
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

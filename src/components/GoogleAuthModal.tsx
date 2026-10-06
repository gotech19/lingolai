import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playTapSound, playCorrectSound } from '../utils/audio';
import { X, Check, Shield, User, Mail, Sparkles, LogOut } from 'lucide-react';
import { GoogleIcon } from './OnboardingScreen';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const defaultAccount = {
    name: 'Oussama Guesmia',
    email: 'oussamaguesmia2@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
  };

  const handleSelectAccount = (account: { name: string; email: string; avatar: string }) => {
    setIsProcessing(true);
    playTapSound();
    setTimeout(() => {
      onLogin({
        name: account.name,
        email: account.email,
        avatar: account.avatar,
        provider: 'google',
        isAuthenticated: true,
      });
      playCorrectSound();
      setIsProcessing(false);
      onClose();
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    setIsProcessing(true);
    playTapSound();
    setTimeout(() => {
      onLogin({
        name: customName.trim() || customEmail.split('@')[0],
        email: customEmail.trim(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName || customEmail)}`,
        provider: 'google',
        isAuthenticated: true,
      });
      playCorrectSound();
      setIsProcessing(false);
      onClose();
    }, 450);
  };

  const handleSignOutClick = () => {
    playTapSound();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Google Brand Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800 leading-tight">
                  {currentUser.isAuthenticated ? 'Compte Google' : 'Connexion Google'}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">LinGoL Cloud Sync</span>
              </div>
            </div>
            <button
              onClick={() => {
                playTapSound();
                onClose();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {currentUser.isAuthenticated ? (
            /* Connected view */
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-xs object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-800 truncate">{currentUser.name}</span>
                    <span className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Lié
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-blue-600 font-medium mt-0.5 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-500" />
                    Synchronisation active
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service :</span>
                  <span className="font-semibold text-slate-700">Google Identity</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sauvegarde :</span>
                  <span className="font-semibold text-emerald-600">Séries & XP synchronisés</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Changer de compte
                </button>
                <button
                  onClick={handleSignOutClick}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            /* Not logged in: Account selection */
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Connectez-vous avec votre compte Google pour conserver vos séries, vos XP et vos conversations avec Lina AI sur LinGoL.
              </p>

              {/* Quick 1-tap Account Option */}
              <div
                onClick={() => handleSelectAccount(defaultAccount)}
                className="group border border-slate-200 hover:border-[#4285F4] bg-slate-50/50 hover:bg-blue-50/40 rounded-2xl p-3 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={defaultAccount.avatar}
                    alt={defaultAccount.name}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 text-left">
                    <div className="font-bold text-xs text-slate-800 truncate">{defaultAccount.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{defaultAccount.email}</div>
                  </div>
                </div>
                <button
                  disabled={isProcessing}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-[#4285F4] text-white text-xs font-semibold group-hover:bg-[#3367D6] transition-colors shadow-2xs"
                >
                  {isProcessing ? 'Connexion...' : 'Continuer'}
                </button>
              </div>

              {/* Custom Google account toggle */}
              {!showCustomInput ? (
                <button
                  onClick={() => {
                    playTapSound();
                    setShowCustomInput(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Utiliser un autre compte Google
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-2.5 pt-1 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Votre prénom ou nom
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Ex: Oussama"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4285F4] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Adresse email Google
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="email"
                        required
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="vous@gmail.com"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4285F4] focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-[#4285F4] text-white font-semibold text-xs hover:bg-[#3367D6] transition-colors flex items-center justify-center gap-2"
                  >
                    <GoogleIcon />
                    <span>{isProcessing ? 'Connexion en cours...' : 'Se connecter avec ce compte'}</span>
                  </button>
                </form>
              )}

              {/* Google Security Guarantee note */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Authentification sécurisée Google OAuth 2.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

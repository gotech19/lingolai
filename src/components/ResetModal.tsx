import React from 'react';
import { playTapSound, playCorrectSound } from '../utils/audio';
import { RotateCcw, AlertTriangle, Sparkles, X, Check } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  onLoadDemoData?: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  onLoadDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Remise à zéro (État vierge)</h3>
              <p className="text-[11px] text-slate-500">Réinitialisation complète de LinGoL</p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 mb-5">
          <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3 flex items-start gap-2.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Ardoise propre :</strong> Toutes vos statistiques repasseront à zéro (0 XP, 0 jour de série, 0 lingot), vos leçons seront remises au début, et les conversations seront effacées.
            </div>
          </div>

          <p>
            Vous pourrez recommencer l'expérience dès l'écran de bienvenue en tant que nouvel apprenant.
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => {
              playCorrectSound();
              onConfirmReset();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirmer la remise à zéro vierge</span>
          </button>

          {onLoadDemoData && (
            <button
              onClick={() => {
                playCorrectSound();
                onLoadDemoData();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#004ac6] font-semibold text-xs border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Charger des données d'exemple (Démo)</span>
            </button>
          )}

          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-full py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

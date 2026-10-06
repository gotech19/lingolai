import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { playTapSound, playCorrectSound } from '../utils/audio';

export const InstallAppBanner: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    playTapSound();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        playCorrectSound();
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuide(true);
    }
  };

  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled || isDismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 max-w-sm w-[calc(100%-2rem)] bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-3xl p-4 shadow-xl animate-slideUp">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#0D9488] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
            L
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                Installer l'application LinGoL
              </span>
              <span className="text-[9px] bg-blue-100 text-[#2563EB] font-bold px-1.5 rounded-full">
                Web App
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Accédez plus rapidement à Lina AI et pratiquez hors-ligne.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playTapSound();
            setIsDismissed(true);
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showGuide && (
        <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
          <p><strong>Pour installer sur votre appareil :</strong></p>
          <p>• Sur Chrome / Edge : cliquez sur l'icône "Installer l'application" dans la barre d'adresse.</p>
          <p>• Sur Safari (iOS) : appuyez sur Partager puis "Sur l'écran d'accueil".</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3 rounded-xl btn-3d-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer maintenant</span>
        </button>
        <button
          onClick={() => {
            playTapSound();
            setIsDismissed(true);
          }}
          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
};

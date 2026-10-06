import React from 'react';
import { Home, Compass, Radio, Mic, Trophy } from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { NavTabType } from './SidebarNav';

interface BottomNavProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'home' as NavTabType,
      label: 'Accueil',
      icon: Home,
    },
    {
      id: 'learn' as NavTabType,
      label: 'Parcours',
      icon: Compass,
    },
    {
      id: 'lina' as NavTabType,
      label: 'Parler',
      icon: Mic,
      isPrimaryAction: true,
    },
    {
      id: 'practice' as NavTabType,
      label: 'Coach',
      icon: Radio,
    },
    {
      id: 'profile' as NavTabType,
      label: 'Profil',
      icon: Trophy,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isPrimaryAction) {
            return (
              <div key={tab.id} className="relative flex flex-col items-center justify-center">
                <button
                  onClick={() => {
                    playTapSound();
                    onSelectTab(tab.id);
                  }}
                  className={`-top-5 absolute w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#2563EB] to-[#0D9488] text-white ring-4 ring-blue-100 dark:ring-blue-950 scale-105'
                      : 'bg-gradient-to-tr from-[#2563EB] to-[#0D9488] text-white hover:scale-105'
                  }`}
                  title="Parler avec Lina AI (Micro)"
                >
                  <Icon className="w-6 h-6 stroke-[2.4]" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white" />
                  </span>
                </button>
                <span className="text-[10px] mt-7 font-black tracking-tight text-[#2563EB] dark:text-blue-400">
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-[#2563EB] dark:text-blue-400 font-extrabold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${
                  isActive ? 'font-black' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import React from 'react';
import { Compass, Mic, Layers, Trophy } from 'lucide-react';
import { playTapSound } from '../utils/audio';

export type TabType = 'lina' | 'path' | 'review' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'lina' as TabType,
      label: 'Parler (Lina)',
      icon: Mic,
      hasPulse: true,
      badge: 'Micro IA',
    },
    {
      id: 'path' as TabType,
      label: 'Parcours',
      icon: Compass,
      hasPulse: false,
    },
    {
      id: 'review' as TabType,
      label: 'Vocabulaire',
      icon: Layers,
      hasPulse: false,
    },
    {
      id: 'profile' as TabType,
      label: 'Profil',
      icon: Trophy,
      hasPulse: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative cursor-pointer ${
                isActive ? 'text-[#004ac6]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                {tab.hasPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

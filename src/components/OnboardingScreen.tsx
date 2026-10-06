import React, { useState } from 'react';
import { ArrowRight, Volume2, Sparkles, Check } from 'lucide-react';
import { speakText, playTapSound } from '../utils/audio';

export const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface OnboardingScreenProps {
  onGetStarted: () => void;
  onGoogleSignIn: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onGetStarted,
  onGoogleSignIn,
}) => {
  const [currentSlide, setCurrentSlide] = useState(2); // Default to Slide 3 ("Meet Lina AI") as in screenshot!
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const LINA_IMAGE_URL =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdXxgRbR6p1YObD3z-MHkHW2UqxraFwup6ZPxOsuFoDdk0vaUr5gfHkFghpDvQdiL6BHVWAEiTHitEqgQ6bntX8LWJgWpowU4oGMgZgF4qt0wgEFh8YteRiUwcuxljLE9OiaAJVgHMNzl3CDdax3MdpCqyrFkOcTgYXU9pwFR1OOaARH-GJhqzNka3UZE0TYzb2vrTDM6EeFMjd1LtLJtvAv5SnWpGEkWS89KJwvFrn0MB5bPIxMqWAg';

  const handleHearGreeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    setIsPlayingGreeting(true);
    speakText('¡Hola! ¿Cómo estás?', 'es-ES', () => setIsPlayingGreeting(false));
  };

  const handleNext = () => {
    playTapSound();
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onGetStarted();
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans relative overflow-hidden select-none">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#dbe1ff] opacity-40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 -left-20 w-72 h-72 bg-[#6cf8bb] opacity-25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/2 right-4 w-40 h-40 bg-[#e0e7ff] opacity-30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Header with prominent LinGoL branding */}
      <header className="w-full max-w-md mx-auto px-5 pt-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#004ac6] flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            L
          </span>
          <div>
            <span
              className="font-extrabold tracking-tight text-xl text-[#004ac6] block leading-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              LinGoL
            </span>
            <span className="text-[10px] text-slate-500 font-medium">IA & Pratique Vocale</span>
          </div>
        </div>
        {currentSlide < 2 && (
          <button
            onClick={onGetStarted}
            className="text-xs font-semibold text-[#434655] hover:text-[#004ac6] transition-colors py-1 px-2.5 rounded-md"
          >
            Passer
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-between px-5 md:px-8 py-3 z-10 w-full max-w-md mx-auto h-full min-h-[640px]">
        {/* Slide 1: Welcome & Methodology */}
        {currentSlide === 0 && (
          <div className="w-full flex-grow flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-64 h-64 md:w-72 md:h-72 relative flex items-center justify-center mb-6">
              <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[#dbe1ff] to-[#eff4ff] border border-blue-100 flex items-center justify-center shadow-lg relative">
                <span className="text-6xl">🌍</span>
                <div className="absolute -top-2 right-4 glass-panel px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-[#004ac6] flex items-center gap-1">
                  <span>🇪🇸</span> Espagnol
                </div>
                <div className="absolute bottom-4 -left-2 glass-panel px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-[#006c49] flex items-center gap-1">
                  <span>🇫🇷</span> Français
                </div>
                <div className="absolute top-1/2 -right-4 glass-panel px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-[#784b00] flex items-center gap-1">
                  <span>🇯🇵</span> Japonais
                </div>
              </div>
            </div>
            <div className="text-center w-full mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#004ac6] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Parlez dès le premier jour
              </h1>
              <p className="text-[#434655] text-sm md:text-base max-w-xs mx-auto">
                Des leçons concrètes avec LinGoL pour pratiquer la vraie conversation orale, pas juste la mémorisation.
              </p>
            </div>
          </div>
        )}

        {/* Slide 2: Tactile Learning & Micro vocal */}
        {currentSlide === 1 && (
          <div className="w-full flex-grow flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-64 h-64 md:w-72 md:h-72 relative flex items-center justify-center mb-6">
              <div className="w-56 h-56 rounded-3xl bg-white border border-blue-100 shadow-xl p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <span className="text-base">🔥</span> Série de 5 jours !
                  </div>
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    +15 XP
                  </div>
                </div>
                {/* Demo vocal */}
                <div className="space-y-2 text-center py-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-[#004ac6] animate-pulse">
                    🎙️
                  </div>
                  <div className="text-xs font-bold text-slate-800">Micro intelligent intégré</div>
                  <div className="text-[11px] text-slate-500">Parlez naturellement à Lina</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center text-xs font-bold text-emerald-700">
                  ✓ Prononciation parfaite détectée
                </div>
              </div>
            </div>
            <div className="text-center w-full mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#004ac6] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Pratique orale & Micro
              </h1>
              <p className="text-[#434655] text-sm md:text-base max-w-xs mx-auto">
                Utilisez votre voix pour discuter librement et perfectionner votre accent avec l'IA.
              </p>
            </div>
          </div>
        )}

        {/* Slide 3: Exact Screenshot Match "Meet Lina AI" */}
        {currentSlide === 2 && (
          <div className="w-full flex-grow flex flex-col items-center justify-center animate-fadeIn">
            {/* Illustration / Visual Area */}
            <div className="w-full flex-grow flex flex-col items-center justify-center relative mb-4">
              {/* AI Avatar Illustration with Aurora Border */}
              <div className="w-60 h-60 md:w-68 md:h-68 aurora-border rounded-full overflow-hidden shadow-[0_8px_24px_0_rgba(0,74,198,0.18)] relative group cursor-pointer">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Avatar 3D de Lina AI dans LinGoL"
                  src={LINA_IMAGE_URL}
                  referrerPolicy="no-referrer"
                />
                {/* Audio pulse badge */}
                <button
                  onClick={handleHearGreeting}
                  className="absolute bottom-3 right-8 bg-[#004ac6] text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-20"
                  title="Écouter le salut de Lina"
                  aria-label="Écouter le salut de Lina"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingGreeting ? 'animate-bounce text-emerald-300' : ''}`} />
                </button>
              </div>

              {/* Floating Chat Bubble Top-Left */}
              <div
                onClick={handleHearGreeting}
                className="absolute top-4 -left-2 md:-left-4 glass-panel rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-lg max-w-[165px] transform -rotate-3 animate-float-left cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-[#0b1c30]">¡Hola! ¿Cómo estás?</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#434655]">
                  <Sparkles className="w-2.5 h-2.5 text-[#004ac6]" />
                  <span>Appuyer pour écouter</span>
                </div>
              </div>

              {/* Floating Chat Bubble Bottom-Right */}
              <div className="absolute bottom-4 -right-2 md:-right-4 bg-[#2563eb] text-[#eeefff] rounded-2xl rounded-br-none px-3.5 py-2.5 shadow-lg max-w-[155px] transform rotate-2 animate-float-right">
                <p className="text-[13px] font-medium">I'm good, thanks!</p>
                <div className="text-[10px] text-blue-200 mt-0.5">Micro & Coaching en direct</div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center w-full mb-4">
              <h1
                className="text-[26px] md:text-3xl font-bold text-[#004ac6] mb-1.5 tracking-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Meet Lina AI
              </h1>
              <p className="text-[#434655] text-xs md:text-sm max-w-xs mx-auto leading-relaxed">
                Votre partenaire de conversation LinGoL 24/7 pour une pratique réelle et fluide.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="w-full mt-auto flex flex-col items-center pb-2">
          {/* Progress Dots */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                playTapSound();
                setCurrentSlide(0);
              }}
              aria-label="Aller à la diapositive 1"
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === 0 ? 'w-8 bg-[#004ac6]' : 'w-2 bg-[#c3c6d7] hover:bg-slate-400'
              }`}
            />
            <button
              onClick={() => {
                playTapSound();
                setCurrentSlide(1);
              }}
              aria-label="Aller à la diapositive 2"
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === 1 ? 'w-8 bg-[#004ac6]' : 'w-2 bg-[#c3c6d7] hover:bg-slate-400'
              }`}
            />
            <button
              onClick={() => {
                playTapSound();
                setCurrentSlide(2);
              }}
              aria-label="Aller à la diapositive 3"
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === 2 ? 'w-8 bg-[#004ac6]' : 'w-2 bg-[#c3c6d7] hover:bg-slate-400'
              }`}
            />
          </div>

          {/* Action Buttons: Google Sign-in & Fast Start */}
          <div className="w-full space-y-2">
            {/* Authentification Google */}
            <button
              onClick={() => {
                playTapSound();
                onGoogleSignIn();
              }}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300/80 rounded-xl py-3.5 px-4 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
            >
              <GoogleIcon />
              <span>Continuer avec Google</span>
            </button>

            {/* Commencer directement / Invité */}
            <button
              onClick={handleNext}
              className="w-full btn-3d-primary text-white rounded-xl py-3.5 px-4 font-semibold text-sm shadow-md hover:bg-[#0053db] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentSlide === 2 ? 'Commencer directement' : 'Continuer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

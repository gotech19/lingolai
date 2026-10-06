import React, { useState } from 'react';
import { ArrowRight, Volume2, Sparkles, Check, Mic, Globe, Shield } from 'lucide-react';
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
  const [currentSlide, setCurrentSlide] = useState(2); // Default to Slide 3 ("Meet Lina AI") on mobile
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const LINA_IMAGE_URL =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdXxgRbR6p1YObD3z-MHkHW2UqxraFwup6ZPxOsuFoDdk0vaUr5gfHkFghpDvQdiL6BHVWAEiTHitEqgQ6bntX8LWJgWpowU4oGMgZgF4qt0wgEFh8YteRiUwcuxljLE9OiaAJVgHMNzl3CDdax3MdpCqyrFkOcTgYXU9pwFR1OOaARH-GJhqzNka3UZE0TYzb2vrTDM6EeFMjd1LtLJtvAv5SnWpGEkWS89KJwvFrn0MB5bPIxMqWAg';

  const handleHearGreeting = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      {/* Decorative background orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#dbe1ff] opacity-40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 -left-20 w-72 h-72 bg-[#6cf8bb] opacity-25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/2 right-12 w-64 h-64 bg-[#e0e7ff] opacity-35 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white font-black text-lg shadow-sm">
            L
          </div>
          <div>
            <span
              className="font-extrabold tracking-tight text-xl text-[#004ac6] block leading-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              LinGoL
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Web Application Vocale IA</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playTapSound();
              onGoogleSignIn();
            }}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <GoogleIcon />
            <span>Connexion Google</span>
          </button>
          <button
            onClick={onGetStarted}
            className="text-xs font-bold text-[#004ac6] hover:bg-blue-50 py-1.5 px-3 rounded-lg transition-colors"
          >
            Passer →
          </button>
        </div>
      </header>

      {/* DESKTOP VIEW: Split Hero Presentation */}
      <div className="hidden md:flex flex-1 items-center justify-center px-8 lg:px-12 py-6 max-w-6xl mx-auto w-full z-10">
        <div className="grid grid-cols-12 gap-12 items-center w-full">
          {/* Left Column: Interactive Lina AI Showcase with Aurora Border */}
          <div className="col-span-6 flex flex-col items-center justify-center relative">
            <div className="w-72 h-72 lg:w-80 lg:h-80 aurora-border rounded-full overflow-hidden shadow-[0_12px_36px_0_rgba(0,74,198,0.22)] relative group cursor-pointer">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt="Avatar Lina AI"
                src={LINA_IMAGE_URL}
                referrerPolicy="no-referrer"
              />
              <button
                onClick={handleHearGreeting}
                className="absolute bottom-4 right-10 bg-[#004ac6] hover:bg-[#003da6] text-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-20 cursor-pointer"
                title="Écouter la salutation de Lina"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingGreeting ? 'animate-bounce text-emerald-300' : ''}`} />
              </button>
            </div>

            {/* Floating Dialogue Bubble Top-Left */}
            <div
              onClick={handleHearGreeting}
              className="absolute top-2 -left-4 glass-panel rounded-2xl rounded-tl-none px-4 py-3 shadow-xl max-w-[200px] transform -rotate-3 animate-float-left cursor-pointer hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-[#0b1c30]">¡Hola! ¿Cómo estás?</p>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-[#434655]">
                <Sparkles className="w-3 h-3 text-[#004ac6]" />
                <span>Cliquez pour écouter</span>
              </div>
            </div>

            {/* Floating Dialogue Bubble Bottom-Right */}
            <div className="absolute bottom-4 -right-4 bg-[#2563eb] text-[#eeefff] rounded-2xl rounded-br-none px-4 py-3 shadow-xl max-w-[190px] transform rotate-2 animate-float-right">
              <p className="text-sm font-semibold">I'm good, thanks!</p>
              <div className="text-[11px] text-blue-200 mt-1 flex items-center gap-1">
                <Mic className="w-3 h-3" />
                <span>Micro & Coaching direct</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Content & CTAs */}
          <div className="col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#004ac6] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#004ac6]" />
              <span>Application Web Professionnelle</span>
            </div>

            <div className="space-y-2">
              <h1
                className="text-4xl lg:text-5xl font-black text-[#004ac6] tracking-tight leading-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Parlez une langue dès aujourd'hui
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-lg">
                Rencontrez <strong>Lina AI</strong>, votre coach conversationnel 24/7. Pratiquez votre prononciation au microphone, progressez à travers des leçons concrètes et gagnez en fluidité naturelle.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">Microphone vocal</div>
                  <div className="text-[11px] text-slate-500">Parlez et écoutez en direct</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">Compte Google</div>
                  <div className="text-[11px] text-slate-500">Synchronisation du cloud</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => {
                  playTapSound();
                  onGoogleSignIn();
                }}
                className="w-full sm:w-auto flex-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl py-3.5 px-5 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <GoogleIcon />
                <span>Continuer avec Google</span>
              </button>

              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto flex-1 btn-3d-primary text-white rounded-xl py-3.5 px-6 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Commencer directement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Touch-Friendly Mobile App Carousel */}
      <main className="md:hidden flex-grow flex flex-col items-center justify-between px-5 py-3 z-10 w-full max-w-md mx-auto h-full min-h-[580px]">
        {/* Slide 0 */}
        {currentSlide === 0 && (
          <div className="w-full flex-grow flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-60 h-60 relative flex items-center justify-center mb-4">
              <div className="w-52 h-52 rounded-full bg-gradient-to-tr from-[#dbe1ff] to-[#eff4ff] border border-blue-100 flex items-center justify-center shadow-lg relative">
                <span className="text-5xl">🌍</span>
                <div className="absolute -top-2 right-4 glass-panel px-3 py-1 rounded-full shadow-md text-xs font-semibold text-[#004ac6]">
                  🇪🇸 Espagnol
                </div>
                <div className="absolute bottom-4 -left-2 glass-panel px-3 py-1 rounded-full shadow-md text-xs font-semibold text-[#006c49]">
                  🇫🇷 Français
                </div>
                <div className="absolute top-1/2 -right-3 glass-panel px-3 py-1 rounded-full shadow-md text-xs font-semibold text-[#784b00]">
                  🇬🇧 Anglais
                </div>
              </div>
            </div>
            <div className="text-center w-full mb-3">
              <h1 className="text-2xl font-bold text-[#004ac6] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Parlez dès le premier jour
              </h1>
              <p className="text-slate-600 text-xs max-w-xs mx-auto leading-relaxed">
                Des conversations concrètes avec LinGoL pour pratiquer l'oral, pas juste la mémorisation.
              </p>
            </div>
          </div>
        )}

        {/* Slide 1 */}
        {currentSlide === 1 && (
          <div className="w-full flex-grow flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-60 h-60 relative flex items-center justify-center mb-4">
              <div className="w-52 h-52 rounded-3xl bg-white border border-blue-100 shadow-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    🔥 Série active
                  </div>
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    +15 XP
                  </div>
                </div>
                <div className="space-y-1.5 text-center py-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl text-[#004ac6] animate-pulse">
                    🎙️
                  </div>
                  <div className="text-xs font-bold text-slate-800">Micro intelligent</div>
                  <div className="text-[11px] text-slate-500">Parlez librement à Lina</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center text-xs font-bold text-emerald-700">
                  ✓ Accent validé
                </div>
              </div>
            </div>
            <div className="text-center w-full mb-3">
              <h1 className="text-2xl font-bold text-[#004ac6] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Pratique orale au Micro
              </h1>
              <p className="text-slate-600 text-xs max-w-xs mx-auto leading-relaxed">
                Utilisez votre voix pour discuter naturellement et recevoir un retour instantané.
              </p>
            </div>
          </div>
        )}

        {/* Slide 2 */}
        {currentSlide === 2 && (
          <div className="w-full flex-grow flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-full flex-grow flex flex-col items-center justify-center relative mb-4">
              <div className="w-56 h-56 aurora-border rounded-full overflow-hidden shadow-lg relative group cursor-pointer">
                <img
                  className="w-full h-full object-cover"
                  alt="Avatar Lina"
                  src={LINA_IMAGE_URL}
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={handleHearGreeting}
                  className="absolute bottom-3 right-6 bg-[#004ac6] text-white p-2.5 rounded-full shadow-lg flex items-center justify-center z-20"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingGreeting ? 'animate-bounce text-emerald-300' : ''}`} />
                </button>
              </div>

              {/* Floating bubble 1 */}
              <div
                onClick={handleHearGreeting}
                className="absolute top-2 -left-2 glass-panel rounded-2xl rounded-tl-none px-3.5 py-2 shadow-lg max-w-[160px] transform -rotate-3 cursor-pointer"
              >
                <p className="text-xs font-bold text-[#0b1c30]">¡Hola! ¿Cómo estás?</p>
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#434655]">
                  <Sparkles className="w-2.5 h-2.5 text-[#004ac6]" />
                  <span>Appuyer pour écouter</span>
                </div>
              </div>

              {/* Floating bubble 2 */}
              <div className="absolute bottom-3 -right-2 bg-[#2563eb] text-white rounded-2xl rounded-br-none px-3.5 py-2 shadow-lg max-w-[150px] transform rotate-2">
                <p className="text-xs font-semibold">I'm good, thanks!</p>
                <div className="text-[9px] text-blue-200 mt-0.5">Micro & Coaching en direct</div>
              </div>
            </div>

            <div className="text-center w-full mb-3">
              <h1 className="text-2xl font-bold text-[#004ac6] mb-1 tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Meet Lina AI
              </h1>
              <p className="text-slate-600 text-xs max-w-xs mx-auto leading-relaxed">
                Votre partenaire de conversation LinGoL 24/7 pour une pratique orale fluide.
              </p>
            </div>
          </div>
        )}

        {/* Mobile Bottom Controls */}
        <div className="w-full mt-auto flex flex-col items-center pb-2">
          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                playTapSound();
                setCurrentSlide(0);
              }}
              className={`h-2 rounded-full transition-all ${currentSlide === 0 ? 'w-7 bg-[#004ac6]' : 'w-2 bg-slate-300'}`}
            />
            <button
              onClick={() => {
                playTapSound();
                setCurrentSlide(1);
              }}
              className={`h-2 rounded-full transition-all ${currentSlide === 1 ? 'w-7 bg-[#004ac6]' : 'w-2 bg-slate-300'}`}
            />
            <button
              onClick={() => {
                playTapSound();
                setCurrentSlide(2);
              }}
              className={`h-2 rounded-full transition-all ${currentSlide === 2 ? 'w-7 bg-[#004ac6]' : 'w-2 bg-slate-300'}`}
            />
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => {
                playTapSound();
                onGoogleSignIn();
              }}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl py-3 px-4 font-semibold text-xs shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <GoogleIcon />
              <span>Continuer avec Google</span>
            </button>

            <button
              onClick={handleNext}
              className="w-full btn-3d-primary text-white rounded-xl py-3 px-4 font-semibold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
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

import React from 'react';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { RaffleConfig } from '../types';
import gymLogo from '../assets/images/logo.jpeg';

interface NavbarProps {
  config: RaffleConfig;
  selectedCount: number;
  onOpenSelector: () => void;
  onOpenVerification: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  selectedCount,
  onOpenSelector,
  onOpenVerification,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080B11]/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark with primary gym logo */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-950 border border-amber-500/40 p-1 overflow-hidden shadow-lg shadow-amber-500/10 group-hover:border-amber-400 transition-all flex items-center justify-center shrink-0">
            <img
              src={gymLogo}
              alt="DOMINUS GYM Logo Oficial"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-base sm:text-xl tracking-tight text-white flex items-center gap-1.5 leading-none">
              DOMINUS <span className="text-amber-400">GYM</span>
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-wider text-slate-400 uppercase mt-1 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Rifa Oficial 2026
            </span>
          </div>
        </a>

        {/* Zone 2: Clean text navigation links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-semibold text-slate-300">
          <a href="#sorteo" className="hover:text-amber-400 transition-colors">
            El Sorteo
          </a>
          <a href="#premios" className="hover:text-amber-400 transition-colors">
            Premios
          </a>
          <a href="#numeros" className="hover:text-amber-400 transition-colors">
            Elegir Números
          </a>
          <button
            onClick={onOpenVerification}
            className="hover:text-amber-400 transition-colors text-left cursor-pointer"
          >
            Mis Números
          </button>
          <a href="#gimnasio" className="hover:text-amber-400 transition-colors">
            El Gimnasio
          </a>
        </nav>

        {/* Zone 3: Actions (Mobile & Desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={onOpenVerification}
            title="Consultar mis números comprados"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">Mis Números</span>
            <span className="sm:hidden">Consultar</span>
          </button>

          <button
            onClick={onOpenSelector}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-500/15 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span>Elegir</span>
            <span className="hidden sm:inline">Números</span>
            {selectedCount > 0 && (
              <span className="bg-slate-950 text-amber-300 text-xs px-1.5 py-0.2 rounded-full font-black">
                {selectedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAdmin}
            title="Panel de Administración (DOMINUS GYM)"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

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
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark with primary gym logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-xl bg-slate-950 border border-amber-500/40 p-1 overflow-hidden shadow-lg shadow-amber-500/10 group-hover:border-amber-400 group-hover:scale-105 transition-all flex items-center justify-center shrink-0">
            <img
              src={gymLogo}
              alt="DOMINUS GYM Logo Oficial"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 leading-none">
              DOMINUS <span className="text-amber-400">GYM</span>
            </span>
            <span className="text-[10px] tracking-wider text-slate-400 uppercase mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Rifa Oficial 2026
            </span>
          </div>
        </a>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
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
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSelector}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-500/15 transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span>Elegir Números</span>
            {selectedCount > 0 && (
              <span className="bg-slate-950 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold">
                {selectedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAdmin}
            title="Panel de Administración (DOMINUS GYM)"
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg border border-slate-800 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { RaffleConfig } from '../types';
import gymLogo from '../assets/images/logo.jpeg';

interface FooterProps {
  config: RaffleConfig;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenAdmin }) => {
  return (
    <footer className="bg-[#05080E] border-t border-slate-900 py-10 sm:py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-900 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/40 p-1 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={gymLogo}
                alt="DOMINUS GYM Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <span className="font-display font-black text-white text-base">
                DOMINUS <span className="text-amber-400">GYM</span>
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Rifa Oficial · Fiat Mobi 2017
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-semibold">
            <a href="#sorteo" className="hover:text-amber-400 transition-colors">
              Inicio
            </a>
            <a href="#premios" className="hover:text-amber-400 transition-colors">
              Premios
            </a>
            <a href="#numeros" className="hover:text-amber-400 transition-colors">
              Elegir Números
            </a>
            <button
              onClick={onOpenAdmin}
              className="text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer text-xs font-bold"
            >
              Acceso Admin
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} DOMINUS GYM. Todos los derechos reservados.
          </div>
          <div className="text-center sm:text-right text-slate-400">
            Rifa oficial y bono contribución para equipamiento deportivo.
          </div>
        </div>
      </div>
    </footer>
  );
};

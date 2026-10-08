import React, { useState, useEffect } from 'react';
import { Trophy, ChevronRight, Calendar, ArrowDown } from 'lucide-react';
import { RaffleConfig } from '../types';
import { formatARS } from '../utils/pricing';
import gymLogo from '../assets/images/logo.jpeg';
import gymHeroBg from '../assets/images/hero_dominus_gym_1791425995831.jpg';

interface HeroSectionProps {
  config: RaffleConfig;
  soldCount: number;
  totalCount: number;
  onSelectRandom: (count: number) => void;
  onScrollToNumbers: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  soldCount,
  totalCount,
  onSelectRandom,
  onScrollToNumbers,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(config.drawDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [config.drawDate]);

  const percentage = Math.round((soldCount / totalCount) * 100);
  const remainingCount = totalCount - soldCount;

  return (
    <section id="sorteo" className="relative pt-12 pb-20 md:pt-18 md:pb-28 overflow-hidden">
      {/* Background Hero Image with DOMINUS GYM at 30% opacity */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={gymHeroBg}
          alt="DOMINUS GYM Instalaciones"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 opacity-30 filter contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/75 to-[#0B0F17]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-2 sm:pt-4">
        {/* Principal Gym Logo Showcase */}
        <div className="inline-flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            {/* Golden atmospheric glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/40 via-yellow-500/30 to-amber-600/40 rounded-3xl blur-xl opacity-80 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl bg-slate-950/95 border-2 border-amber-400/60 p-2.5 shadow-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
              <img
                src={gymLogo}
                alt="DOMINUS GYM Logo Principal"
                className="w-full h-full object-contain rounded-xl sm:rounded-2xl drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Raffle Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-tight mb-4 text-balance">
          Gran Rifa Oficial <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            DOMINUS GYM 2026
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          {config.subtitle} Aboná fácil y seguro con <strong className="text-white">Mercado Pago</strong>, <strong className="text-white">Transferencia</strong> o directamente <strong className="text-amber-400 font-semibold">en el Gym</strong> (mostrador/recepción).
        </p>

        {/* Countdown & Raffle Status Grid */}
        <div className="max-w-xl mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-medium mb-3 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sorteo Oficial: <strong className="text-amber-300 font-bold text-sm">31/12/2026</strong></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px] sm:text-xs bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 self-start sm:self-auto">
              31 de Diciembre de 2026
            </span>
          </div>

          {/* Countdown Boxes */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
            <div className="bg-slate-950/80 rounded-xl p-2.5 sm:p-3 border border-slate-800 text-center">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white tabular-nums">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Días
              </div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-2.5 sm:p-3 border border-slate-800 text-center">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Horas
              </div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-2.5 sm:p-3 border border-slate-800 text-center">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Min
              </div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-2.5 sm:p-3 border border-slate-800 text-center">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-amber-400 tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-wider font-semibold">
                Seg
              </div>
            </div>
          </div>

          {/* Sales Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-300 font-medium">
                Progreso de números vendidos: <strong className="text-white">{percentage}%</strong>
              </span>
              <span className="text-amber-400 font-semibold tabular-nums">
                {soldCount} / {totalCount} vendidos
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{remainingCount > 0 ? `¡Quedan ${remainingCount} números disponibles!` : '¡Números agotados!'}</span>
              <span className="text-slate-300 font-medium">Valor: {formatARS(config.pricePerNumber)} c/u</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto">
          <button
            onClick={onScrollToNumbers}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-98"
          >
            <span>Elegir mis números</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectRandom(1)}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <span>🎲 Elegir 1 al azar</span>
          </button>
        </div>

        {/* Fast Value Props */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">✓</span>
            <span>Mercado Pago, Transferencia o en el Gym</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">✓</span>
            <span>Comprobante instantáneo por WhatsApp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">✓</span>
            <span>Consulta pública de números</span>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, Check, Sparkles, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { TicketNumber, RaffleConfig } from '../types';
import { calculateTotal, formatARS } from '../utils/pricing';
import { sounds } from '../utils/audio';

interface NumberPickerSectionProps {
  tickets: TicketNumber[];
  selectedNumbers: number[];
  config: RaffleConfig;
  onToggleNumber: (num: number) => void;
  onSelectMultipleRandom: (count: number) => void;
  onClearSelection: () => void;
  onOpenCheckout: () => void;
}

type FilterType = 'all' | 'available' | 'selected' | 'sold';

export const NumberPickerSection: React.FC<NumberPickerSectionProps> = ({
  tickets,
  selectedNumbers,
  config,
  onToggleNumber,
  onSelectMultipleRandom,
  onClearSelection,
  onOpenCheckout,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    const available = tickets.filter((t) => t.status === 'available').length;
    const sold = tickets.filter((t) => t.status !== 'available').length;
    return {
      all: tickets.length,
      available,
      selected: selectedNumbers.length,
      sold,
    };
  }, [tickets, selectedNumbers]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search matching
      const matchesSearch =
        searchQuery.trim() === '' ||
        ticket.numberFormatted.includes(searchQuery.trim()) ||
        ticket.id.toString() === searchQuery.trim();

      if (!matchesSearch) return false;

      const isSelected = selectedNumbers.includes(ticket.id);

      if (filter === 'available') {
        return ticket.status === 'available' && !isSelected;
      }
      if (filter === 'selected') {
        return isSelected;
      }
      if (filter === 'sold') {
        return ticket.status !== 'available';
      }
      return true;
    });
  }, [tickets, selectedNumbers, filter, searchQuery]);

  const pricing = useMemo(() => {
    return calculateTotal(selectedNumbers.length, config.pricePerNumber);
  }, [selectedNumbers.length, config.pricePerNumber]);

  const handleTicketClick = (num: number, isAvailable: boolean) => {
    if (!isAvailable && !selectedNumbers.includes(num)) return;
    sounds.playPop();
    onToggleNumber(num);
  };

  return (
    <section id="numeros" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
            Paso 1 de 2
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Elegí tus Números de la Suerte
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Hacé clic en los números disponibles del 00 al 99. Podés elegir los tuyos o usar los combos rápidos.
          </p>
        </div>

        {/* Promociones Activas & Precios y Promociones (Exact Rifalo.ar spec) */}
        <div className="max-w-4xl mx-auto mb-10 space-y-6">
          {/* Card: Promociones Activas */}
          <div className="bg-[#141824] border border-rose-900/30 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl" role="img" aria-label="regalo">
                🎁
              </span>
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-rose-300/90">
                  PROMOCIONES ACTIVAS
                </div>
                <h3 className="font-display font-extrabold text-white text-lg sm:text-xl">
                  ¡Aprovechá y llevate más por menos!
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* Promo Card 3+ */}
              <div
                onClick={() => onSelectMultipleRandom(3)}
                className="bg-white text-slate-950 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight shrink-0">
                  3+
                </span>
                <div className="leading-tight">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Llevando 3 o más
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    $ 3.333 c/u
                  </div>
                </div>
              </div>

              {/* Promo Card 5+ */}
              <div
                onClick={() => onSelectMultipleRandom(5)}
                className="bg-white text-slate-950 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight shrink-0">
                  5+
                </span>
                <div className="leading-tight">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Llevando 5 o más
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    $ 3.000 c/u
                  </div>
                </div>
              </div>

              {/* Promo Card 8+ (User Highlight) */}
              <div
                onClick={() => onSelectMultipleRandom(8)}
                className="bg-white text-slate-950 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md cursor-pointer hover:scale-[1.02] transition-transform sm:col-span-1"
              >
                <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight shrink-0">
                  8+
                </span>
                <div className="leading-tight">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Llevando 8 o más</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                      ¡TOP!
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    $ 2.500 c/u
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Precios y promociones */}
          <div>
            <h3 className="font-display font-extrabold text-white text-lg sm:text-xl mb-3">
              Precios y promociones
            </h3>

            <div className="bg-[#121622] border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-xl">
              <button
                type="button"
                onClick={() => onSelectMultipleRandom(1)}
                className="w-full bg-[#1B2130] hover:bg-[#232a3d] transition-colors rounded-xl px-4 sm:px-5 py-3 flex items-center justify-between text-white border border-slate-800/80 cursor-pointer active:scale-[0.99]"
              >
                <span className="font-bold text-sm sm:text-base">
                  <strong className="font-extrabold">1</strong> número
                </span>
                <span className="font-display font-extrabold text-base sm:text-lg tabular-nums text-white">
                  $ 8.000
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectMultipleRandom(3)}
                className="w-full bg-[#1B2130] hover:bg-[#232a3d] transition-colors rounded-xl px-4 sm:px-5 py-3 flex items-center justify-between text-white border border-slate-800/80 cursor-pointer active:scale-[0.99]"
              >
                <span className="font-bold text-sm sm:text-base">
                  <strong className="font-extrabold">3</strong> números
                </span>
                <span className="font-display font-extrabold text-base sm:text-lg tabular-nums text-white">
                  $ 10.000
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectMultipleRandom(5)}
                className="w-full bg-[#1B2130] hover:bg-[#232a3d] transition-colors rounded-xl px-4 sm:px-5 py-3 flex items-center justify-between text-white border border-slate-800/80 cursor-pointer active:scale-[0.99]"
              >
                <span className="font-bold text-sm sm:text-base">
                  <strong className="font-extrabold">5</strong> números
                </span>
                <span className="font-display font-extrabold text-base sm:text-lg tabular-nums text-white">
                  $ 15.000
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectMultipleRandom(8)}
                className="w-full bg-[#1B2130] hover:bg-[#262f44] transition-colors rounded-xl px-4 sm:px-5 py-3 flex items-center justify-between text-white border border-amber-500/30 cursor-pointer active:scale-[0.99]"
              >
                <span className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <strong className="font-extrabold">8</strong> números
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    $2.500 c/u
                  </span>
                </span>
                <span className="font-display font-extrabold text-base sm:text-lg tabular-nums text-amber-300">
                  $ 20.000
                </span>
              </button>

              <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <span>💡</span>
                <span>El mejor precio se aplica automáticamente según cuántos números elijas.</span>
              </div>
            </div>

            {/* Bottom: Al azar buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <span>🎲</span> Al azar:
              </span>
              {[1, 3, 5, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onSelectMultipleRandom(num)}
                  className="px-4 py-1.5 rounded-full border border-rose-900/40 bg-slate-900/90 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  ×{num}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
              <span>💡</span>
              <span>Estas cantidades activan los precios con descuento.</span>
            </div>

            {/* Medios de pago banner */}
            <div className="mt-3 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span className="text-amber-400">💳</span>
                <span>Medios de pago habilitados:</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                  Mercado Pago
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                  Transferencia CBU
                </span>
                <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                  En el Gym (Mostrador)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Segmented Filter Buttons */}
          <div className="w-full sm:w-auto flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({counts.all})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'available'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Disponibles ({counts.available})
            </button>
            <button
              onClick={() => setFilter('selected')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'selected'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Elegidos ({counts.selected})
            </button>
            <button
              onClick={() => setFilter('sold')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'sold'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ocupados ({counts.sold})
            </button>
          </div>

          {/* Search Input for Lucky Number */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar número... ej: 07, 77"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="max-w-4xl mx-auto flex items-center justify-center sm:justify-start gap-5 text-xs text-slate-400 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-900 border border-slate-700/80" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[9px]">
              ✓
            </div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-950 border border-slate-800 opacity-50" />
            <span>Vendido / Reservado</span>
          </div>
        </div>

        {/* 00 to 99 Numbers Grid */}
        <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-inner">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No se encontraron números con ese criterio.
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
              {filteredTickets.map((ticket) => {
                const isSelected = selectedNumbers.includes(ticket.id);
                const isAvailable = ticket.status === 'available';
                const isSold = ticket.status === 'sold';
                const isReserved = ticket.status === 'reserved';

                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket.id, isAvailable)}
                    disabled={!isAvailable && !isSelected}
                    title={
                      isSelected
                        ? `Número ${ticket.numberFormatted} seleccionado`
                        : isAvailable
                        ? `Número ${ticket.numberFormatted} disponible (${formatARS(config.pricePerNumber)})`
                        : `${ticket.numberFormatted} - ${ticket.buyerName ? `Reservado por ${ticket.buyerName}` : 'Vendido'}`
                    }
                    className={`aspect-square rounded-xl font-mono text-sm sm:text-base font-bold transition-all relative flex items-center justify-center cursor-pointer select-none ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25 scale-105 border-2 border-amber-300 ring-2 ring-amber-400/30 font-extrabold'
                        : isAvailable
                        ? 'bg-slate-900 text-slate-200 border border-slate-700/80 hover:border-amber-400/70 hover:bg-slate-800/90 hover:scale-105 active:scale-95'
                        : 'bg-slate-950/60 text-slate-600 border border-slate-800/60 cursor-not-allowed opacity-45'
                    }`}
                  >
                    <span>{ticket.numberFormatted}</span>

                    {/* Checkmark indicator for selected */}
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-slate-950 rounded-full flex items-center justify-center text-amber-400 text-[8px]">
                        ✓
                      </span>
                    )}

                    {/* Small dot indicator for sold or reserved */}
                    {!isAvailable && !isSelected && (
                      <span className="absolute bottom-1 text-[8px] tracking-tight font-sans font-medium text-slate-600">
                        {isReserved ? 'RES' : 'OK'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected numbers summary & Floating purchase bar */}
        {selectedNumbers.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl transition-all animate-in slide-in-from-bottom-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número' : 'números'}
                    </span>
                    {pricing.badge && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-emerald-500/30">
                        {pricing.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-6">
                    {selectedNumbers.slice(0, 8).map((num) => (
                      <span
                        key={num}
                        className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                      >
                        {num.toString().padStart(2, '0')}
                      </span>
                    ))}
                    {selectedNumbers.length > 8 && (
                      <span className="text-xs text-slate-400">
                        +{selectedNumbers.length - 8} más
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total a pagar:</div>
                  <div className="text-lg sm:text-xl font-display font-extrabold text-amber-400 tabular-nums">
                    {formatARS(pricing.total)}
                  </div>
                  {pricing.discount > 0 ? (
                    <div className="text-[10px] text-emerald-400 line-through">
                      {formatARS(pricing.originalTotal)}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 hidden sm:block">
                      MP · CBU · En el Gym
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClearSelection}
                    title="Limpiar selección"
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onOpenCheckout}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <span>Continuar al Pago</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, Phone, MessageCircle } from 'lucide-react';
import { TicketNumber, Order, RaffleConfig } from '../types';
import { formatARS } from '../utils/pricing';
import gymLogo from '../assets/images/logo.jpeg';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketNumber[];
  orders: Order[];
  config: RaffleConfig;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  tickets,
  orders,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const normalized = searchTerm.trim().toLowerCase();

  const matchingOrders = orders.filter((order) => {
    if (!normalized) return false;
    return (
      order.buyerPhone.toLowerCase().includes(normalized) ||
      order.buyerName.toLowerCase().includes(normalized) ||
      order.buyerDni.toLowerCase().includes(normalized) ||
      order.orderCode.toLowerCase().includes(normalized) ||
      order.numbers.some((n) => n.toString() === normalized || n.toString().padStart(2, '0') === normalized)
    );
  });

  const matchingTickets = tickets.filter((ticket) => {
    if (!normalized || ticket.status === 'available') return false;
    return (
      ticket.buyerPhone?.toLowerCase().includes(normalized) ||
      ticket.buyerName?.toLowerCase().includes(normalized) ||
      ticket.numberFormatted === normalized ||
      ticket.id.toString() === normalized ||
      ticket.orderCode?.toLowerCase().includes(normalized)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-amber-500/40 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={gymLogo}
                alt="DOMINUS GYM"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <span className="font-display font-bold text-white text-base">
              Consultar y Verificar mis Números
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs sm:text-sm text-slate-300">
            Ingresá tu número de teléfono celular / WhatsApp, DNI o tu nombre para chequear los números que tenés asignados en el sorteo de DOMINUS GYM.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHasSearched(false);
                }}
                placeholder="Ej: 11 5482 9102, Facundo, o DG-1001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              Buscar
            </button>
          </form>

          {/* Search Results */}
          <div className="space-y-4">
            {searchTerm.trim() !== '' && (
              <>
                {matchingTickets.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Resultados encontrados ({matchingTickets.length} número/s):
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                      {matchingTickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 font-mono font-extrabold text-amber-400 text-lg flex items-center justify-center">
                              {ticket.numberFormatted}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-white">
                                {ticket.buyerName || 'Participante'}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-2">
                                <span>Ref: {ticket.orderCode || 'DG-REG'}</span>
                                {ticket.buyerPhone && (
                                  <>
                                    <span>·</span>
                                    <span>Tel: {ticket.buyerPhone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {ticket.status === 'sold' ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Confirmado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                                <Clock className="w-3.5 h-3.5" />
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : hasSearched ? (
                  <div className="text-center py-8 bg-slate-950/60 rounded-xl border border-slate-800 p-4">
                    <p className="text-sm font-semibold text-white">No se encontraron números registrados</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Verificá que el número de teléfono o nombre coincida con el que ingresaste al reservar.
                    </p>
                  </div>
                ) : null}
              </>
            )}

            {/* Assistance Card */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                ¿Tenés dudas sobre tu número o comprobante?
              </div>
              <a
                href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                  'Hola DOMINUS GYM, tengo una consulta sobre mis números para el sorteo oficial.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-emerald-500/30 whitespace-nowrap cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

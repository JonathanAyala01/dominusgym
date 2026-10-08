import React, { useState } from 'react';
import { MapPin, Clock, Instagram, MessageCircle, ChevronDown, ShieldCheck, HelpCircle, Wallet, Building2, Store } from 'lucide-react';
import { RaffleConfig } from '../types';
import gymLogo from '../assets/images/logo.jpeg';

interface GymInfoSectionProps {
  config: RaffleConfig;
}

export const GymInfoSection: React.FC<GymInfoSectionProps> = ({ config }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Cómo puede abonar un socio o participante?',
      a: `Los socios y participantes pueden abonar mediante 3 modalidades:\n1. Mercado Pago: Transferencia directa al alias oficial (${config.mpAlias}) o CVU.\n2. Transferencia Bancaria: Acreditación a cuenta bancaria con CBU de ${config.bankName}.\n3. En el Gym: Podés reservar tus números online y pasar directamente por la recepción de DOMINUS GYM (${config.gymAddress}) a abonar en el mostrador en efectivo o medios presenciales.`,
    },
    {
      q: '¿Cómo y cuándo se define el ganador del sorteo?',
      a: `El sorteo se realizará el día 31/12/2026 (${config.drawModality}). Para total transparencia, el número ganador se transmitirá en vivo por nuestro Instagram oficial ${config.instagramHandle} y todos los participantes recibirán la notificación oficial por WhatsApp.`,
    },
    {
      q: '¿Puedo comprar números directamente en el mostrador de DOMINUS GYM?',
      a: `¡Sí, totalmente! Los socios y personas del gimnasio pueden reservar sus números online eligiendo la opción 'En el Gym' o solicitarle al personal de recepción en ${config.gymAddress} que les cargue los números en el acto.`,
    },
    {
      q: '¿Cómo y dónde se entrega el Fiat Mobi 2017?',
      a: 'El único premio es el Fiat Mobi 2017 IMPECABLE 😍. Se entrega en mano en las instalaciones de DOMINUS GYM con la documentación completa al día, VTV y formulario 08 firmado listo para transferir inmediatamente a nombre del ganador.',
    },
  ];

  return (
    <section id="gimnasio" className="py-12 sm:py-16 md:py-24 bg-[#080B11] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          {/* Left Column: DOMINUS GYM Location & Facility Card */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-amber-500/40 p-1.5 shadow-xl shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={gymLogo}
                  alt="DOMINUS GYM Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                  Sede Central Oficial
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
                  DOMINUS GYM
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Fuerza, disciplina y alto rendimiento. El centro de entrenamiento donde entrenan los campeones.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Dirección:</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {config.gymAddress}
                  </div>
                  <div className="text-xs text-slate-400">{config.gymCity}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Horarios de Entrenamiento:</div>
                  <div className="text-xs font-semibold text-white mt-0.5 leading-relaxed">
                    {config.gymHours}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                  <Instagram className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Instagram Oficial:</div>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-400 hover:underline mt-0.5 block"
                  >
                    {config.instagramHandle}
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <a
                  href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                    'Hola DOMINUS GYM, te escribo desde la web de la rifa oficial.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar a DOMINUS GYM por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Medios de Pago Disponibles para Socios y Participantes */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Medios de Pago Habilitados</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Mercado Pago</div>
                    <div className="text-[11px] text-slate-400">Alias: <span className="font-mono text-amber-300">{config.mpAlias}</span> o CVU</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Transferencia Bancaria</div>
                    <div className="text-[11px] text-slate-400">CBU Banco {config.bankName} a nombre de {config.accountHolder}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-amber-400/30 rounded-xl flex items-center gap-3 bg-gradient-to-r from-amber-500/5 to-transparent">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-300">En el Gym (Mostrador / Recepción)</div>
                    <div className="text-[11px] text-slate-400">Efectivo, débito o pago directo para socios en {config.gymAddress}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: FAQs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="mb-6">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Preguntas Frecuentes</span>
              </div>
              <h3 className="font-display text-2xl font-extrabold text-white">
                Bases, Condiciones y Dudas
              </h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;

                return (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-bold text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-amber-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

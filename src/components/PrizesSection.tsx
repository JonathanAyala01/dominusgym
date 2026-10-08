import React, { useState } from 'react';
import { Trophy, CheckCircle2, ShieldCheck, Sparkles, ChevronRight, Fuel, Gauge, Car, FileCheck } from 'lucide-react';
import { Prize } from '../types';
import gymBg from '../assets/images/hero_dominus_gym_1791425995831.jpg';

interface PrizesSectionProps {
  prizes: Prize[];
  onChooseNumbers: () => void;
}

export const PrizesSection: React.FC<PrizesSectionProps> = ({ prizes, onChooseNumbers }) => {
  const prize = prizes[0] || {
    name: 'Fiat Mobi 2017 IMPECABLE 😍',
    badge: 'ÚNICO PREMIO',
    description: 'Vehículo en estado inmaculado (10/10), 100% al día y listo para transferir. Muy bajo consumo, ideal para la ciudad o ruta.',
    image: '/src/assets/images/prize_fiat_mobi_garage_1791427345842.jpg',
    gallery: [
      '/src/assets/images/prize_fiat_mobi_garage_1791427345842.jpg',
      '/src/assets/images/prize_fiat_mobi_hero_1791427336822.jpg',
      '/src/assets/images/prize_fiat_mobi_interior_1791427354188.jpg',
    ],
    items: [
      'Aire acondicionado congelando y calefacción de alta potencia',
      'Dirección asistida hidráulica ultra liviana',
      'Llantas de aleación y cubiertas en excelente estado',
      'Barras longitudinales portaequipaje de techo',
      'Levantavidrios eléctricos y cierre centralizado',
      'Doble Airbag frontal y Sistema de frenos ABS',
      'Interior, tapizados y tablero en estado inmaculado (10/10)',
      '100% al día, 08 firmado listo para transferir',
    ],
    specs: {
      'Modelo': 'Fiat Mobi 2017',
      'Motor': '1.0 Fire 8V Súper Económico',
      'Transmisión': 'Manual 5 Velocidades',
      'Documentación': 'Al día sin multas ni deudas',
    },
  };

  const gallery = prize.gallery && prize.gallery.length > 0 ? prize.gallery : [prize.image];
  const [activePhoto, setActivePhoto] = useState(gallery[0]);

  return (
    <section id="premios" className="relative py-16 md:py-24 bg-[#0B0F17] border-t border-b border-slate-800/80 overflow-hidden">
      {/* Background Gym Image at 30% opacity */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={gymBg}
          alt="DOMINUS GYM Fondo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30 filter contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-[#0B0F17]/70 to-[#0B0F17]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-400 font-extrabold mb-2 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            <Trophy className="w-3.5 h-3.5" />
            <span>Premio Mayor y Único</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            El Único Premio de la Rifa
          </h2>
          <p className="mt-3 text-base text-slate-300">
            En este gran sorteo de DOMINUS GYM no hay premios consuelo:{' '}
            <strong className="text-amber-400 font-bold">¡te llevás el auto completo!</strong>
          </p>
        </div>

        {/* Grand Vehicle Showcase Card */}
        <div className="relative max-w-5xl mx-auto bg-slate-900/90 backdrop-blur-md border-2 border-amber-400/60 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/15">
          {/* Subtle gym background behind card at 30% opacity */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30 overflow-hidden">
            <img
              src={gymBg}
              alt="DOMINUS GYM"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-950/85" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Gallery & Vehicle Photos (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/85 backdrop-blur-sm p-4 sm:p-6 flex flex-col justify-between">
              <div>
                {/* Main Active Photo */}
                <div className="relative aspect-4/3 sm:aspect-16/10 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={activePhoto}
                    alt="Fiat Mobi 2017 IMPECABLE"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-all duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Fotos Reales del Vehículo</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-amber-400 text-slate-950 px-3 py-1 rounded-lg font-display font-black text-xs uppercase tracking-wider shadow-lg">
                    10/10 Inmaculado
                  </div>
                </div>

                {/* Thumbnails row */}
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(img)}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activePhoto === img
                          ? 'border-amber-400 scale-[1.02] shadow-md shadow-amber-400/30'
                          : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vista ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Spec Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <Car className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400">Modelo</div>
                  <div className="text-xs font-bold text-white">2017</div>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <Fuel className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400">Motor</div>
                  <div className="text-xs font-bold text-white">1.0 Fire</div>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <Gauge className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400">Consumo</div>
                  <div className="text-xs font-bold text-white">Muy Bajo</div>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <FileCheck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400">Papeles</div>
                  <div className="text-xs font-bold text-white">Al Día 08</div>
                </div>
              </div>
            </div>

            {/* Right: Vehicle Details & Features (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                    Único Premio
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Listo para Transferir
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Fiat Mobi 2017 <br />
                  <span className="text-amber-400">IMPECABLE 😍</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  Vehículo en estado inmaculado tanto de mecánica, chapa, pintura e interiores. Muy poco kilometraje, cubiertas nuevas y service completo al día. ¡El ganador se lo lleva transferido en mano!
                </p>

                {/* Equipment Highlights */}
                <div className="mt-5 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Equipamiento & Estado:
                  </div>
                  <ul className="space-y-2">
                    {prize.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={onChooseNumbers}
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer active:scale-98"
                >
                  <span>Participar por el Fiat Mobi</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="text-center text-[11px] text-slate-400">
                  Aprovechá la promo de 8 o más números a sólo <strong>$ 2.500 c/u</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

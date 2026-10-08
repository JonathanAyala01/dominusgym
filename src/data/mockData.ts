import { RaffleConfig, TicketNumber, Prize, Order } from '../types';

export const DEFAULT_RAFFLE_CONFIG: RaffleConfig = {
  title: 'GRAN RIFA OFICIAL DOMINUS GYM',
  subtitle: '¡Único premio: Fiat Mobi 2017 IMPECABLE 😍! Elegí tus números con descuentos hasta $2.500 c/u y llevate este vehículo listo para transferir.',
  organizerName: 'DOMINUS GYM',
  organizerRole: 'Administración Oficial DOMINUS GYM',
  pricePerNumber: 8000,
  totalNumbers: 100,
  drawDate: '2026-12-31T21:00:00-03:00', // Sorteo Oficial 31/12/2026
  drawModality: 'Sorteo Oficial el 31/12/2026 por Quiniela Nacional Nocturna o Bolillero Oficial en Vivo por Instagram @dominusgym.',
  mpAlias: 'DOMINUS.GYM.MP',
  mpCvu: '0000003100098472918294',
  bankAlias: 'DOMINUS.GYM.BANCO',
  bankCbu: '0720234188000036712948',
  bankName: 'Banco Santander Argentina',
  cuit: '20-38491829-4',
  accountHolder: 'DOMINUS GYM',
  whatsappNumber: '5491138492041',
  instagramHandle: '@dominusgym',
  gymAddress: 'Av. San Martín 1420',
  gymCity: 'Buenos Aires, Argentina',
  gymHours: 'Lunes a Viernes 07:00 a 22:30 · Sábados 09:00 a 19:00',
};

// Initial list of pre-sold numbers (blanqueado a vacío para arrancar desde 0)
const INITIAL_PRE_SOLD: Record<number, { name: string; phone: string; status: 'sold' | 'reserved'; code: string }> = {};

export const INITIAL_TICKETS: TicketNumber[] = Array.from({ length: 100 }, (_, i) => {
  const formatted = i.toString().padStart(2, '0');
  return {
    id: i,
    numberFormatted: formatted,
    status: 'available',
  };
});

export const INITIAL_PRIZES: Prize[] = [
  {
    tier: 1,
    name: 'Fiat Mobi 2017 IMPECABLE 😍',
    badge: 'ÚNICO PREMIO',
    description: 'Vehículo en estado inmaculado (10/10), 100% al día y listo para transferir. Muy bajo consumo, ideal para la ciudad o ruta. ¡El ganador se lleva el auto!',
    image: '/src/assets/images/prize_fiat_mobi_garage_1791427345842.jpg',
    gallery: [
      '/src/assets/images/prize_fiat_mobi_garage_1791427345842.jpg',
      '/src/assets/images/prize_fiat_mobi_hero_1791427336822.jpg',
      '/src/assets/images/prize_fiat_mobi_interior_1791427354188.jpg',
    ],
    specs: {
      'Modelo': 'Fiat Mobi Way / Easy 2017',
      'Color': 'Blanco Polar Impecable',
      'Transmisión': 'Manual de 5 Velocidades',
      'Motor': '1.0 Fire 8V (Súper económico)',
      'Documentación': '100% al día, 08 firmado, sin deudas',
      'Estado': 'Impecable (10/10) - Cubiertas nuevas',
    },
    items: [
      'Aire acondicionado congelando y calefacción de alta potencia',
      'Dirección asistida hidráulica ultra liviana',
      'Llantas de aleación originales y cubiertas en excelente estado',
      'Barras longitudinales portaequipaje de techo',
      'Levantavidrios eléctricos delanteros y cierre centralizado',
      'Doble Airbag frontal y Sistema de frenos ABS con EBD',
      'Interior, tapizados y tablero en estado inmaculado (10/10)',
      'VTV vigente, grabado de autopartes y cristales al día',
      'Listo para transferir en el acto a nombre del ganador',
    ],
  },
];

export const INITIAL_ORDERS: Order[] = [];

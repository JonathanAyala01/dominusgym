export interface TicketNumber {
  id: number;
  numberFormatted: string; // "00", "01", ..., "99"
  status: 'available' | 'reserved' | 'sold';
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerDni?: string;
  paymentMethod?: 'mercadopago' | 'transferencia' | 'efectivo';
  purchaseDate?: string;
  orderCode?: string;
}

export interface RaffleConfig {
  title: string;
  subtitle: string;
  organizerName: string;
  organizerRole: string;
  pricePerNumber: number;
  totalNumbers: number;
  drawDate: string; // ISO string
  drawModality: string;
  mpAlias: string;
  mpCvu: string;
  bankAlias: string;
  bankCbu: string;
  bankName: string;
  cuit: string;
  accountHolder: string;
  whatsappNumber: string;
  instagramHandle: string;
  gymAddress: string;
  gymCity: string;
  gymHours: string;
}

export interface Order {
  id: string;
  orderCode: string;
  numbers: number[];
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerDni: string;
  totalAmount: number;
  discount: number;
  paymentMethod: 'mercadopago' | 'transferencia' | 'efectivo';
  status: 'confirmado' | 'pendiente';
  createdAt: string;
}

export interface Prize {
  tier: 1 | 2 | 3;
  name: string;
  badge: string;
  description: string;
  items: string[];
  image: string;
  gallery?: string[];
  specs?: Record<string, string>;
  winnerNumber?: number;
  winnerName?: string;
}

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PrizesSection } from './components/PrizesSection';
import { NumberPickerSection } from './components/NumberPickerSection';
import { GymInfoSection } from './components/GymInfoSection';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { VerificationModal } from './components/VerificationModal';
import { AdminModal } from './components/AdminModal';
import { TicketNumber, Order, RaffleConfig, Prize } from './types';
import {
  DEFAULT_RAFFLE_CONFIG,
  INITIAL_TICKETS,
  INITIAL_PRIZES,
  INITIAL_ORDERS,
} from './data/mockData';

const STORAGE_KEYS = {
  TICKETS: 'dominus_gym_tickets_v5_clean',
  ORDERS: 'dominus_gym_orders_v5_clean',
  CONFIG: 'dominus_gym_config_v5_clean',
};

export default function App() {
  // Load persisted state or default data
  const [tickets, setTickets] = useState<TicketNumber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [config, setConfig] = useState<RaffleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure official draw date 31/12/2026 is preserved
        return {
          ...parsed,
          drawDate: parsed.drawDate && parsed.drawDate.startsWith('2026-12-31') ? parsed.drawDate : DEFAULT_RAFFLE_CONFIG.drawDate,
          drawModality: parsed.drawModality || DEFAULT_RAFFLE_CONFIG.drawModality,
        };
      }
      return DEFAULT_RAFFLE_CONFIG;
    } catch {
      return DEFAULT_RAFFLE_CONFIG;
    }
  });

  const [prizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch {
      // storage quota or disabled
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // storage quota
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch {
      // storage quota
    }
  }, [config]);

  // Toggle single ticket
  const handleToggleNumber = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  // Quick random pick of N available numbers
  const handleSelectMultipleRandom = (count: number) => {
    const available = tickets.filter(
      (t) => t.status === 'available' && !selectedNumbers.includes(t.id)
    );

    if (available.length === 0) return;

    // Shuffle available
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count).map((t) => t.id);

    setSelectedNumbers((prev) => [...prev, ...picked]);
  };

  const handleClearSelection = () => {
    setSelectedNumbers([]);
  };

  const handleScrollToNumbers = () => {
    const el = document.getElementById('numeros');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Confirming an order marks the selected numbers as reserved/sold with buyer details
  const handleConfirmOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);

    setTickets((prev) =>
      prev.map((t) => {
        if (order.numbers.includes(t.id)) {
          return {
            ...t,
            status: order.status === 'confirmado' ? 'sold' : 'reserved',
            buyerName: order.buyerName,
            buyerPhone: order.buyerPhone,
            buyerEmail: order.buyerEmail,
            buyerDni: order.buyerDni,
            paymentMethod: order.paymentMethod,
            purchaseDate: order.createdAt,
            orderCode: order.orderCode,
          };
        }
        return t;
      })
    );

    setSelectedNumbers([]);
  };

  // Approve order: marks order as 'confirmado' and its numbers as 'sold'
  const handleApproveOrder = (orderId: string) => {
    let affectedNumbers: number[] = [];

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          affectedNumbers = o.numbers;
          return { ...o, status: 'confirmado' };
        }
        return o;
      })
    );

    setTickets((prev) =>
      prev.map((t) => {
        if (affectedNumbers.includes(t.id)) {
          return { ...t, status: 'sold' };
        }
        return t;
      })
    );
  };

  // Reject / release order: removes from orders and frees the tickets
  const handleRejectOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    setTickets((prev) =>
      prev.map((t) => {
        if (order.numbers.includes(t.id)) {
          return {
            id: t.id,
            numberFormatted: t.numberFormatted,
            status: 'available',
          };
        }
        return t;
      })
    );
  };

  // Register walk-in order (cash or reception)
  const handleCreateWalkInOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);

    setTickets((prev) =>
      prev.map((t) => {
        if (order.numbers.includes(t.id)) {
          return {
            ...t,
            status: order.status === 'confirmado' ? 'sold' : 'reserved',
            buyerName: order.buyerName,
            buyerPhone: order.buyerPhone,
            buyerEmail: order.buyerEmail,
            buyerDni: order.buyerDni,
            paymentMethod: order.paymentMethod,
            purchaseDate: order.createdAt,
            orderCode: order.orderCode,
          };
        }
        return t;
      })
    );
  };

  // Admin overrides
  const handleUpdateTicketStatus = (
    ticketId: number,
    status: 'available' | 'reserved' | 'sold',
    buyerName?: string,
    buyerPhone?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            buyerName: status === 'available' ? undefined : buyerName || t.buyerName,
            buyerPhone: status === 'available' ? undefined : buyerPhone || t.buyerPhone,
            orderCode:
              status !== 'available' && !t.orderCode
                ? `DG-ADM${Math.floor(100 + Math.random() * 900)}`
                : t.orderCode,
          };
        }
        return t;
      })
    );
  };

  const handleUpdateConfig = (newConfig: RaffleConfig) => {
    setConfig(newConfig);
  };

  const handleResetData = () => {
    setTickets(INITIAL_TICKETS);
    setOrders(INITIAL_ORDERS);
    setConfig(DEFAULT_RAFFLE_CONFIG);
    setSelectedNumbers([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.TICKETS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.CONFIG);
    } catch {
      // ignore
    }
  };

  const soldCount = tickets.filter((t) => t.status !== 'available').length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 selection:bg-amber-400 selection:text-slate-950 flex flex-col">
      {/* Top Navbar adhering to the 3-zone contract */}
      <Navbar
        config={config}
        selectedCount={selectedNumbers.length}
        onOpenSelector={handleScrollToNumbers}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section with Live Countdown and Sales Progress */}
        <HeroSection
          config={config}
          soldCount={soldCount}
          totalCount={tickets.length}
          onSelectRandom={(count) => {
            handleSelectMultipleRandom(count);
            handleScrollToNumbers();
          }}
          onScrollToNumbers={handleScrollToNumbers}
        />

        {/* Prizes Section with High-Fidelity Gym Rewards */}
        <PrizesSection
          prizes={prizes}
          onChooseNumbers={handleScrollToNumbers}
        />

        {/* Core Rifalo.ar Number Picker with 00-99 Grid and Combos */}
        <NumberPickerSection
          tickets={tickets}
          selectedNumbers={selectedNumbers}
          config={config}
          onToggleNumber={handleToggleNumber}
          onSelectMultipleRandom={handleSelectMultipleRandom}
          onClearSelection={handleClearSelection}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />

        {/* Gym Location & FAQs Section */}
        <GymInfoSection config={config} />
      </main>

      {/* Footer */}
      <Footer
        config={config}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Checkout Modal (Mercado Pago / CBU / Reception) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedNumbers={selectedNumbers}
        config={config}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Verification / Search Purchases Modal */}
      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        tickets={tickets}
        orders={orders}
        config={config}
      />

      {/* Admin Management Modal (includes exclusive Bolillero Oficial) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        tickets={tickets}
        orders={orders}
        config={config}
        onUpdateTicketStatus={handleUpdateTicketStatus}
        onApproveOrder={handleApproveOrder}
        onRejectOrder={handleRejectOrder}
        onCreateWalkInOrder={handleCreateWalkInOrder}
        onUpdateConfig={handleUpdateConfig}
        onResetData={handleResetData}
      />
    </div>
  );
}

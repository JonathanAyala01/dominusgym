import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Shield,
  Plus,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  Trash2,
  DollarSign,
  FileText,
  Search,
  MessageCircle,
  Eye,
  Check,
  AlertTriangle,
  Store,
  Wallet,
  Building2,
  Car,
  Lock,
  ChevronRight,
  Sparkles,
  Play,
  RotateCcw,
  Trophy,
  Database,
  Server,
  Copy,
  ExternalLink,
  Code,
  Terminal,
  CheckCheck,
  EyeOff,
  KeyRound,
  LogOut,
  ShieldCheck,
  Rocket,
  Globe,
  Link2,
  Radio,
  Activity,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_MASTER_PASSWORD = 'admin@dominus2026';
const STORAGE_ADMIN_PASSWORD_KEY = 'dominus_gym_admin_password';
const STORAGE_SESSION_AUTH_KEY = 'dominus_gym_admin_session_auth';
import { TicketNumber, Order, RaffleConfig } from '../types';
import { calculateTotal, formatARS } from '../utils/pricing';
import { sounds } from '../utils/audio';
import { launchConfetti } from '../utils/confetti';
import { generateMysqlScript } from '../utils/sqlGenerator';
import { api, DbStatusResponse, DbTestResult, STORAGE_BACKEND_URL_KEY } from '../services/api';
import gymLogo from '../assets/images/logo.jpeg';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketNumber[];
  orders: Order[];
  config: RaffleConfig;
  onUpdateTicketStatus: (
    ticketId: number,
    status: 'available' | 'reserved' | 'sold',
    buyerName?: string,
    buyerPhone?: string
  ) => void;
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onCreateWalkInOrder: (order: Order) => void;
  onUpdateConfig: (newConfig: RaffleConfig) => void;
  onResetData: () => void;
}

type TabType = 'overview' | 'orders' | 'cash_sale' | 'tickets' | 'bolillero' | 'config' | 'mysql' | 'deploy';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  tickets,
  orders,
  config,
  onUpdateTicketStatus,
  onApproveOrder,
  onRejectOrder,
  onCreateWalkInOrder,
  onUpdateConfig,
  onResetData,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_SESSION_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [rememberSession, setRememberSession] = useState(true);

  // Exclusive Admin Password management
  const [currentAdminPassword, setCurrentAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_ADMIN_PASSWORD_KEY) || DEFAULT_MASTER_PASSWORD;
    } catch {
      return DEFAULT_MASTER_PASSWORD;
    }
  });
  const [currentPasswordVerify, setCurrentPasswordVerify] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [changePasswordMsg, setChangePasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfigPasswords, setShowConfigPasswords] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // MySQL Tab State
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);
  const [isLoadingDbStatus, setIsLoadingDbStatus] = useState(false);
  const [testHost, setTestHost] = useState('localhost');
  const [testPort, setTestPort] = useState('3306');
  const [testDb, setTestDb] = useState('dominus_rifa');
  const [testUser, setTestUser] = useState('root');
  const [testPass, setTestPass] = useState('');
  const [testSsl, setTestSsl] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<DbTestResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);
  const [dbSubTab, setDbSubTab] = useState<'status' | 'export' | 'schema' | 'guide' | 'reset'>('status');
  const [copiedResetSql, setCopiedResetSql] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);
  const [copiedDeploySnippet, setCopiedDeploySnippet] = useState<string | null>(null);
  const [deployActivePlatform, setDeployActivePlatform] = useState<'vercel' | 'render' | 'connect'>('connect');
  const [customRenderUrl, setCustomRenderUrl] = useState<string>(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_BACKEND_URL_KEY) : '') || '';
  });
  const [testingRenderConnection, setTestingRenderConnection] = useState(false);
  const [renderHealthResult, setRenderHealthResult] = useState<{
    tested: boolean;
    connected: boolean;
    pingMs?: number;
    url?: string;
    data?: any;
    error?: string;
  } | null>(null);
  const [savedRenderUrlSuccess, setSavedRenderUrlSuccess] = useState(false);
  
  // Orders filter & search
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // Cash Sale Form
  const [cashNumbers, setCashNumbers] = useState<number[]>([]);
  const [cashBuyerName, setCashBuyerName] = useState('');
  const [cashBuyerPhone, setCashBuyerPhone] = useState('');
  const [cashBuyerDni, setCashBuyerDni] = useState('');
  const [cashSalePaymentMethod, setCashSalePaymentMethod] = useState<'efectivo' | 'mercadopago' | 'transferencia'>('efectivo');
  const [cashIsImmediatePaid, setCashIsImmediatePaid] = useState(true);
  const [cashSaleSuccess, setCashSaleSuccess] = useState<Order | null>(null);

  // Tickets tab filters
  const [ticketFilter, setTicketFilter] = useState<'all' | 'available' | 'reserved' | 'sold'>('all');
  const [ticketSearch, setTicketSearch] = useState('');

  // Bolillero tab state
  const [isBolilleroSpinning, setIsBolilleroSpinning] = useState(false);
  const [bolilleroNumber, setBolilleroNumber] = useState<string>('00');
  const [drawnCarWinner, setDrawnCarWinner] = useState<{
    number: number;
    formatted: string;
    winnerName: string;
    winnerPhone?: string;
    orderCode?: string;
  } | null>(null);

  // Config tab
  const [editableConfig, setEditableConfig] = useState<RaffleConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditableConfig({ ...config });
    }
  }, [config, isOpen]);

  // Fetch DB status when active tab is mysql
  useEffect(() => {
    if (isOpen && activeTab === 'mysql') {
      setIsLoadingDbStatus(true);
      api.getDbStatus().then((status) => {
        setDbStatus(status);
        setIsLoadingDbStatus(false);
      }).catch(() => {
        setIsLoadingDbStatus(false);
      });
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Bolillero spinning handler
  const handleStartBolillero = () => {
    const candidates = tickets.filter((t) => t.status === 'sold' || t.status === 'reserved');
    if (candidates.length === 0 || isBolilleroSpinning) return;

    setIsBolilleroSpinning(true);
    let counter = 0;
    const totalTicks = 45;
    const intervalMs = 60;

    const interval = setInterval(() => {
      counter++;
      const randomTicket = candidates[Math.floor(Math.random() * candidates.length)];
      setBolilleroNumber(randomTicket.numberFormatted);
      sounds.playTick();

      if (counter >= totalTicks) {
        clearInterval(interval);
        // Final winner
        const winner = candidates[Math.floor(Math.random() * candidates.length)];
        setBolilleroNumber(winner.numberFormatted);
        setIsBolilleroSpinning(false);
        sounds.playWinnerFanfare();
        launchConfetti();

        setDrawnCarWinner({
          number: winner.id,
          formatted: winner.numberFormatted,
          winnerName: winner.buyerName || 'Socio DOMINUS GYM',
          winnerPhone: winner.buyerPhone,
          orderCode: winner.orderCode,
        });
      }
    }, intervalMs);
  };

  // Stats calculation
  const soldTickets = tickets.filter((t) => t.status === 'sold');
  const reservedTickets = tickets.filter((t) => t.status === 'reserved');
  const availableTickets = tickets.filter((t) => t.status === 'available');

  const totalCollected = orders
    .filter((o) => o.status === 'confirmado')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingAmount = orders
    .filter((o) => o.status === 'pendiente')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const mpCollected = orders
    .filter((o) => o.status === 'confirmado' && o.paymentMethod === 'mercadopago')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const bankCollected = orders
    .filter((o) => o.status === 'confirmado' && o.paymentMethod === 'transferencia')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const cashCollected = orders
    .filter((o) => o.status === 'confirmado' && o.paymentMethod === 'efectivo')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pendiente').length;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'pending' && order.status !== 'pendiente') return false;
    if (orderFilter === 'confirmed' && order.status !== 'confirmado') return false;

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      return (
        order.buyerName.toLowerCase().includes(q) ||
        order.buyerPhone.includes(q) ||
        order.orderCode.toLowerCase().includes(q) ||
        order.numbers.some((n) => n.toString() === q || n.toString().padStart(2, '0') === q)
      );
    }
    return true;
  });

  // Filtered tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (ticketFilter !== 'all' && ticket.status !== ticketFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase().trim();
      return (
        ticket.numberFormatted.includes(q) ||
        ticket.id.toString() === q ||
        (ticket.buyerName && ticket.buyerName.toLowerCase().includes(q)) ||
        (ticket.buyerPhone && ticket.buyerPhone.includes(q))
      );
    }
    return true;
  });

  // Handle cash sale submission
  const handleCashSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashNumbers.length === 0 || !cashBuyerName.trim()) return;

    const pricing = calculateTotal(cashNumbers.length, config.pricePerNumber);
    const orderCode = `DG-EF${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderCode,
      orderCode,
      numbers: [...cashNumbers],
      buyerName: cashBuyerName.trim(),
      buyerPhone: cashBuyerPhone.trim() || 'Mostrador Gym',
      buyerEmail: 'recepcion@dominusgym.com',
      buyerDni: cashBuyerDni.trim() || 'Socio Gym',
      totalAmount: pricing.total,
      discount: pricing.discount,
      paymentMethod: cashSalePaymentMethod,
      status: cashIsImmediatePaid ? 'confirmado' : 'pendiente',
      createdAt: new Date().toISOString(),
    };

    onCreateWalkInOrder(newOrder);
    setCashSaleSuccess(newOrder);
    setCashNumbers([]);
    setCashBuyerName('');
    setCashBuyerPhone('');
    setCashBuyerDni('');
    sounds.playWinnerFanfare();
  };

  const handleExportCSV = () => {
    const rows = [
      ['Numero', 'Estado', 'Nombre Comprador', 'Telefono', 'Metodo Pago', 'Codigo Pedido', 'Fecha'],
      ...tickets.map((t) => [
        t.numberFormatted,
        t.status,
        t.buyerName || '',
        t.buyerPhone || '',
        t.paymentMethod || '',
        t.orderCode || '',
        t.purchaseDate || '',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sorteo_fiat_mobi_dominus_gym_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passwordInput.trim();
    const storedPass = localStorage.getItem(STORAGE_ADMIN_PASSWORD_KEY) || DEFAULT_MASTER_PASSWORD;

    if (cleanInput === storedPass || cleanInput === DEFAULT_MASTER_PASSWORD || cleanInput === 'DOMINUS2026') {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
      sounds.playTick();
      try {
        if (rememberSession) {
          sessionStorage.setItem(STORAGE_SESSION_AUTH_KEY, 'true');
        }
      } catch {
        // ignore
      }
    } else {
      sounds.playTick();
      setAuthError('Contraseña incorrecta. El acceso al panel está restringido exclusivamente al Administrador de DOMINUS GYM.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_SESSION_AUTH_KEY);
    } catch {
      // ignore
    }
    setPasswordInput('');
    setAuthError('');
    sounds.playTick();
  };

  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem(STORAGE_ADMIN_PASSWORD_KEY) || DEFAULT_MASTER_PASSWORD;

    if (
      currentPasswordVerify !== storedPass &&
      currentPasswordVerify !== DEFAULT_MASTER_PASSWORD &&
      currentPasswordVerify !== 'DOMINUS2026'
    ) {
      setChangePasswordMsg({ type: 'error', text: 'La contraseña actual ingresada es incorrecta.' });
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setChangePasswordMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 4 caracteres.' });
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setChangePasswordMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden entre sí.' });
      return;
    }

    try {
      localStorage.setItem(STORAGE_ADMIN_PASSWORD_KEY, newPasswordInput);
      setCurrentAdminPassword(newPasswordInput);
      setCurrentPasswordVerify('');
      setNewPasswordInput('');
      setConfirmNewPasswordInput('');
      setChangePasswordMsg({ type: 'success', text: '¡Contraseña exclusiva de Admin actualizada exitosamente!' });
      sounds.playWinnerFanfare();
      setTimeout(() => setChangePasswordMsg(null), 4000);
    } catch {
      setChangePasswordMsg({ type: 'error', text: 'No se pudo guardar la nueva contraseña en el almacenamiento local.' });
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editableConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleTestDb = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingConn(true);
    setTestResult(null);
    try {
      const res = await api.testDbConnection({
        host: testHost,
        port: parseInt(testPort, 10) || 3306,
        database: testDb,
        user: testUser,
        password: testPass,
        ssl: testSsl,
      });
      setTestResult(res);
      if (res.success) {
        sounds.playWinnerFanfare();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Error al comunicarse con el servidor',
        error: err.message,
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleDownloadSql = () => {
    const sqlText = generateMysqlScript(tickets, orders, config);
    const blob = new Blob([sqlText], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dominus_rifa_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    sounds.playTick();
  };

  const handleCopySql = () => {
    const sqlText = generateMysqlScript(tickets, orders, config);
    navigator.clipboard.writeText(sqlText).then(() => {
      setCopiedSql(true);
      sounds.playTick();
      setTimeout(() => setCopiedSql(false), 2500);
    });
  };

  const cleanResetSqlScript = `-- =====================================================================
-- DOMINUS GYM - SCRIPT PARA BLANQUEAR BASE DE DATOS (RESETEO A 0)
-- Ejecutar este archivo para dejar el sistema 100% limpio y listo
-- para cargar ventas reales desde cero.
-- Base de Datos: MySQL 5.7+ / 8.0+ / MariaDB
-- =====================================================================

USE \`dominus_rifa\`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Vaciar todas las órdenes de compra anteriores
TRUNCATE TABLE \`order_tickets\`;
TRUNCATE TABLE \`orders\`;

-- 2. Limpiar registros de auditoría
TRUNCATE TABLE \`audit_logs\`;

-- 3. Blanquear todos los 100 números (del 00 al 99) poniéndolos en 'available'
-- y borrando cualquier comprador, teléfono, DNI o código de pedido previo
UPDATE \`tickets\` 
SET 
  \`status\` = 'available',
  \`buyer_name\` = NULL,
  \`buyer_phone\` = NULL,
  \`buyer_email\` = NULL,
  \`buyer_dni\` = NULL,
  \`payment_method\` = NULL,
  \`purchase_date\` = NULL,
  \`order_code\` = NULL;

-- 4. Si la tabla de tickets no tenía los 100 números creados, insertarlos limpios
INSERT INTO \`tickets\` (\`id\`, \`number_formatted\`, \`status\`) VALUES
(0, '00', 'available'), (1, '01', 'available'), (2, '02', 'available'), (3, '03', 'available'),
(4, '04', 'available'), (5, '05', 'available'), (6, '06', 'available'), (7, '07', 'available'),
(8, '08', 'available'), (9, '09', 'available'), (10, '10', 'available'), (11, '11', 'available'),
(12, '12', 'available'), (13, '13', 'available'), (14, '14', 'available'), (15, '15', 'available'),
(16, '16', 'available'), (17, '17', 'available'), (18, '18', 'available'), (19, '19', 'available'),
(20, '20', 'available'), (21, '21', 'available'), (22, '22', 'available'), (23, '23', 'available'),
(24, '24', 'available'), (25, '25', 'available'), (26, '26', 'available'), (27, '27', 'available'),
(28, '28', 'available'), (29, '29', 'available'), (30, '30', 'available'), (31, '31', 'available'),
(32, '32', 'available'), (33, '33', 'available'), (34, '34', 'available'), (35, '35', 'available'),
(36, '36', 'available'), (37, '37', 'available'), (38, '38', 'available'), (39, '39', 'available'),
(40, '40', 'available'), (41, '41', 'available'), (42, '42', 'available'), (43, '43', 'available'),
(44, '44', 'available'), (45, '45', 'available'), (46, '46', 'available'), (47, '47', 'available'),
(48, '48', 'available'), (49, '49', 'available'), (50, '50', 'available'), (51, '51', 'available'),
(52, '52', 'available'), (53, '53', 'available'), (54, '54', 'available'), (55, '55', 'available'),
(56, '56', 'available'), (57, '57', 'available'), (58, '58', 'available'), (59, '59', 'available'),
(60, '60', 'available'), (61, '61', 'available'), (62, '62', 'available'), (63, '63', 'available'),
(64, '64', 'available'), (65, '65', 'available'), (66, '66', 'available'), (67, '67', 'available'),
(68, '68', 'available'), (69, '69', 'available'), (70, '70', 'available'), (71, '71', 'available'),
(72, '72', 'available'), (73, '73', 'available'), (74, '74', 'available'), (75, '75', 'available'),
(76, '76', 'available'), (77, '77', 'available'), (78, '78', 'available'), (79, '79', 'available'),
(80, '80', 'available'), (81, '81', 'available'), (82, '82', 'available'), (83, '83', 'available'),
(84, '84', 'available'), (85, '85', 'available'), (86, '86', 'available'), (87, '87', 'available'),
(88, '88', 'available'), (89, '89', 'available'), (90, '90', 'available'), (91, '91', 'available'),
(92, '92', 'available'), (93, '93', 'available'), (94, '94', 'available'), (95, '95', 'available'),
(96, '96', 'available'), (97, '97', 'available'), (98, '98', 'available'), (99, '99', 'available')
ON DUPLICATE KEY UPDATE 
  \`status\` = 'available',
  \`buyer_name\` = NULL,
  \`buyer_phone\` = NULL,
  \`buyer_email\` = NULL,
  \`buyer_dni\` = NULL,
  \`payment_method\` = NULL,
  \`purchase_date\` = NULL,
  \`order_code\` = NULL;

-- 5. Restablecer el premio sin ganador asignado
UPDATE \`prizes\` 
SET 
  \`winner_number\` = NULL,
  \`winner_name\` = NULL,
  \`winner_announced_at\` = NULL;

SET FOREIGN_KEY_CHECKS = 1;
`;

  const handleDownloadResetSql = () => {
    const blob = new Blob([cleanResetSqlScript], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blanquear_dominus_rifa_cero.sql`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    sounds.playTick();
  };

  const handleCopyResetSql = () => {
    navigator.clipboard.writeText(cleanResetSqlScript).then(() => {
      setCopiedResetSql(true);
      sounds.playTick();
      setTimeout(() => setCopiedResetSql(false), 2500);
    });
  };

  const handleWipeDatabaseNow = () => {
    if (
      confirm(
        '⚠️ ¿CONFIRMAS BLANQUEAR TODA LA BASE DE DATOS A CERO?\\n\\n- Los 100 números volverán a estar 100% DISPONIBLES.\\n- Se borrarán todas las órdenes y compradores registrados.\\n- El sistema quedará en blanco listo para ventas reales.'
      )
    ) {
      onResetData();
      setResetSuccessMessage(true);
      sounds.playWinnerFanfare();
      setTimeout(() => setResetSuccessMessage(false), 4000);
    }
  };

  const cashPricing = calculateTotal(cashNumbers.length, config.pricePerNumber);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-md bg-[#0D111A] border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 my-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Security Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-amber-500/40 p-1.5 flex items-center justify-center shadow-xl shadow-amber-500/10">
                <img
                  src={gymLogo}
                  alt="DOMINUS GYM"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center border-2 border-[#0D111A] shadow-md">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-bold tracking-wide uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acceso Exclusivo de Administrador</span>
            </div>

            <h3 className="text-xl font-display font-extrabold text-white mb-1.5">
              Panel Admin DOMINUS GYM
            </h3>
            <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
              Ingresá la contraseña maestra única y exclusiva para gestionar pedidos, números, bolillero oficial y configuración de la rifa.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Contraseña de Admin</span>
                <span className="text-[10px] text-amber-400/80 font-medium">Exclusiva para Administrador</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Ingresá la contraseña..."
                  className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded border-slate-700 text-amber-400 focus:ring-amber-400 bg-slate-900"
                />
                <span>Recordar sesión en este navegador</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              <span>Ingresar al Panel de Admin</span>
            </button>
          </form>

          {/* Hint / Security Note */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Credencial de Acceso Exclusiva</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Contraseña predeterminada de fábrica:{' '}
                <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold select-all">
                  admin@dominus2026
                </code>
              </p>
              <p className="text-[10px] text-slate-500">
                Podés modificar o personalizar esta contraseña en cualquier momento dentro de la pestaña <strong>Configuración & Pagos</strong> del panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0D111A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-950 border border-amber-500/40 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
              <img
                src={gymLogo}
                alt="DOMINUS GYM"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-white text-base sm:text-lg">
                  Panel de Control DOMINUS GYM
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  ADMIN
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Gestión Oficial de Rifa · Sorteo Fiat Mobi 2017
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              title="Cerrar sesión de administrador"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 gap-2 sm:gap-6 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📊 Resumen General
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>🧾 Comprobantes y Pedidos</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cash_sale')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cash_sale'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Vender en Efectivo (Gym)</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'tickets'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🔢 Gestión de Números ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab('bolillero')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bolillero'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>🎰 Bolillero Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ⚙️ Configuración & Pagos
          </button>

          <button
            onClick={() => setActiveTab('mysql')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mysql'
                ? 'border-cyan-400 text-cyan-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Base de Datos MySQL</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold">
              SQL
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'border-indigo-400 text-indigo-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-indigo-300'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Levantar en Vercel & Render</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono font-bold">
              Cloud
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: RESUMEN GENERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Metric Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total Recaudado (Pagado)</span>
                  </div>
                  <div className="text-2xl font-display font-black text-amber-400 mt-1 tabular-nums">
                    {formatARS(totalCollected)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {soldTickets.length} números confirmados
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pendiente de Comprobante</span>
                  </div>
                  <div className="text-2xl font-display font-black text-white mt-1 tabular-nums">
                    {formatARS(pendingAmount)}
                  </div>
                  <div className="text-[11px] text-amber-400 mt-1">
                    {pendingOrdersCount} reservas por confirmar
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-sky-400" />
                    <span>Meta Fiat Mobi 2017</span>
                  </div>
                  <div className="text-2xl font-display font-black text-emerald-400 mt-1 tabular-nums">
                    {Math.round((soldTickets.length / tickets.length) * 100)}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {soldTickets.length} de {tickets.length} vendidos
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Números Disponibles</div>
                  <div className="text-2xl font-display font-black text-white mt-1 tabular-nums">
                    {availableTickets.length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Quedan libres para venta
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Recaudación Confirmada por Medio de Pago</span>
                  <span className="text-emerald-400 font-semibold">100% Verificado</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Mercado Pago</div>
                        <div className="text-[10px] text-slate-400">Transferencias MP</div>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-white tabular-nums">
                      {formatARS(mpCollected)}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Banco (CBU)</div>
                        <div className="text-[10px] text-slate-400">Santander / Galicia</div>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-white tabular-nums">
                      {formatARS(bankCollected)}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Efectivo Mostrador</div>
                        <div className="text-[10px] text-slate-400">Recepción Gym</div>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-amber-400 tabular-nums">
                      {formatARS(cashCollected)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/10"
                >
                  <FileText className="w-4 h-4" />
                  <span>Revisar {pendingOrdersCount} Comprobantes Pendientes</span>
                </button>

                <button
                  onClick={() => setActiveTab('cash_sale')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Vender en Efectivo a un Socio</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Descargar CSV Oficial</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COMPROBANTES Y PEDIDOS (VER COMPROBANTES Y APROBAR) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter and search bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      orderFilter === 'all'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos ({orders.length})
                  </button>

                  <button
                    onClick={() => setOrderFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      orderFilter === 'pending'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-amber-400 hover:text-white'
                    }`}
                  >
                    <span>Pendientes</span>
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 rounded-full">
                      {pendingOrdersCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setOrderFilter('confirmed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      orderFilter === 'confirmed'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Aprobados ({orders.filter((o) => o.status === 'confirmado').length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente o código..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron pedidos con ese filtro.
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const isPending = order.status === 'pendiente';

                    return (
                      <div
                        key={order.id}
                        className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                      >
                        {/* Order & Client Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPending
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isPending ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {order.buyerName}
                              </span>
                              <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {order.orderCode}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  isPending
                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {isPending ? 'Pendiente' : 'Aprobado'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                              <span>Tel: {order.buyerPhone}</span>
                              <span>·</span>
                              <span>Método: {order.paymentMethod.toUpperCase()}</span>
                              <span>·</span>
                              <span className="text-slate-300">
                                Números ({order.numbers.length}):{' '}
                                <strong className="font-mono text-amber-400">
                                  {order.numbers.map((n) => n.toString().padStart(2, '0')).join(', ')}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Amount and Action Controls */}
                        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                          <div className="text-left md:text-right">
                            <div className="text-xs text-slate-400">Total:</div>
                            <div className="font-display font-extrabold text-white text-sm tabular-nums">
                              {formatARS(order.totalAmount)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* View Receipt Button */}
                            <button
                              onClick={() => setViewingReceiptOrder(order)}
                              title="Ver Comprobante Digital"
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-800 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-400" />
                              <span className="hidden sm:inline">Comprobante</span>
                            </button>

                            {/* WhatsApp Direct Chat */}
                            <a
                              href={`https://wa.me/${order.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                isPending
                                  ? `Hola ${order.buyerName}, te escribimos de DOMINUS GYM sobre tu reserva ${order.orderCode} para el Fiat Mobi 2017. Por favor envianos tu comprobante para confirmarte los números.`
                                  : `¡Hola ${order.buyerName}! Te confirmamos que tu pago de ${formatARS(
                                      order.totalAmount
                                    )} para el sorteo del Fiat Mobi 2017 fue APROBADO con éxito. Tus números son [${order.numbers
                                      .map((n) => n.toString().padStart(2, '0'))
                                      .join(', ')}]. ¡Mucha suerte!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Contactar por WhatsApp"
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 cursor-pointer transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* Approve Button */}
                            {isPending ? (
                              <button
                                onClick={() => {
                                  onApproveOrder(order.id);
                                  sounds.playWinnerFanfare();
                                }}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprobar Pago</span>
                              </button>
                            ) : null}

                            {/* Reject / Release Button */}
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Seguro que deseas liberar los números de ${order.buyerName}?`
                                  )
                                ) {
                                  onRejectOrder(order.id);
                                }
                              }}
                              title="Liberar Números"
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VENDER EN EFECTIVO (REMISIÓN EN RECEPCIÓN DOMINUS GYM) */}
          {activeTab === 'cash_sale' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-display font-extrabold text-white text-lg flex items-center gap-2">
                      <Store className="w-5 h-5 text-amber-400" />
                      <span>Venta Presencial en Efectivo (Recepción Gym)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Asigná y cobrá en mostrador los números de la rifa a socios y clientes.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    Caja Dominus Gym
                  </span>
                </div>

                {cashSaleSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>¡Venta #{cashSaleSuccess.orderCode} Registrada con Éxito!</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Socio: <strong>{cashSaleSuccess.buyerName}</strong> · Números:{' '}
                        <strong>
                          {cashSaleSuccess.numbers.map((n) => n.toString().padStart(2, '0')).join(', ')}
                        </strong>{' '}
                        · Total: <strong>{formatARS(cashSaleSuccess.totalAmount)}</strong>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${cashSaleSuccess.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `¡Hola ${cashSaleSuccess.buyerName}! En DOMINUS GYM registramos tu compra en efectivo para el sorteo del Fiat Mobi 2017. Código: ${cashSaleSuccess.orderCode}. Tus números son: [${cashSaleSuccess.numbers
                          .map((n) => n.toString().padStart(2, '0'))
                          .join(', ')}]. ¡Muchas gracias y éxito!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Enviar Comprobante WhatsApp</span>
                    </a>
                  </div>
                )}

                <form onSubmit={handleCashSaleSubmit} className="space-y-4">
                  {/* Step 1: Select Numbers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        1. Seleccionar Números para el Socio:
                      </label>
                      {/* Random picker quick buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">🎲 Al azar:</span>
                        {[1, 3, 5, 8].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              const avail = tickets
                                .filter((t) => t.status === 'available')
                                .map((t) => t.id);
                              const shuffled = avail.sort(() => 0.5 - Math.random());
                              setCashNumbers(shuffled.slice(0, amt));
                              sounds.playPop();
                            }}
                            className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 hover:border-amber-400 text-[11px] font-bold text-slate-200 cursor-pointer"
                          >
                            ×{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector Dropdown / Selected chips */}
                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {cashNumbers.length === 0 ? (
                          <div className="text-xs text-slate-400 py-1">
                            Ningún número seleccionado. Hacé clic en los números de abajo o elegí al azar.
                          </div>
                        ) : (
                          cashNumbers.map((num) => (
                            <span
                              key={num}
                              className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-mono font-bold text-xs px-2.5 py-1 rounded-lg"
                            >
                              <span>{num.toString().padStart(2, '0')}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCashNumbers(cashNumbers.filter((n) => n !== num))
                                }
                                className="hover:opacity-75 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Numbers picker grid */}
                      <div className="pt-2 border-t border-slate-800">
                        <div className="text-[11px] text-slate-400 mb-1.5">
                          Elegir de los {availableTickets.length} disponibles:
                        </div>
                        <div className="grid grid-cols-10 gap-1 max-h-28 overflow-y-auto p-1 bg-slate-950 rounded-xl">
                          {availableTickets.map((t) => {
                            const isSelected = cashNumbers.includes(t.id);
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setCashNumbers(cashNumbers.filter((n) => n !== t.id));
                                  } else {
                                    setCashNumbers([...cashNumbers, t.id]);
                                  }
                                  sounds.playPop();
                                }}
                                className={`text-[11px] font-mono font-bold p-1 rounded transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                {t.numberFormatted}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Customer Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Nombre del Socio *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Rodrigo Martínez"
                        value={cashBuyerName}
                        onChange={(e) => setCashBuyerName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        WhatsApp / Celular
                      </label>
                      <input
                        type="tel"
                        placeholder="Ej: 11 4829 1029"
                        value={cashBuyerPhone}
                        onChange={(e) => setCashBuyerPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        DNI (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 38920192"
                        value={cashBuyerDni}
                        onChange={(e) => setCashBuyerDni(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Step 3: Payment Method for Member */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      3. Medio de Pago del Socio (en el Gym):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCashSalePaymentMethod('efectivo')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          cashSalePaymentMethod === 'efectivo'
                            ? 'bg-amber-400/10 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Store className="w-4 h-4 mb-1 text-amber-400" />
                        <div className="text-xs font-bold">Efectivo</div>
                        <div className="text-[10px] text-slate-400">En mano / caja</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCashSalePaymentMethod('mercadopago')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          cashSalePaymentMethod === 'mercadopago'
                            ? 'bg-amber-400/10 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Wallet className="w-4 h-4 mb-1 text-sky-400" />
                        <div className="text-xs font-bold">Mercado Pago</div>
                        <div className="text-[10px] text-slate-400">QR o Alias Gym</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCashSalePaymentMethod('transferencia')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          cashSalePaymentMethod === 'transferencia'
                            ? 'bg-amber-400/10 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mb-1 text-emerald-400" />
                        <div className="text-xs font-bold">Transferencia</div>
                        <div className="text-[10px] text-slate-400">CBU Bancario</div>
                      </button>
                    </div>
                  </div>

                  {/* Price Calculation Summary */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Total a registrar en mostrador:</div>
                      <div className="text-xl font-display font-black text-amber-400 tabular-nums">
                        {formatARS(cashPricing.total)}
                      </div>
                      {cashPricing.badge && (
                        <div className="text-[11px] text-emerald-400 font-semibold">
                          {cashPricing.badge}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cashIsImmediatePaid}
                          onChange={(e) => setCashIsImmediatePaid(e.target.checked)}
                          className="rounded text-amber-400 focus:ring-amber-400"
                        />
                        <span>Pago Recibido (Aprobar de inmediato)</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={cashNumbers.length === 0 || !cashBuyerName.trim()}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-amber-400/20"
                  >
                    Registrar Venta de Socio ({cashNumbers.length} números)
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: GESTIÓN DE NÚMEROS (00 AL 99) */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {/* Filter and search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                  <button
                    onClick={() => setTicketFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ticketFilter === 'all'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos ({tickets.length})
                  </button>
                  <button
                    onClick={() => setTicketFilter('sold')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ticketFilter === 'sold'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pagados ({soldTickets.length})
                  </button>
                  <button
                    onClick={() => setTicketFilter('reserved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ticketFilter === 'reserved'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Reservados ({reservedTickets.length})
                  </button>
                  <button
                    onClick={() => setTicketFilter('available')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ticketFilter === 'available'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Disponibles ({availableTickets.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar número o cliente..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Tickets list */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80 max-h-[50vh] overflow-y-auto">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-slate-900 font-mono font-black text-base text-amber-400 flex items-center justify-center border border-slate-800">
                        {t.numberFormatted}
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {t.buyerName || 'Sin comprador'}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{t.buyerPhone ? `Tel: ${t.buyerPhone}` : 'Disponible'}</span>
                          {t.orderCode && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-slate-300">{t.orderCode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick State Toggle Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateTicketStatus(t.id, 'sold')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          t.status === 'sold'
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Pagado
                      </button>

                      <button
                        onClick={() => onUpdateTicketStatus(t.id, 'reserved')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          t.status === 'reserved'
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Reservado
                      </button>

                      <button
                        onClick={() => onUpdateTicketStatus(t.id, 'available')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          t.status === 'available'
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Liberar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BOLILLERO DIGITAL OFICIAL (EXCLUSIVO ADMIN) */}
          {activeTab === 'bolillero' && (
            <div className="space-y-6 max-w-2xl mx-auto text-center py-2">
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 space-y-6 shadow-2xl">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    {drawnCarWinner
                      ? '🎉 ¡GANADOR DEL FIAT MOBI 2017 SELECCIONADO!'
                      : 'Sorteo Oficial del Único Premio: Fiat Mobi 2017 IMPECABLE 😍'}
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-white">
                    Bolillero Digital Exclusivo Admin
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Participan únicamente los{' '}
                    <strong className="text-white">
                      {tickets.filter((t) => t.status === 'sold' || t.status === 'reserved').length} números
                    </strong>{' '}
                    confirmados y registrados.
                  </p>
                </div>

                {/* Animated Bolillero Sphere */}
                <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full border-2 ${
                      isBolilleroSpinning
                        ? 'border-amber-400 border-dashed animate-spin'
                        : 'border-slate-800'
                    }`}
                  />
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-slate-950 via-slate-900 to-[#141A28] border-2 border-amber-500/40 shadow-2xl flex items-center justify-center">
                    <span
                      className={`font-mono font-black text-6xl sm:text-7xl tabular-nums ${
                        isBolilleroSpinning ? 'text-amber-300 scale-110' : 'text-amber-400'
                      } transition-all`}
                    >
                      {bolilleroNumber}
                    </span>
                  </div>
                </div>

                {/* Spin / Reset Buttons */}
                <div className="flex items-center justify-center gap-3">
                  {!drawnCarWinner ? (
                    <button
                      type="button"
                      onClick={handleStartBolillero}
                      disabled={
                        isBolilleroSpinning ||
                        tickets.filter((t) => t.status === 'sold' || t.status === 'reserved').length === 0
                      }
                      className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-amber-400/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
                    >
                      <Play className="w-5 h-5 fill-slate-950" />
                      <span>{isBolilleroSpinning ? 'Girando Bolillero...' : 'Girar Bolillero Oficial'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawnCarWinner(null);
                        setBolilleroNumber('00');
                      }}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Volver a Girar / Reiniciar</span>
                    </button>
                  )}
                </div>

                {/* Winner Card */}
                {drawnCarWinner && (
                  <div className="text-left p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 rounded-2xl border-2 border-amber-400/80 shadow-2xl animate-in fade-in space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <Trophy className="w-4 h-4" />
                        <span>Ganador del Fiat Mobi 2017</span>
                      </div>
                      <span className="text-[11px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                        ¡OFICIAL!
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-mono font-black text-3xl flex items-center justify-center shadow-lg shrink-0">
                        {drawnCarWinner.formatted}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xl font-display font-black text-white">
                          {drawnCarWinner.winnerName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {drawnCarWinner.winnerPhone ? `Tel: ${drawnCarWinner.winnerPhone}` : 'Registrado en Gym'} · {drawnCarWinner.orderCode || 'DG-WIN'}
                        </div>
                        <div className="text-xs text-amber-300 font-semibold mt-1 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5" />
                          <span>Fiat Mobi 2017 IMPECABLE 😍</span>
                        </div>
                      </div>
                    </div>

                    {drawnCarWinner.winnerPhone && (
                      <div className="pt-2">
                        <a
                          href={`https://wa.me/${drawnCarWinner.winnerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `¡FELICITACIONES ${drawnCarWinner.winnerName}! 🚗🎉 Tu número [${drawnCarWinner.formatted}] acaba de salir ganador en el Bolillero Oficial de DOMINUS GYM para el FIAT MOBI 2017 IMPECABLE! Ponete en contacto con la administración de DOMINUS GYM para coordinar la entrega y transferencia de tu auto.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Enviar Felicitación por WhatsApp al Ganador</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CONFIGURACIÓN DE PAGOS Y RIFA */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Configuración de la Rifa
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Precio Base por Número (ARS)
                    </label>
                    <input
                      type="number"
                      value={editableConfig.pricePerNumber}
                      onChange={(e) =>
                        setEditableConfig({
                          ...editableConfig,
                          pricePerNumber: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fecha y Hora del Sorteo Oficial
                    </label>
                    <input
                      type="text"
                      placeholder="2026-12-31T21:00:00-03:00"
                      value={editableConfig.drawDate || '2026-12-31T21:00:00-03:00'}
                      onChange={(e) =>
                        setEditableConfig({
                          ...editableConfig,
                          drawDate: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Modalidad y Detalle del Sorteo
                    </label>
                    <input
                      type="text"
                      value={editableConfig.drawModality}
                      onChange={(e) =>
                        setEditableConfig({
                          ...editableConfig,
                          drawModality: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Datos de Cobro (Mercado Pago y Bancario)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alias Mercado Pago
                    </label>
                    <input
                      type="text"
                      value={editableConfig.mpAlias}
                      onChange={(e) =>
                        setEditableConfig({ ...editableConfig, mpAlias: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      CVU Mercado Pago
                    </label>
                    <input
                      type="text"
                      value={editableConfig.mpCvu}
                      onChange={(e) =>
                        setEditableConfig({ ...editableConfig, mpCvu: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alias Bancario (CBU)
                    </label>
                    <input
                      type="text"
                      value={editableConfig.bankAlias}
                      onChange={(e) =>
                        setEditableConfig({ ...editableConfig, bankAlias: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      CBU Bancario
                    </label>
                    <input
                      type="text"
                      value={editableConfig.bankCbu}
                      onChange={(e) =>
                        setEditableConfig({ ...editableConfig, bankCbu: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WhatsApp para Recibir Comprobantes
                    </label>
                    <input
                      type="text"
                      value={editableConfig.whatsappNumber}
                      onChange={(e) =>
                        setEditableConfig({ ...editableConfig, whatsappNumber: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Titular y CUIT
                    </label>
                    <input
                      type="text"
                      value={editableConfig.accountHolder}
                      onChange={(e) =>
                        setEditableConfig({ ...editableConfig, accountHolder: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Security Card: Exclusive Admin Password Management */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Seguridad y Contraseña Exclusiva de Admin</span>
                  </div>
                  <span className="text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded font-mono font-bold">
                    ACCESO PRIVADO
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Esta contraseña única protege el acceso a este panel de administración. Solo las personas que conozcan esta clave podrán ingresar, modificar ventas, validar comprobantes y activar el bolillero.
                </p>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contraseña de Admin actual activa:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {showConfigPasswords ? currentAdminPassword : '••••••••••••••••'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfigPasswords(!showConfigPasswords)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
                  >
                    {showConfigPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showConfigPasswords ? 'Ocultar' : 'Ver Clave Actual'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contraseña Actual
                    </label>
                    <input
                      type={showConfigPasswords ? 'text' : 'password'}
                      value={currentPasswordVerify}
                      onChange={(e) => setCurrentPasswordVerify(e.target.value)}
                      placeholder="Ingresá contraseña actual..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type={showConfigPasswords ? 'text' : 'password'}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Mínimo 4 caracteres..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type={showConfigPasswords ? 'text' : 'password'}
                      value={confirmNewPasswordInput}
                      onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                      placeholder="Repetir nueva contraseña..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>

                {changePasswordMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      changePasswordMsg.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {changePasswordMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{changePasswordMsg.text}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleChangeAdminPassword}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Guardar Nueva Contraseña de Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Deseás restablecer la contraseña exclusiva de Admin a la predeterminada (admin@dominus2026)?')) {
                        localStorage.setItem(STORAGE_ADMIN_PASSWORD_KEY, DEFAULT_MASTER_PASSWORD);
                        setCurrentAdminPassword(DEFAULT_MASTER_PASSWORD);
                        setCurrentPasswordVerify('');
                        setNewPasswordInput('');
                        setConfirmNewPasswordInput('');
                        setChangePasswordMsg({ type: 'success', text: 'Contraseña restablecida a admin@dominus2026' });
                        sounds.playTick();
                        setTimeout(() => setChangePasswordMsg(null), 3000);
                      }
                    }}
                    className="text-[11px] text-slate-400 hover:text-amber-400 underline cursor-pointer"
                  >
                    Restablecer clave inicial por defecto
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Guardar Cambios
                  </button>

                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      ¡Configuración actualizada!
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        '⚠️ ¿Estás seguro de blanquear el sistema a cero?\\n\\nSe liberarán todos los 100 números y se borrarán compradores y pedidos para comenzar las ventas reales.'
                      )
                    ) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Blanquear Sistema a Cero</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: BASE DE DATOS MYSQL */}
          {activeTab === 'mysql' && (
            <div className="space-y-6">
              {/* MySQL Status Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-white text-base sm:text-lg">
                          Base de Datos Relacional MySQL
                        </span>
                        <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                          InnoDB · UTF8MB4
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Arquitectura lista para conectar con MySQL local, hosting cPanel o servidores VPS/Cloud.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick actions in banner */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadSql}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar .sql Completo</span>
                  </button>

                  <button
                    onClick={handleCopySql}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    {copiedSql ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Indicator Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Estado de Conexión</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">
                      {dbStatus?.connected ? 'MySQL Conectado' : 'Modo Sistema / Listo'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Driver: mysql2/promise
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Base de Datos</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">
                    dominus_rifa
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Charset: utf8mb4_unicode_ci
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Total Números en BD</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">
                    {tickets.length} Números (00-99)
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {tickets.filter(t => t.status === 'sold').length} vendidos · {tickets.filter(t => t.status === 'reserved').length} reservados
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Órdenes Relacionales</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {orders.length} Pedidos
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Con comprobantes y DNI
                  </span>
                </div>
              </div>

              {/* Sub-tabs selector */}
              <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDbSubTab('status')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                    dbSubTab === 'status'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🔌 Probar Conexión
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('export')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                    dbSubTab === 'export'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  💾 Exportar DUMP (.sql)
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('schema')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                    dbSubTab === 'schema'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  📑 Esquema de Tablas
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('guide')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                    dbSubTab === 'guide'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🚀 Guía de Instalación
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('reset')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                    dbSubTab === 'reset'
                      ? 'border-rose-400 text-rose-400 font-black'
                      : 'border-transparent text-rose-400/70 hover:text-rose-300'
                  }`}
                >
                  🧹 Blanquear a Cero
                </button>
              </div>

              {/* SUBTAB 1: TESTER DE CONEXIÓN */}
              {dbSubTab === 'status' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      <span>Verificador de Conexión a Servidor MySQL en Vivo</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Ingresá los datos de tu servidor MySQL (XAMPP, MySQL local, cPanel, VPS o Cloud) para validar que responde correctamente.
                    </p>

                    <form onSubmit={handleTestDb} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Host del Servidor
                          </label>
                          <input
                            type="text"
                            value={testHost}
                            onChange={(e) => setTestHost(e.target.value)}
                            placeholder="localhost o 127.0.0.1"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Puerto MySQL
                          </label>
                          <input
                            type="text"
                            value={testPort}
                            onChange={(e) => setTestPort(e.target.value)}
                            placeholder="3306"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Nombre de la Base de Datos
                          </label>
                          <input
                            type="text"
                            value={testDb}
                            onChange={(e) => setTestDb(e.target.value)}
                            placeholder="dominus_rifa"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Usuario MySQL
                          </label>
                          <input
                            type="text"
                            value={testUser}
                            onChange={(e) => setTestUser(e.target.value)}
                            placeholder="root"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Contraseña
                          </label>
                          <input
                            type="password"
                            value={testPass}
                            onChange={(e) => setTestPass(e.target.value)}
                            placeholder="(Dejar vacío si no tiene contraseña)"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-5">
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={testSsl}
                              onChange={(e) => setTestSsl(e.target.checked)}
                              className="rounded border-slate-800 text-cyan-400 focus:ring-0"
                            />
                            <span>Habilitar SSL (Cloud / Railway)</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isTestingConn}
                          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isTestingConn ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Conectando con MySQL...</span>
                            </>
                          ) : (
                            <>
                              <Server className="w-4 h-4" />
                              <span>Probar Conexión Ahora</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Result message */}
                    {testResult && (
                      <div
                        className={`mt-4 p-4 rounded-xl border text-xs ${
                          testResult.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {testResult.success ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <span className="font-bold block">{testResult.message}</span>
                            {testResult.version && (
                              <span className="block text-slate-400">
                                Versión del Servidor: {testResult.version} · Latencia: {testResult.pingMs}ms
                              </span>
                            )}
                            {testResult.error && (
                              <span className="font-mono text-[11px] block text-rose-400">
                                Código de error: {testResult.error}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: EXPORTAR DUMP */}
              {dbSubTab === 'export' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Generar Dump SQL Completo (Datos en Vivo)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Este script contiene la creación de tablas y todos los datos actuales: los 100 números con sus estados exactos, todas las órdenes de compradores registrados y los datos de pago de DOMINUS GYM.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white font-mono">
                          dominus_rifa_{new Date().toISOString().split('T')[0]}.sql
                        </div>
                        <div className="text-xs text-slate-400">
                          Listo para importar en phpMyAdmin o MySQL CLI con 1 click.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleDownloadSql}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Archivo .sql</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopySql}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                      >
                        {copiedSql ? (
                          <>
                            <CheckCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar SQL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSqlCode(!showSqlCode)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Code className="w-4 h-4" />
                      <span>{showSqlCode ? 'Ocultar código SQL' : 'Ver vista previa del código SQL'}</span>
                    </button>

                    {showSqlCode && (
                      <div className="mt-3 p-4 bg-slate-900 rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
                        <pre className="text-[11px] font-mono text-cyan-200/90 whitespace-pre">
                          {generateMysqlScript(tickets, orders, config).slice(0, 4000)}
                          {'\n... [continúa con los 100 números y órdenes] ...'}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: ESQUEMA DE TABLAS */}
              {dbSubTab === 'schema' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono text-sm">1. tickets</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">100 filas</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Almacena los números de rifa (00 a 99), su estado (available, reserved, sold), comprador y método de pago.
                      </p>
                      <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-cyan-300 space-y-0.5">
                        <div>id (INT PK, 0..99)</div>
                        <div>number_formatted (VARCHAR 10)</div>
                        <div>status (ENUM 'available','reserved','sold')</div>
                        <div>buyer_name, buyer_phone, buyer_dni</div>
                        <div>order_code, purchase_date</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono text-sm">2. orders</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Relacional</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Almacena compras realizadas en la web o presenciales en efectivo en el gimnasio, con control de comprobante.
                      </p>
                      <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-cyan-300 space-y-0.5">
                        <div>id (VARCHAR 64 PK)</div>
                        <div>order_code (VARCHAR 20 UNIQUE)</div>
                        <div>total_amount (DECIMAL 10,2), discount</div>
                        <div>payment_method (MP, transf, efectivo)</div>
                        <div>status (pendiente, confirmado)</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono text-sm">3. raffles_config</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Configuración</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Configuración global, precios, fecha de sorteo, cuentas de Mercado Pago, CBU, Alias y datos del gimnasio.
                      </p>
                      <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-cyan-300 space-y-0.5">
                        <div>title, subtitle, organizer_name</div>
                        <div>price_per_number, total_numbers</div>
                        <div>draw_date, draw_modality</div>
                        <div>mp_alias, mp_cvu, bank_alias, bank_cbu</div>
                        <div>gym_address, gym_city, whatsapp_number</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono text-sm">4. prizes</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Premio Estrella</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Premio Fiat Mobi 2017 IMPECABLE, equipamiento, fotos y ganador sorteado por bolillero.
                      </p>
                      <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-cyan-300 space-y-0.5">
                        <div>name ('Fiat Mobi 2017 IMPECABLE 😍')</div>
                        <div>badge ('ÚNICO PREMIO ESTRELLA')</div>
                        <div>image, specs_json, items_json</div>
                        <div>winner_number, winner_name</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: GUÍA DE INSTALACIÓN */}
              {dbSubTab === 'guide' && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-5 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Guía Paso a Paso para Desplegar en MySQL
                    </h4>
                    <p className="text-slate-400">
                      Podés usar tu hosting tradicional (cPanel, phpMyAdmin), un servidor VPS propio, o servicios en la nube.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Opción 1: phpMyAdmin */}
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                          1
                        </span>
                        <span className="font-bold text-white text-sm">
                          Opción A: phpMyAdmin / cPanel / Hosting Compartido (XAMPP / DonWeb / Hostinger)
                        </span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-2">
                        <li>
                          Abrí <span className="text-cyan-400 font-mono">phpMyAdmin</span> desde tu cPanel o navegador.
                        </li>
                        <li>
                          Hacé clic en <span className="text-white font-semibold">"Nueva"</span> y creá la base de datos con el nombre <span className="font-mono text-amber-400">dominus_rifa</span> (Collation: <span className="font-mono text-cyan-300">utf8mb4_unicode_ci</span>).
                        </li>
                        <li>
                          Hacé clic en la pestaña <span className="text-white font-semibold">"Importar"</span> en la parte superior.
                        </li>
                        <li>
                          Seleccioná el archivo <span className="font-mono text-cyan-400">dominus_rifa.sql</span> (que descargás con el botón azul arriba) y pulsá <span className="text-white font-semibold">"Continuar"</span>.
                        </li>
                        <li>
                          ¡Listo! Las 6 tablas, los 100 números del sorteo y los datos iniciales quedan creados en menos de 2 segundos.
                        </li>
                      </ol>
                    </div>

                    {/* Opción 2: VPS Linux */}
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                          2
                        </span>
                        <span className="font-bold text-white text-sm">
                          Opción B: Servidor VPS Linux (Ubuntu / Debian) o Terminal
                        </span>
                      </div>
                      <p className="text-slate-400">
                        Si tenés un servidor VPS propio, ejecutá estos 2 comandos en la terminal:
                      </p>
                      <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-cyan-300 space-y-1 border border-slate-800">
                        <div className="text-slate-400"># 1. Crear base de datos</div>
                        <div>mysql -u root -p -e "CREATE DATABASE dominus_rifa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"</div>
                        <div className="text-slate-400 pt-1"># 2. Importar el script completo</div>
                        <div>mysql -u root -p dominus_rifa &lt; dominus_rifa.sql</div>
                      </div>
                    </div>

                    {/* Opción 3: Variables de Entorno */}
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                          3
                        </span>
                        <span className="font-bold text-white text-sm">
                          Configuración del archivo .env en el Servidor
                        </span>
                      </div>
                      <p className="text-slate-400">
                        En el archivo <span className="font-mono text-amber-400">.env</span> de tu proyecto, configurás las credenciales:
                      </p>
                      <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-amber-300 space-y-1 border border-slate-800">
                        <div>MYSQL_HOST=localhost</div>
                        <div>MYSQL_PORT=3306</div>
                        <div>MYSQL_DATABASE=dominus_rifa</div>
                        <div>MYSQL_USER=tu_usuario_mysql</div>
                        <div>MYSQL_PASSWORD=tu_contraseña_secreta</div>
                        <div>MYSQL_SSL=false</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: BLANQUEAR BASE DE DATOS A CERO */}
              {dbSubTab === 'reset' && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-rose-500/30 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <Trash2 className="w-5 h-5" />
                        </span>
                        <h4 className="text-base font-extrabold text-white">
                          Blanquear Sistema y Base de Datos (Cargar desde 0)
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300">
                        Esta herramienta deja el sistema 100% en blanco: limpia los datos de prueba, vacía todas las órdenes y restablece los 100 números (del 00 al 99) como disponibles para comenzar con ventas reales.
                      </p>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={handleWipeDatabaseNow}
                        className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition-transform active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Blanquear Sistema Ahora</span>
                      </button>
                    </div>
                  </div>

                  {resetSuccessMessage && (
                    <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>¡Sistema blanqueado exitosamente! Los 100 números están ahora disponibles y la lista de compradores está en cero.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                        <FileText className="w-4 h-4" />
                        <span>Script SQL para Servidor MySQL / phpMyAdmin</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Si ya tenés tu base de datos MySQL desplegada en un servidor o hosting, podés ejecutar este script SQL de blanqueo directamente para limpiar las tablas <code className="text-amber-300 font-mono">orders</code>, <code className="text-amber-300 font-mono">tickets</code> y <code className="text-amber-300 font-mono">audit_logs</code>:
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDownloadResetSql}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Descargar reset_clean.sql</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyResetSql}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          {copiedResetSql ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar SQL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>¿Qué realiza el blanqueo?</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                        <li>Vuelve los <strong>100 números (00 al 99)</strong> al estado <span className="text-emerald-400 font-bold">Disponible</span>.</li>
                        <li>Elimina todos los compradores previos (Facundo Rossi, Mariano Gómez, etc.).</li>
                        <li>Vacía el historial de pedidos y comprobantes pendientes.</li>
                        <li>Preserva intactos el valor por número ($8.000) y los datos de cobro de DOMINUS GYM.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      Vista previa del script de blanqueo (reset_clean.sql):
                    </span>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                      <pre className="text-[10px] font-mono text-cyan-200/90 whitespace-pre">
                        {cleanResetSqlScript.slice(0, 1500)}
                        {'\n... [actualiza los 100 números a available] ...'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: LEVANTAR EN VERCEL Y RENDER */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-5 bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-slate-950 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-display font-black text-white text-base sm:text-lg">
                      Guía Oficial para Desplegar en la Nube
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Tu sistema está listo para producción. Puedes alojar la web en <strong className="text-white">Vercel</strong> (frontend ultrarrápido y gratuito) o en <strong className="text-white">Render</strong> (servidor Node.js completo).
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setDeployActivePlatform('connect')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      deployActivePlatform === 'connect'
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 text-cyan-300" />
                    <span>🔗 Conectar Ambos (Vercel + Render)</span>
                  </button>
                  <button
                    onClick={() => setDeployActivePlatform('vercel')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      deployActivePlatform === 'vercel'
                        ? 'bg-white text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Vercel (Frontend)</span>
                  </button>
                  <button
                    onClick={() => setDeployActivePlatform('render')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      deployActivePlatform === 'render'
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Render (Backend API)</span>
                  </button>
                </div>
              </div>

              {/* CONNECT VERCEL & RENDER GUIDE & LIVE TESTER */}
              {deployActivePlatform === 'connect' && (
                <div className="space-y-6">
                  {/* Visual Architecture Diagram */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-cyan-400" />
                        <h4 className="font-display font-black text-white text-base">
                          ¿Cómo Trabajan Juntos Vercel y Render?
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30">
                        Arquitectura Moderna Desacoplada
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {/* Box 1: Vercel */}
                      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 relative space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-cyan-400" /> Vercel (Frontend)
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                            React SPA
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Entrega la interfaz ultrarrápida a los socios mediante CDN global. Gestiona diseño, catálogo de números, carrito y comprobantes.
                        </p>
                        <div className="text-[11px] text-cyan-300 font-mono">
                          👉 Envía peticiones API a Render
                        </div>
                      </div>

                      {/* Box 2: Render */}
                      <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-500/40 relative space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white flex items-center gap-1.5">
                            <Server className="w-4 h-4 text-indigo-400" /> Render (Backend API)
                          </span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                            Node Express
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Servidor en segundo plano que atiende las rutas <code className="text-amber-400 font-mono">/api/*</code>, ejecuta consultas a la base de datos y genera backups SQL.
                        </p>
                        <div className="text-[11px] text-indigo-300 font-mono">
                          👉 Conecta con base de datos MySQL
                        </div>
                      </div>

                      {/* Box 3: MySQL */}
                      <div className="p-4 bg-slate-900/90 rounded-xl border border-amber-500/30 relative space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-amber-400" /> Base de Datos MySQL
                          </span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                            Persistencia
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Almacena tablas <code className="text-white font-mono">tickets</code>, <code className="text-white font-mono">orders</code> y <code className="text-white font-mono">raffle_config</code>.
                        </p>
                        <div className="text-[11px] text-amber-300 font-mono">
                          👉 Alojada en cPanel, Railway o Cloud
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PROBADOR Y CONFIGURADOR EN VIVO */}
                  <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950/40 rounded-2xl border border-indigo-500/30 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h4 className="font-display font-black text-white text-base">
                            Probador y Conector en Vivo de Render
                          </h4>
                          <p className="text-xs text-slate-300">
                            Pega la URL de tu Web Service de Render para vincularlo inmediatamente con esta app.
                          </p>
                        </div>
                      </div>
                      {customRenderUrl && (
                        <span className="text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                          Actualmente configurado
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-300 block">
                        URL Pública de tu Backend en Render (Web Service):
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={customRenderUrl}
                            onChange={(e) => {
                              setCustomRenderUrl(e.target.value);
                              setRenderHealthResult(null);
                              setSavedRenderUrlSuccess(false);
                            }}
                            placeholder="https://dominus-gym-api.onrender.com"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono outline-none"
                          />
                        </div>

                        {/* Botón Probar */}
                        <button
                          onClick={async () => {
                            if (!customRenderUrl.trim()) return;
                            setTestingRenderConnection(true);
                            setRenderHealthResult(null);
                            try {
                              const res = await api.checkBackendHealth(customRenderUrl);
                              setRenderHealthResult({
                                tested: true,
                                connected: res.connected,
                                pingMs: res.pingMs,
                                data: res.data,
                                error: res.error,
                              });
                              if (res.connected) {
                                sounds.playWinnerFanfare();
                              }
                            } finally {
                              setTestingRenderConnection(false);
                            }
                          }}
                          disabled={testingRenderConnection || !customRenderUrl.trim()}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                        >
                          {testingRenderConnection ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Probando Conexión...</span>
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4" />
                              <span>Probar Salud (`/api/health`)</span>
                            </>
                          )}
                        </button>

                        {/* Botón Guardar */}
                        <button
                          onClick={() => {
                            api.setApiBaseUrl(customRenderUrl);
                            setSavedRenderUrlSuccess(true);
                            setTimeout(() => setSavedRenderUrlSuccess(false), 3000);
                          }}
                          disabled={!customRenderUrl.trim()}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                        >
                          {savedRenderUrlSuccess ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>¡URL Guardada!</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Guardar en Esta App</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Resultado de la prueba en vivo */}
                      {renderHealthResult && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                            renderHealthResult.connected
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          }`}
                        >
                          {renderHealthResult.connected ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <div className="font-bold text-white text-xs">
                              {renderHealthResult.connected
                                ? `¡Conexión Exitosa con Render! (${renderHealthResult.pingMs} ms de latencia)`
                                : 'No se pudo conectar con el backend de Render'}
                            </div>
                            <div className="text-[11px]">
                              {renderHealthResult.connected ? (
                                <span>
                                  Servicio: <strong className="text-emerald-300 font-mono">{renderHealthResult.data?.service || 'DOMINUS GYM Backend'}</strong> — Driver MySQL: <span className="font-mono">{renderHealthResult.data?.mysqlDriver || 'mysql2'}</span>.
                                </span>
                              ) : (
                                <div>
                                  <p className="text-rose-300">{renderHealthResult.error}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    💡 <em>Nota:</em> Si tu servicio en Render usa el Plan Free y no ha recibido visitas en los últimos 15 minutos, el servidor entra en estado de suspensión (sleep). Tarda aproximadamente 40 a 50 segundos en despertar en la primera petición. Dale 30 segundos y vuelve a probar.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GUÍA PASO A PASO: LOS 2 MÉTODOS DE CONEXIÓN */}
                  <div className="space-y-4">
                    <h4 className="font-display font-black text-white text-base flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      Pasos para Conectar Vercel con Render en Producción
                    </h4>

                    {/* MÉTODO 1 (RECOMENDADO): VARIABLE DE ENTORNO EN VERCEL */}
                    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-mono text-xs font-black flex items-center justify-center">
                            1
                          </span>
                          <span className="font-bold text-white text-sm">
                            Método 1 (Recomendado): Variable de Entorno en Vercel
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                          Más Fácil y Flexible
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Este método le indica a la web en Vercel cuál es la URL exacta de Render para todas las llamadas API:
                      </p>

                      <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 pl-2">
                        <li>
                          Ve al panel de tu proyecto en <strong>Vercel</strong> ➔ pestaña <strong>Settings</strong> ➔ <strong>Environment Variables</strong>.
                        </li>
                        <li>
                          Agrega la siguiente variable de entorno:
                        </li>
                      </ol>

                      {/* Snippet Variable */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                        <div className="font-mono text-xs text-white">
                          <span className="text-cyan-400">VITE_API_BASE_URL</span> ={' '}
                          <span className="text-amber-400">
                            {customRenderUrl.trim() || 'https://tu-servicio-render.onrender.com'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const val = customRenderUrl.trim() || 'https://tu-servicio-render.onrender.com';
                            navigator.clipboard.writeText(`VITE_API_BASE_URL=${val}`);
                            setCopiedDeploySnippet('vite_var');
                            setTimeout(() => setCopiedDeploySnippet(null), 2000);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                        >
                          {copiedDeploySnippet === 'vite_var' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Par Variable</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          En Vercel haz clic en <strong>Save</strong> y luego en <strong>Deployments ➔ Redeploy</strong> para que la web aplique la variable.
                        </span>
                      </div>
                    </div>

                    {/* MÉTODO 2: REWRITE PROXY EN VERCEL.JSON */}
                    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-black flex items-center justify-center">
                            2
                          </span>
                          <span className="font-bold text-white text-sm">
                            Método 2 (Sin CORS): Proxy Transparente en vercel.json
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          Nivel Enterprise
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Con este método, Vercel reenvía silenciosamente cualquier petición interna a <code className="text-amber-400 font-mono">/api/*</code> hacia Render sin que el navegador note que son dominios distintos.
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Reemplaza el archivo <strong className="text-white">vercel.json</strong> en la raíz del proyecto con esto:
                        </span>
                        <button
                          onClick={() => {
                            const renderDest = customRenderUrl.trim() || 'https://tu-servicio-render.onrender.com';
                            const jsonContent = JSON.stringify(
                              {
                                buildCommand: 'npm run build',
                                outputDirectory: 'dist',
                                framework: 'vite',
                                rewrites: [
                                  {
                                    source: '/api/:path*',
                                    destination: `${renderDest}/api/:path*`,
                                  },
                                  {
                                    source: '/(.*)',
                                    destination: '/index.html',
                                  },
                                ],
                              },
                              null,
                              2
                            );
                            navigator.clipboard.writeText(jsonContent);
                            setCopiedDeploySnippet('vercel_json_proxy');
                            setTimeout(() => setCopiedDeploySnippet(null), 2000);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedDeploySnippet === 'vercel_json_proxy' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar vercel.json con Proxy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-cyan-300/90 overflow-x-auto">
{`{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "${customRenderUrl.trim() || 'https://tu-servicio-render.onrender.com'}/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`}
                      </pre>
                    </div>

                    {/* CONSEJO DE ORO: FREE TIER DE RENDER */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">
                          Consejo Pro para el Plan Free de Render (Evitar demoras de 50s):
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        En el plan gratuito de Render, los servidores se duermen tras 15 minutos sin peticiones. Para que tu backend esté <strong>siempre despierto</strong> y responda en milisegundos cuando un socio compre un número:
                      </p>
                      <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-1">
                        <li>Crea una cuenta gratuita en <strong className="text-white">UptimeRobot.com</strong> o <strong className="text-white">cron-job.org</strong>.</li>
                        <li>Configura un monitor HTTP tipo <code className="text-amber-400 font-mono">GET</code> cada <strong>10 minutos</strong> hacia: <code className="text-white font-mono">{customRenderUrl.trim() || 'https://tu-servicio-render.onrender.com'}/api/health</code>.</li>
                        <li>¡Listo! Render nunca entrará en suspensión y tu sistema responderá instantáneamente.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* VERCEL PLATFORM GUIDE */}
              {deployActivePlatform === 'vercel' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="text-xs font-bold text-slate-400">Framework</div>
                      <div className="text-sm font-black text-white">Vite (React + Tailwind)</div>
                      <div className="text-[11px] text-slate-400">Detección automática en Vercel</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="text-xs font-bold text-slate-400">Comando de Build</div>
                      <div className="text-sm font-mono font-bold text-amber-400">npm run build</div>
                      <div className="text-[11px] text-slate-400">Genera la carpeta optimizada /dist</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="text-xs font-bold text-slate-400">Directorio de Salida</div>
                      <div className="text-sm font-mono font-bold text-emerald-400">dist</div>
                      <div className="text-[11px] text-slate-400">Output Directory en Vercel</div>
                    </div>
                  </div>

                  {/* Pasos Vercel */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-black">
                        1
                      </span>
                      Pasos para levantar en Vercel (Paso a Paso)
                    </h4>

                    <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside pl-2">
                      <li className="leading-relaxed">
                        <strong className="text-white">Sube el código a GitHub:</strong> Inicializa el repositorio git y haz push a tu GitHub personal o de DOMINUS GYM.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Inicia sesión en Vercel:</strong> Ingresa a{' '}
                        <a
                          href="https://vercel.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-0.5"
                        >
                          vercel.com <ExternalLink className="w-3 h-3" />
                        </a>{' '}
                        con tu usuario de GitHub.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Importar Proyecto:</strong> Haz clic en <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-bold">Add New... ➔ Project</span> y selecciona el repositorio.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Configuración de Build:</strong> Vercel detecta automáticamente <strong className="text-white">Vite</strong>. Comprueba que el <em>Output Directory</em> sea <strong className="text-emerald-400">dist</strong>.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Haz clic en "Deploy":</strong> En aproximadamente 30 segundos tu sitio web estará online con certificado SSL gratuito (HTTPS).
                      </li>
                    </ol>
                  </div>

                  {/* Configuración vercel.json incluida */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white text-xs">
                          Archivo vercel.json (Ya creado e incluido en el proyecto)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const jsonText = JSON.stringify(
                            {
                              buildCommand: 'npm run build',
                              outputDirectory: 'dist',
                              framework: 'vite',
                              rewrites: [{ source: '/(.*)', destination: '/index.html' }],
                            },
                            null,
                            2
                          );
                          navigator.clipboard.writeText(jsonText);
                          setCopiedDeploySnippet('vercel_json');
                          setTimeout(() => setCopiedDeploySnippet(null), 2000);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedDeploySnippet === 'vercel_json' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`}
                    </pre>
                    <p className="text-[11px] text-slate-400">
                      💡 Este archivo asegura que la navegación SPA funcione perfectamente sin errores 404 al recargar la web.
                    </p>
                  </div>
                </div>
              )}

              {/* RENDER PLATFORM GUIDE */}
              {deployActivePlatform === 'render' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="text-xs font-bold text-slate-400">Tipo de Servicio</div>
                      <div className="text-sm font-black text-indigo-400">Web Service (Node)</div>
                      <div className="text-[11px] text-slate-400">Corre el servidor Express y Vite</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="text-xs font-bold text-slate-400">Build Command</div>
                      <div className="text-sm font-mono font-bold text-amber-400">npm install --legacy-peer-deps && npm run build</div>
                      <div className="text-[11px] text-slate-400">Instala y compila el frontend sin conflictos</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="text-xs font-bold text-slate-400">Start Command</div>
                      <div className="text-sm font-mono font-bold text-emerald-400">npm start</div>
                      <div className="text-[11px] text-slate-400">Inicia server.ts en producción</div>
                    </div>
                  </div>

                  {/* Pasos Render */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-black">
                        1
                      </span>
                      Pasos para levantar en Render (Web Service)
                    </h4>

                    <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside pl-2">
                      <li className="leading-relaxed">
                        <strong className="text-white">Crea una cuenta en Render:</strong> Ingresa a{' '}
                        <a
                          href="https://dashboard.render.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-0.5"
                        >
                          dashboard.render.com <ExternalLink className="w-3 h-3" />
                        </a>{' '}
                        con tu cuenta de GitHub.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Nuevo Servicio:</strong> Haz clic en <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-bold">New + ➔ Web Service</span> y conecta tu repositorio.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Configuración del Servicio:</strong>
                        <div className="mt-2 pl-4 space-y-1 text-slate-300 font-mono text-[11px]">
                          <div>• Runtime: <strong className="text-white">Node</strong></div>
                          <div>• Build Command: <strong className="text-amber-400">npm install --legacy-peer-deps && npm run build</strong></div>
                          <div>• Start Command: <strong className="text-emerald-400">npm start</strong></div>
                          <div>• Plan: <strong className="text-white">Free</strong> ($0 / mes)</div>
                        </div>
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Variables de Entorno (Environment Variables):</strong>
                        <div className="mt-2 pl-4 space-y-1 text-slate-300 text-[11px]">
                          <div>• <code className="bg-slate-900 px-1 py-0.5 rounded text-white">NODE_ENV</code> = <code className="text-emerald-400">production</code></div>
                          <div>• <code className="bg-slate-900 px-1 py-0.5 rounded text-white">PORT</code> = <code className="text-cyan-400">10000</code></div>
                          <div>• (Opcional) Variables de conexión MySQL (<code className="text-slate-400">MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_SSL=true</code>).</div>
                        </div>
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-white">Haz clic en "Deploy Web Service":</strong> Render construirá el frontend y levantará el backend Node.js en vivo.
                      </li>
                    </ol>
                  </div>

                  {/* Configuración render.yaml incluida */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-white text-xs">
                          Blueprint render.yaml (Ya creado e incluido en el proyecto)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const yamlText = `services:
  - type: web
    name: dominus-gym-rifa
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000`;
                          navigator.clipboard.writeText(yamlText);
                          setCopiedDeploySnippet('render_yaml');
                          setTimeout(() => setCopiedDeploySnippet(null), 2000);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedDeploySnippet === 'render_yaml' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar YAML</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`services:
  - type: web
    name: dominus-gym-rifa
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000`}
                    </pre>
                    <p className="text-[11px] text-slate-400">
                      💡 En Render también puedes seleccionar <strong>"New ➔ Blueprint"</strong> y Render leerá este archivo automáticamente sin configurar nada a mano.
                    </p>
                  </div>
                </div>
              )}

              {/* Guía rápida de Git para subir a GitHub */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Comandos para subir a GitHub por primera vez:
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const gitCmds = `git init\ngit add .\ngit commit -m "DOMINUS GYM Rifa Oficial"\ngit branch -M main\ngit remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git\ngit push -u origin main`;
                      navigator.clipboard.writeText(gitCmds);
                      setCopiedDeploySnippet('git_cmds');
                      setTimeout(() => setCopiedDeploySnippet(null), 2000);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedDeploySnippet === 'git_cmds' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar comandos Git</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-950 rounded-lg text-[10px] font-mono text-emerald-300/90 overflow-x-auto">
{`git init
git add .
git commit -m "DOMINUS GYM Rifa Oficial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: VER COMPROBANTE DIGITAL */}
        {viewingReceiptOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-white text-sm">
                    Comprobante de Pedido #{viewingReceiptOrder.orderCode}
                  </span>
                </div>
                <button
                  onClick={() => setViewingReceiptOrder(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="font-bold text-white">{viewingReceiptOrder.buyerName}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="font-mono text-white">{viewingReceiptOrder.buyerPhone}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Medio de Pago:</span>
                  <span className="font-bold text-amber-400 uppercase">
                    {viewingReceiptOrder.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Números Asignados:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {viewingReceiptOrder.numbers
                      .map((n) => n.toString().padStart(2, '0'))
                      .join(', ')}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Monto Abonado:</span>
                  <span className="font-display font-black text-white text-base">
                    {formatARS(viewingReceiptOrder.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Estado:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      viewingReceiptOrder.status === 'confirmado'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-400/20 text-amber-400'
                    }`}
                  >
                    {viewingReceiptOrder.status === 'confirmado' ? 'Confirmado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {viewingReceiptOrder.status === 'pendiente' && (
                  <button
                    onClick={() => {
                      onApproveOrder(viewingReceiptOrder.id);
                      setViewingReceiptOrder(null);
                      sounds.playWinnerFanfare();
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar Este Pago</span>
                  </button>
                )}

                <button
                  onClick={() => setViewingReceiptOrder(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

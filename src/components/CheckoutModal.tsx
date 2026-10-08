import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle, ShieldCheck, ArrowRight, Wallet, Building2, Store } from 'lucide-react';
import { RaffleConfig, Order } from '../types';
import { calculateTotal, formatARS } from '../utils/pricing';
import { launchConfetti } from '../utils/confetti';
import { sounds } from '../utils/audio';
import gymLogo from '../assets/images/logo.jpeg';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: number[];
  config: RaffleConfig;
  onConfirmOrder: (order: Order) => void;
}

type PaymentMethod = 'mercadopago' | 'transferencia' | 'efectivo';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  config,
  onConfirmOrder,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dni: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const pricing = calculateTotal(selectedNumbers.length, config.pricePerNumber);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    sounds.playTick();
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Ingresá tu nombre completo';
    if (!formData.phone.trim() || formData.phone.length < 8) errs.phone = 'Ingresá un WhatsApp válido';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Ingresá un email válido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `DG-${randomSuffix}`;

    const newOrder: Order = {
      id: orderCode,
      orderCode,
      numbers: [...selectedNumbers],
      buyerName: formData.name.trim(),
      buyerPhone: formData.phone.trim(),
      buyerEmail: formData.email.trim(),
      buyerDni: formData.dni.trim() || 'No especificado',
      totalAmount: pricing.total,
      discount: pricing.discount,
      paymentMethod,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    setCompletedOrder(newOrder);
    onConfirmOrder(newOrder);
    setStep('success');
    sounds.playWinnerFanfare();
    launchConfetti();
  };

  const formattedNumbers = selectedNumbers
    .map((n) => n.toString().padStart(2, '0'))
    .join(', ');

  const whatsappMessage = encodeURIComponent(
    paymentMethod === 'efectivo'
      ? `¡Hola DOMINUS GYM! 👋 Soy socio/participante (${formData.name}) y acabo de registrar los números [${formattedNumbers}] para el Sorteo Oficial del FIAT MOBI 2017 IMPECABLE! 🚗\n\n` +
        `📋 Datos de la reserva:\n` +
        `• Nombre: ${formData.name}\n` +
        `• Código de Reserva: ${completedOrder?.orderCode || 'DG-XXXX'}\n` +
        `• Total a abonar en el Gym: ${formatARS(pricing.total)}\n` +
        `• Método elegido: EN EL GYM (Recepción / Mostrador)\n\n` +
        `Paso por recepción (${config.gymAddress}) para abonar en el mostrador. ¡Por favor reserven mis números en el sistema! ¡Muchas gracias!`
      : `¡Hola DOMINUS GYM! 👋 Acabo de registrar los números [${formattedNumbers}] para el Sorteo Oficial del FIAT MOBI 2017 IMPECABLE! 🚗\n\n` +
        `📋 Datos de la reserva:\n` +
        `• Nombre: ${formData.name}\n` +
        `• Código: ${completedOrder?.orderCode || 'DG-XXXX'}\n` +
        `• Total: ${formatARS(pricing.total)}\n` +
        `• Método: ${paymentMethod === 'mercadopago' ? 'MERCADO PAGO' : 'TRANSFERENCIA BANCARIA'}\n\n` +
        `Te adjunto el comprobante de pago/transferencia para que aprueben mis números en el sistema. ¡Gracias!`
  );

  const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${whatsappMessage}`;

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
              {step === 'form' ? 'Finalizar Reserva de Números' : '¡Reserva Registrada con Éxito!'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Order summary pill */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Números seleccionados ({selectedNumbers.length}):</div>
                <div className="font-mono text-sm font-bold text-amber-400 mt-0.5">
                  {formattedNumbers}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Total a abonar:</div>
                <div className="text-lg font-display font-extrabold text-white tabular-nums">
                  {formatARS(pricing.total)}
                </div>
                {pricing.badge && (
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {pricing.badge}
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="text-[10px] text-emerald-400">
                    Ahorrás {formatARS(pricing.discount)}
                  </div>
                )}
              </div>
            </div>

            {/* Buyer inputs */}
            <div className="space-y-3.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Tus Datos de Contacto
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej: 11 3849 2041"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    DNI (para validar ganador)
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    placeholder="Ej: 38491829"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email para constancia *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: juanperez@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Payment method selection */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Método de Pago
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'mercadopago'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4 mb-1 text-sky-400" />
                  <div className="text-xs font-bold">Mercado Pago</div>
                  <div className="text-[10px] text-slate-400">Alias o CVU</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'transferencia'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1 text-emerald-400" />
                  <div className="text-xs font-bold">Transferencia</div>
                  <div className="text-[10px] text-slate-400">CBU Bancario</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'efectivo'
                      ? 'bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-400/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4 mb-1 text-amber-400" />
                  <div className="text-xs font-bold">En el Gym</div>
                  <div className="text-[10px] text-slate-400">Recepción / Mostrador</div>
                </button>
              </div>

              {/* Payment Details Box with Copy Buttons */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                {paymentMethod === 'mercadopago' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Titular de cuenta:</span>
                      <span className="font-semibold text-white">{config.accountHolder}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Alias Mercado Pago:</span>
                        <span className="font-mono font-bold text-amber-400">{config.mpAlias}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(config.mpAlias, 'mpAlias')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedField === 'mpAlias' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-slate-400 block text-[11px]">CVU Mercado Pago:</span>
                        <span className="font-mono text-slate-300 text-[11px]">{config.mpCvu}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(config.mpCvu, 'mpCvu')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedField === 'mpCvu' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {paymentMethod === 'transferencia' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Banco:</span>
                      <span className="font-semibold text-white">{config.bankName}</span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Titular y CUIT:</span>
                      <span className="font-semibold text-white">{config.accountHolder} · {config.cuit}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Alias Banco:</span>
                        <span className="font-mono font-bold text-amber-400">{config.bankAlias}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(config.bankAlias, 'bankAlias')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedField === 'bankAlias' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-slate-400 block text-[11px]">CBU Santander:</span>
                        <span className="font-mono text-slate-300 text-[11px]">{config.bankCbu}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(config.bankCbu, 'bankCbu')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedField === 'bankCbu' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {paymentMethod === 'efectivo' && (
                  <div className="space-y-3 p-1">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0 mt-0.5">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs sm:text-sm">Aboná directamente en DOMINUS GYM</p>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                          ¡Ideal para socios y personas que entrenan en el gym! Podés abonar en el mostrador en efectivo, débito o avisar a recepción con tu código de reserva.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Dirección de pago:</span>
                        <span className="text-white font-medium">{config.gymAddress}</span>
                        <div className="text-slate-400 text-[10px]">{config.gymCity}</div>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Horario de recepción:</span>
                        <span className="text-amber-300 font-medium">{config.gymHours}</span>
                        <div className="text-slate-400 text-[10px]">Lunes a Sábado</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Tus números quedarán <strong>reservados en el sistema</strong> con tu nombre hasta que abones en el gimnasio.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
            >
              <span>
                {paymentMethod === 'efectivo'
                  ? 'Confirmar Reserva para Abonar en el Gym'
                  : 'Confirmar y Enviar Comprobante'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Success Confirmation with direct WhatsApp button */
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-display text-2xl font-extrabold text-white">
                {paymentMethod === 'efectivo'
                  ? '¡Reserva Registrada para Abonar en el Gym!'
                  : '¡Reserva Generada con Éxito!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Tus números han quedado registrados a nombre de{' '}
                <strong className="text-white">{formData.name}</strong>.
              </p>
            </div>

            {/* Official Voucher summary card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">Código de Reserva:</span>
                <span className="font-mono font-bold text-amber-400">
                  {completedOrder?.orderCode}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">Tus Números:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formattedNumbers}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">Monto total:</span>
                <span className="font-display font-extrabold text-white text-base">
                  {formatARS(pricing.total)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Estado:</span>
                <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {paymentMethod === 'efectivo' ? 'Pendiente de pago en recepción del Gym' : 'Aguardando comprobante por WhatsApp'}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="space-y-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 ${
                  paymentMethod === 'efectivo'
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                } font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer`}
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>
                  {paymentMethod === 'efectivo'
                    ? 'Avisar Reserva por WhatsApp al Gym'
                    : 'Enviar Comprobante por WhatsApp'}
                </span>
              </a>

              <p className="text-[11px] text-slate-400 leading-normal">
                {paymentMethod === 'efectivo'
                  ? `Podés pasar a abonar directamente por recepción en ${config.gymAddress}. Al tocar el botón avisás de inmediato al WhatsApp de DOMINUS GYM.`
                  : 'Al presionar, se abrirá WhatsApp con el mensaje pre-armado y los números reservados para DOMINUS GYM.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar y volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

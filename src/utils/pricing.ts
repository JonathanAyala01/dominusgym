export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateTotal(count: number, basePrice: number = 8000): {
  total: number;
  originalTotal: number;
  discount: number;
  badge?: string;
  unitPrice: number;
} {
  const originalTotal = count * basePrice;
  if (count <= 0) {
    return { total: 0, originalTotal: 0, discount: 0, unitPrice: basePrice };
  }

  // 8 o más: $ 2.500 c/u (8 números = $20.000)
  if (count >= 8) {
    const unitPrice = 2500;
    const total = count * unitPrice;
    return {
      total,
      originalTotal,
      discount: Math.max(0, originalTotal - total),
      badge: '💰 8+ Llevando 8 o más ($2.500 c/u)',
      unitPrice,
    };
  }

  // 5 o más: $ 3.000 c/u (5 números = $15.000)
  if (count >= 5) {
    const unitPrice = 3000;
    const total = count * unitPrice;
    return {
      total,
      originalTotal,
      discount: Math.max(0, originalTotal - total),
      badge: '5+ Llevando 5 o más ($3.000 c/u)',
      unitPrice,
    };
  }

  // 3 o más: $ 3.333 c/u (3 números = $10.000)
  if (count >= 3) {
    const total = count === 3 ? 10000 : Math.round(count * (10000 / 3));
    const unitPrice = Math.round(total / count);
    return {
      total,
      originalTotal,
      discount: Math.max(0, originalTotal - total),
      badge: '3+ Llevando 3 o más ($3.333 c/u)',
      unitPrice,
    };
  }

  // Menos de 3: Precio base $ 8.000 c/u
  return {
    total: originalTotal,
    originalTotal,
    discount: 0,
    unitPrice: basePrice,
  };
}


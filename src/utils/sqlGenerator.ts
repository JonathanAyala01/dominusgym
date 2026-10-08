import { TicketNumber, Order, RaffleConfig } from '../types';

export function generateMysqlScript(
  tickets: TicketNumber[],
  orders: Order[],
  config: RaffleConfig
): string {
  const timestamp = new Date().toISOString();
  
  const escapeSql = (val: any) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val ? '1' : '0';
    return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  };

  let sql = `-- =====================================================================
-- DOMINUS GYM - BASE DE DATOS MYSQL OFICIAL
-- Generado para: Sorteo Fiat Mobi 2017 IMPECABLE 😍
-- Fecha de exportación: ${timestamp}
-- Compatible con: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Codificación: UTF-8 Unicode (utf8mb4)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`dominus_rifa\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`dominus_rifa\`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. TABLA: raffles_config
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`raffles_config\`;
CREATE TABLE \`raffles_config\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`subtitle\` VARCHAR(255) NOT NULL,
  \`organizer_name\` VARCHAR(150) NOT NULL,
  \`organizer_role\` VARCHAR(100) NOT NULL,
  \`price_per_number\` DECIMAL(10,2) NOT NULL,
  \`total_numbers\` INT UNSIGNED NOT NULL,
  \`draw_date\` VARCHAR(50) NOT NULL,
  \`draw_modality\` VARCHAR(150) NOT NULL,
  \`mp_alias\` VARCHAR(100) NOT NULL,
  \`mp_cvu\` VARCHAR(30) NOT NULL,
  \`bank_alias\` VARCHAR(100) NOT NULL,
  \`bank_cbu\` VARCHAR(30) NOT NULL,
  \`bank_name\` VARCHAR(100) NOT NULL,
  \`cuit\` VARCHAR(25) NOT NULL,
  \`account_holder\` VARCHAR(150) NOT NULL,
  \`whatsapp_number\` VARCHAR(30) NOT NULL,
  \`instagram_handle\` VARCHAR(100) NOT NULL,
  \`gym_address\` VARCHAR(255) NOT NULL,
  \`gym_city\` VARCHAR(150) NOT NULL,
  \`gym_hours\` VARCHAR(150) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`raffles_config\` (
  \`id\`, \`title\`, \`subtitle\`, \`organizer_name\`, \`organizer_role\`,
  \`price_per_number\`, \`total_numbers\`, \`draw_date\`, \`draw_modality\`,
  \`mp_alias\`, \`mp_cvu\`, \`bank_alias\`, \`bank_cbu\`, \`bank_name\`,
  \`cuit\`, \`account_holder\`, \`whatsapp_number\`, \`instagram_handle\`,
  \`gym_address\`, \`gym_city\`, \`gym_hours\`
) VALUES (
  1,
  ${escapeSql(config.title)},
  ${escapeSql(config.subtitle)},
  ${escapeSql(config.organizerName)},
  ${escapeSql(config.organizerRole)},
  ${config.pricePerNumber},
  ${config.totalNumbers},
  ${escapeSql(config.drawDate)},
  ${escapeSql(config.drawModality)},
  ${escapeSql(config.mpAlias)},
  ${escapeSql(config.mpCvu)},
  ${escapeSql(config.bankAlias)},
  ${escapeSql(config.bankCbu)},
  ${escapeSql(config.bankName)},
  ${escapeSql(config.cuit)},
  ${escapeSql(config.accountHolder)},
  ${escapeSql(config.whatsappNumber)},
  ${escapeSql(config.instagramHandle)},
  ${escapeSql(config.gymAddress)},
  ${escapeSql(config.gymCity)},
  ${escapeSql(config.gymHours)}
);

-- ---------------------------------------------------------------------
-- 2. TABLA: orders
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`orders\`;
CREATE TABLE \`orders\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`order_code\` VARCHAR(20) NOT NULL UNIQUE,
  \`buyer_name\` VARCHAR(150) NOT NULL,
  \`buyer_phone\` VARCHAR(50) NOT NULL,
  \`buyer_email\` VARCHAR(150) NULL,
  \`buyer_dni\` VARCHAR(30) NULL,
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  \`discount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`payment_method\` ENUM('mercadopago', 'transferencia', 'efectivo') NOT NULL DEFAULT 'mercadopago',
  \`status\` ENUM('pendiente', 'confirmado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  \`created_at\` VARCHAR(50) NOT NULL,
  INDEX \`idx_orders_status\` (\`status\`),
  INDEX \`idx_orders_code\` (\`order_code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  if (orders.length > 0) {
    sql += `-- Inserción de órdenes registradas (${orders.length})\n`;
    sql += `INSERT INTO \`orders\` (\`id\`, \`order_code\`, \`buyer_name\`, \`buyer_phone\`, \`buyer_email\`, \`buyer_dni\`, \`total_amount\`, \`discount\`, \`payment_method\`, \`status\`, \`created_at\`) VALUES\n`;
    const orderInserts = orders.map((o) => {
      return `(${escapeSql(o.id)}, ${escapeSql(o.orderCode)}, ${escapeSql(o.buyerName)}, ${escapeSql(o.buyerPhone)}, ${escapeSql(o.buyerEmail)}, ${escapeSql(o.buyerDni)}, ${o.totalAmount}, ${o.discount}, ${escapeSql(o.paymentMethod)}, ${escapeSql(o.status)}, ${escapeSql(o.createdAt)})`;
    });
    sql += orderInserts.join(',\n') + ';\n\n';
  }

  sql += `-- ---------------------------------------------------------------------
-- 3. TABLA: tickets (100 números del 00 al 99)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`tickets\`;
CREATE TABLE \`tickets\` (
  \`id\` INT UNSIGNED PRIMARY KEY,
  \`number_formatted\` VARCHAR(10) NOT NULL UNIQUE,
  \`status\` ENUM('available', 'reserved', 'sold') NOT NULL DEFAULT 'available',
  \`buyer_name\` VARCHAR(150) NULL,
  \`buyer_phone\` VARCHAR(50) NULL,
  \`buyer_email\` VARCHAR(150) NULL,
  \`buyer_dni\` VARCHAR(30) NULL,
  \`payment_method\` ENUM('mercadopago', 'transferencia', 'efectivo') NULL,
  \`purchase_date\` VARCHAR(50) NULL,
  \`order_code\` VARCHAR(20) NULL,
  INDEX \`idx_tickets_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`tickets\` (\`id\`, \`number_formatted\`, \`status\`, \`buyer_name\`, \`buyer_phone\`, \`buyer_email\`, \`buyer_dni\`, \`payment_method\`, \`purchase_date\`, \`order_code\`) VALUES
`;

  const ticketInserts = tickets.map((t) => {
    return `(${t.id}, ${escapeSql(t.numberFormatted)}, ${escapeSql(t.status)}, ${escapeSql(t.buyerName)}, ${escapeSql(t.buyerPhone)}, ${escapeSql(t.buyerEmail)}, ${escapeSql(t.buyerDni)}, ${escapeSql(t.paymentMethod)}, ${escapeSql(t.purchaseDate)}, ${escapeSql(t.orderCode)})`;
  });

  sql += ticketInserts.join(',\n') + ';\n\n';

  sql += `-- ---------------------------------------------------------------------
-- 4. TABLA: prizes (Premio Fiat Mobi 2017)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`prizes\`;
CREATE TABLE \`prizes\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`tier\` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  \`name\` VARCHAR(200) NOT NULL,
  \`badge\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`image\` VARCHAR(500) NOT NULL,
  \`winner_number\` INT UNSIGNED NULL,
  \`winner_name\` VARCHAR(150) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`prizes\` (\`id\`, \`tier\`, \`name\`, \`badge\`, \`description\`, \`image\`) VALUES
(1, 1, 'Fiat Mobi 2017 IMPECABLE 😍', 'ÚNICO PREMIO ESTRELLA', 'Fiat Mobi Easy 1.0 Fire 2017 en estado inmaculado. VTV al día, 68.000 km, papeles 100% listos.', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Fin del script MySQL DOMINUS GYM
-- =====================================================================
`;

  return sql;
}

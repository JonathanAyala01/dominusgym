-- =====================================================================
-- DOMINUS GYM - SISTEMA DE RIFAS Y SORTEOS
-- Base de Datos: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+
-- Codificación: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `dominus_rifa` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `dominus_rifa`;

-- ---------------------------------------------------------------------
-- 1. TABLA: raffles_config
-- Almacena la configuración general, datos de pago y sorteo
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `raffles_config` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL DEFAULT 'GRAN RIFA DOMINUS GYM',
  `subtitle` VARCHAR(255) NOT NULL DEFAULT 'FIAT MOBI 2017 IMPECABLE 😍',
  `organizer_name` VARCHAR(150) NOT NULL DEFAULT 'DOMINUS GYM',
  `organizer_role` VARCHAR(100) NOT NULL DEFAULT 'Gimnasio Oficial',
  `price_per_number` DECIMAL(10,2) NOT NULL DEFAULT 4000.00,
  `total_numbers` INT UNSIGNED NOT NULL DEFAULT 100,
  `draw_date` DATETIME NOT NULL,
  `draw_modality` VARCHAR(150) NOT NULL DEFAULT 'Lotería Nacional Nocturna / Bolillero en Vivo',
  `mp_alias` VARCHAR(100) NOT NULL DEFAULT 'dominus.gym.mp',
  `mp_cvu` VARCHAR(30) NOT NULL DEFAULT '0000003100012345678901',
  `bank_alias` VARCHAR(100) NOT NULL DEFAULT 'DOMINUS.GYM.BANCO',
  `bank_cbu` VARCHAR(30) NOT NULL DEFAULT '0110599520000012345678',
  `bank_name` VARCHAR(100) NOT NULL DEFAULT 'Banco de la Nación Argentina',
  `cuit` VARCHAR(25) NOT NULL DEFAULT '30-71234567-8',
  `account_holder` VARCHAR(150) NOT NULL DEFAULT 'DOMINUS GYM S.R.L.',
  `whatsapp_number` VARCHAR(30) NOT NULL DEFAULT '+5491123456789',
  `instagram_handle` VARCHAR(100) NOT NULL DEFAULT '@dominusgym.oficial',
  `gym_address` VARCHAR(255) NOT NULL DEFAULT 'Av. Principal 1234',
  `gym_city` VARCHAR(150) NOT NULL DEFAULT 'Buenos Aires, Argentina',
  `gym_hours` VARCHAR(150) NOT NULL DEFAULT 'Lunes a Viernes 07:00 a 22:00 | Sábados 09:00 a 18:00',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. TABLA: orders
-- Almacena los pedidos y compras de rifas (online o en efectivo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `order_code` VARCHAR(20) NOT NULL UNIQUE,
  `buyer_name` VARCHAR(150) NOT NULL,
  `buyer_phone` VARCHAR(50) NOT NULL,
  `buyer_email` VARCHAR(150) NULL,
  `buyer_dni` VARCHAR(30) NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('mercadopago', 'transferencia', 'efectivo') NOT NULL DEFAULT 'mercadopago',
  `status` ENUM('pendiente', 'confirmado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  `receipt_url` VARCHAR(500) NULL,
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_code` (`order_code`),
  INDEX `idx_orders_phone` (`buyer_phone`),
  INDEX `idx_orders_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. TABLA: tickets
-- Almacena cada número de rifa (del 00 al 99)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INT UNSIGNED PRIMARY KEY,
  `number_formatted` VARCHAR(10) NOT NULL UNIQUE,
  `status` ENUM('available', 'reserved', 'sold') NOT NULL DEFAULT 'available',
  `buyer_name` VARCHAR(150) NULL,
  `buyer_phone` VARCHAR(50) NULL,
  `buyer_email` VARCHAR(150) NULL,
  `buyer_dni` VARCHAR(30) NULL,
  `payment_method` ENUM('mercadopago', 'transferencia', 'efectivo') NULL,
  `purchase_date` DATETIME NULL,
  `order_code` VARCHAR(20) NULL,
  `order_id` VARCHAR(64) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tickets_status` (`status`),
  INDEX `idx_tickets_order_code` (`order_code`),
  CONSTRAINT `fk_tickets_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. TABLA: order_tickets
-- Relación muchos-a-muchos detallada entre órdenes y números
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_tickets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `ticket_id` INT UNSIGNED NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_order_ticket` (`order_id`, `ticket_id`),
  CONSTRAINT `fk_ot_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ot_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. TABLA: prizes
-- Almacena los premios del sorteo (Fiat Mobi 2017 IMPECABLE)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prizes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tier` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `name` VARCHAR(200) NOT NULL,
  `badge` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `items_json` JSON NULL,
  `specs_json` JSON NULL,
  `image` VARCHAR(500) NOT NULL,
  `gallery_json` JSON NULL,
  `winner_number` INT UNSIGNED NULL,
  `winner_name` VARCHAR(150) NULL,
  `winner_announced_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. TABLA: audit_logs
-- Registro de eventos (ventas, aprobaciones, sorteo con bolillero)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(100) NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

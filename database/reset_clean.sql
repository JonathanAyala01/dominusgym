-- =====================================================================
-- DOMINUS GYM - SCRIPT PARA BLANQUEAR BASE DE DATOS (RESETEO A 0)
-- Ejecutar este archivo para dejar el sistema 100% limpio y listo
-- para cargar ventas reales desde cero.
-- Base de Datos: MySQL 5.7+ / 8.0+ / MariaDB
-- =====================================================================

USE `dominus_rifa`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Vaciar todas las órdenes de compra anteriores
TRUNCATE TABLE `order_tickets`;
TRUNCATE TABLE `orders`;

-- 2. Limpiar registros de auditoría
TRUNCATE TABLE `audit_logs`;

-- 3. Blanquear todos los 100 números (del 00 al 99) poniéndolos en 'available'
-- y borrando cualquier comprador, teléfono, DNI o código de pedido previo
UPDATE `tickets` 
SET 
  `status` = 'available',
  `buyer_name` = NULL,
  `buyer_phone` = NULL,
  `buyer_email` = NULL,
  `buyer_dni` = NULL,
  `payment_method` = NULL,
  `purchase_date` = NULL,
  `order_code` = NULL;

-- 4. Si la tabla de tickets no tenía los 100 números creados, insertarlos limpios
INSERT INTO `tickets` (`id`, `number_formatted`, `status`) VALUES
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
  `status` = 'available',
  `buyer_name` = NULL,
  `buyer_phone` = NULL,
  `buyer_email` = NULL,
  `buyer_dni` = NULL,
  `payment_method` = NULL,
  `purchase_date` = NULL,
  `order_code` = NULL;

-- 5. Restablecer el premio sin ganador asignado
UPDATE `prizes` 
SET 
  `winner_number` = NULL,
  `winner_name` = NULL,
  `winner_announced_at` = NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- ¡BASE DE DATOS BLANQUEADA EXITOSAMENTE!
-- 100 Números (00 al 99) 100% DISPONIBLES y 0 Órdenes Registradas.
-- =====================================================================

-- =====================================================================
-- DOMINUS GYM - DATOS INICIALES (SEED DATA)
-- Compatible con MySQL / MariaDB
-- =====================================================================

USE `dominus_rifa`;

-- 1. Insertar configuración por defecto si la tabla está vacía
INSERT INTO `raffles_config` (
  `id`, `title`, `subtitle`, `organizer_name`, `organizer_role`,
  `price_per_number`, `total_numbers`, `draw_date`, `draw_modality`,
  `mp_alias`, `mp_cvu`, `bank_alias`, `bank_cbu`, `bank_name`,
  `cuit`, `account_holder`, `whatsapp_number`, `instagram_handle`,
  `gym_address`, `gym_city`, `gym_hours`
) VALUES (
  1,
  'GRAN RIFA DOMINUS GYM',
  'FIAT MOBI 2017 IMPECABLE 😍',
  'DOMINUS GYM',
  'Gimnasio Oficial',
  4000.00,
  100,
  '2026-10-31 21:00:00',
  'Lotería Nacional Nocturna / Bolillero en Vivo',
  'dominus.gym.mp',
  '0000003100012345678901',
  'DOMINUS.GYM.BANCO',
  '0110599520000012345678',
  'Banco de la Nación Argentina',
  '30-71234567-8',
  'DOMINUS GYM S.R.L.',
  '+5491123456789',
  '@dominusgym.oficial',
  'Av. Principal 1234',
  'Buenos Aires, Argentina',
  'Lunes a Viernes 07:00 a 22:00 | Sábados 09:00 a 18:00'
) ON DUPLICATE KEY UPDATE `id` = `id`;

-- 2. Insertar los 100 números (del 00 al 99)
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
ON DUPLICATE KEY UPDATE `number_formatted` = VALUES(`number_formatted`);

-- 3. Insertar el Premio Único: Fiat Mobi 2017 IMPECABLE
INSERT INTO `prizes` (
  `id`, `tier`, `name`, `badge`, `description`, `items_json`, `specs_json`, `image`
) VALUES (
  1,
  1,
  'Fiat Mobi 2017 IMPECABLE 😍',
  'ÚNICO PREMIO ESTRELLA',
  '¡Te vas manejando un Fiat Mobi 2017 en estado inmaculado! Naftero 1.0 Fire, aire acondicionado, dirección asistida, cierre centralizado, cubiertas semi-nuevas, VTV al día y papeles 100% listos para transferir.',
  JSON_ARRAY(
    'Fiat Mobi Easy 1.0 2017 (Inmaculado)',
    'Transferencia incluida o lista para firmar',
    'VTV al día y grabado de autopartes',
    'Tanque lleno para salir a la ruta'
  ),
  JSON_OBJECT(
    'Año', '2017',
    'Motor', '1.0 Fire EVO 8V',
    'Kilometraje', '68.000 km reales',
    'Transmisión', 'Manual 5 velocidades',
    'Combustible', 'Nafta súper',
    'Equipamiento', 'Aire acondicionado, Dirección asistida, Airbags frontales, Frenos ABS'
  ),
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

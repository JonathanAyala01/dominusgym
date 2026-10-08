import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import { TicketNumber, Order, RaffleConfig } from '../src/types';

dotenv.config();

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl?: boolean;
}

export interface DbStatus {
  connected: boolean;
  driver: 'mysql2';
  host: string;
  port: number;
  database: string;
  user: string;
  serverVersion?: string;
  tableCounts?: {
    tickets: number;
    orders: number;
    configExists: boolean;
  };
  lastError?: string;
  checkedAt: string;
}

let pool: Pool | null = null;
let currentDbConfig: DbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'dominus_rifa',
  ssl: process.env.MYSQL_SSL === 'true',
};

// Initialize or get connection pool
export function getDbPool(customConfig?: Partial<DbConfig>): Pool {
  if (customConfig) {
    currentDbConfig = { ...currentDbConfig, ...customConfig };
    if (pool) {
      pool.end().catch(() => {});
      pool = null;
    }
  }

  if (!pool) {
    pool = mysql.createPool({
      host: currentDbConfig.host,
      port: currentDbConfig.port,
      user: currentDbConfig.user,
      password: currentDbConfig.password,
      database: currentDbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000,
      ssl: currentDbConfig.ssl ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

// Test MySQL connection and return diagnostics
export async function testDbConnection(configToTest?: Partial<DbConfig>): Promise<{
  success: boolean;
  message: string;
  version?: string;
  pingMs?: number;
  error?: string;
}> {
  const startTime = Date.now();
  const testConfig: DbConfig = {
    host: configToTest?.host || currentDbConfig.host,
    port: configToTest?.port || currentDbConfig.port,
    user: configToTest?.user || currentDbConfig.user,
    password: configToTest?.password !== undefined ? configToTest.password : currentDbConfig.password,
    database: configToTest?.database || currentDbConfig.database,
    ssl: configToTest?.ssl !== undefined ? configToTest.ssl : currentDbConfig.ssl,
  };

  let connection: PoolConnection | null = null;
  try {
    const tempPool = mysql.createPool({
      host: testConfig.host,
      port: testConfig.port,
      user: testConfig.user,
      password: testConfig.password,
      database: testConfig.database,
      waitForConnections: false,
      connectTimeout: 4000,
      ssl: testConfig.ssl ? { rejectUnauthorized: false } : undefined,
    });

    connection = await tempPool.getConnection();
    const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as dbName, NOW() as serverTime');
    const elapsed = Date.now() - startTime;
    const info = (rows as any[])[0];

    await connection.release();
    await tempPool.end();

    return {
      success: true,
      message: `Conexión exitosa a MySQL ${info.version} en base '${info.dbName}' (${elapsed}ms)`,
      version: info.version,
      pingMs: elapsed,
    };
  } catch (err: any) {
    if (connection) {
      try {
        await connection.release();
      } catch {}
    }

    let friendlyMsg = err.message || 'Error desconocido al conectar con MySQL';
    if (err.code === 'ECONNREFUSED') {
      friendlyMsg = `No se pudo conectar a ${testConfig.host}:${testConfig.port}. Verificá que el servidor MySQL o MariaDB esté corriendo.`;
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      friendlyMsg = `Acceso denegado para el usuario '${testConfig.user}'. Verificá la contraseña y los permisos en MySQL.`;
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      friendlyMsg = `La base de datos '${testConfig.database}' no existe en el servidor. Creala ejecutando 'CREATE DATABASE ${testConfig.database};'.`;
    } else if (err.code === 'ETIMEDOUT') {
      friendlyMsg = `Tiempo de espera agotado al conectar con ${testConfig.host}. Verificá el firewall o la dirección del host.`;
    }

    return {
      success: false,
      message: friendlyMsg,
      error: err.code || err.message,
    };
  }
}

// Check live DB status
export async function getDbStatus(): Promise<DbStatus> {
  const result: DbStatus = {
    connected: false,
    driver: 'mysql2',
    host: currentDbConfig.host,
    port: currentDbConfig.port,
    database: currentDbConfig.database,
    user: currentDbConfig.user,
    checkedAt: new Date().toISOString(),
  };

  try {
    const p = getDbPool();
    const [vRows] = await p.query('SELECT VERSION() as version');
    result.serverVersion = (vRows as any[])[0]?.version;
    result.connected = true;

    // Check table counts
    const [tRows] = await p.query('SELECT COUNT(*) as cnt FROM tickets');
    const [oRows] = await p.query('SELECT COUNT(*) as cnt FROM orders');
    const [cRows] = await p.query('SELECT COUNT(*) as cnt FROM raffles_config');

    result.tableCounts = {
      tickets: (tRows as any[])[0]?.cnt || 0,
      orders: (oRows as any[])[0]?.cnt || 0,
      configExists: ((cRows as any[])[0]?.cnt || 0) > 0,
    };
  } catch (err: any) {
    result.connected = false;
    result.lastError = err.message;
  }

  return result;
}

// Generate complete runnable SQL DUMP file with schema and current state
export function generateSqlDump(
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
-- DOMINUS GYM - COPIA DE SEGURIDAD Y DUMP SQL
-- Generado automáticamente: ${timestamp}
-- Motor: MySQL 5.7+ / 8.0+ / MariaDB
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`dominus_rifa\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`dominus_rifa\`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Estructura de tabla: raffles_config
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
-- Estructura de tabla: orders
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
  \`created_at\` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  if (orders.length > 0) {
    sql += `-- Volcado de órdenes (${orders.length} registros)\n`;
    sql += `INSERT INTO \`orders\` (\`id\`, \`order_code\`, \`buyer_name\`, \`buyer_phone\`, \`buyer_email\`, \`buyer_dni\`, \`total_amount\`, \`discount\`, \`payment_method\`, \`status\`, \`created_at\`) VALUES\n`;
    const orderInserts = orders.map((o) => {
      return `(${escapeSql(o.id)}, ${escapeSql(o.orderCode)}, ${escapeSql(o.buyerName)}, ${escapeSql(o.buyerPhone)}, ${escapeSql(o.buyerEmail)}, ${escapeSql(o.buyerDni)}, ${o.totalAmount}, ${o.discount}, ${escapeSql(o.paymentMethod)}, ${escapeSql(o.status)}, ${escapeSql(o.createdAt)})`;
    });
    sql += orderInserts.join(',\n') + ';\n\n';
  }

  sql += `-- ---------------------------------------------------------------------
-- Estructura de tabla: tickets
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
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de 100 números de rifa
INSERT INTO \`tickets\` (\`id\`, \`number_formatted\`, \`status\`, \`buyer_name\`, \`buyer_phone\`, \`buyer_email\`, \`buyer_dni\`, \`payment_method\`, \`purchase_date\`, \`order_code\`) VALUES
`;

  const ticketInserts = tickets.map((t) => {
    return `(${t.id}, ${escapeSql(t.numberFormatted)}, ${escapeSql(t.status)}, ${escapeSql(t.buyerName)}, ${escapeSql(t.buyerPhone)}, ${escapeSql(t.buyerEmail)}, ${escapeSql(t.buyerDni)}, ${escapeSql(t.paymentMethod)}, ${escapeSql(t.purchaseDate)}, ${escapeSql(t.orderCode)})`;
  });

  sql += ticketInserts.join(',\n') + ';\n\n';
  sql += `SET FOREIGN_KEY_CHECKS = 1;\n-- Fin del dump MySQL DOMINUS GYM\n`;

  return sql;
}

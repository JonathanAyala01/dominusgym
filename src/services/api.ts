import { TicketNumber, Order, RaffleConfig } from '../types';

export interface DbStatusResponse {
  connected: boolean;
  driver: string;
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

export interface DbTestResult {
  success: boolean;
  message: string;
  version?: string;
  pingMs?: number;
  error?: string;
}

export const api = {
  // Check live MySQL DB status
  async getDbStatus(): Promise<DbStatusResponse | null> {
    try {
      const res = await fetch('/api/db/status');
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  },

  // Test custom or current MySQL connection
  async testDbConnection(config: {
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
    ssl?: boolean;
  }): Promise<DbTestResult> {
    try {
      const res = await fetch('/api/db/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: 'No se pudo comunicar con el servidor backend',
        error: err.message,
      };
    }
  },

  // Fetch schema.sql text
  async getSchemaSql(): Promise<string> {
    try {
      const res = await fetch('/api/db/schema');
      if (!res.ok) throw new Error('Error al obtener schema.sql');
      return await res.text();
    } catch (err: any) {
      throw err;
    }
  },

  // Fetch reset_clean.sql text (blanquear a 0)
  async getResetCleanSql(): Promise<string> {
    try {
      const res = await fetch('/api/db/reset-clean-sql');
      if (!res.ok) throw new Error('Error al obtener reset_clean.sql');
      return await res.text();
    } catch (err: any) {
      throw err;
    }
  },

  // Export and download current state as full SQL dump
  async exportSqlDump(tickets: TicketNumber[], orders: Order[], config: RaffleConfig): Promise<Blob> {
    const res = await fetch('/api/db/export-sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets, orders, config }),
    });

    if (!res.ok) {
      throw new Error('Error al generar el dump SQL');
    }

    return await res.blob();
  },
};

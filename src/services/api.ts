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

export const STORAGE_BACKEND_URL_KEY = 'dominus_gym_backend_url';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_BACKEND_URL_KEY);
    if (stored && stored.trim()) {
      return stored.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
};

export const setApiBaseUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    const clean = url.trim().replace(/\/+$/, '');
    if (clean) {
      localStorage.setItem(STORAGE_BACKEND_URL_KEY, clean);
    } else {
      localStorage.removeItem(STORAGE_BACKEND_URL_KEY);
    }
  }
};

export const api = {
  getApiBaseUrl,
  setApiBaseUrl,

  // Check health of Render backend
  async checkBackendHealth(targetUrl?: string): Promise<{
    connected: boolean;
    pingMs: number;
    url: string;
    data?: any;
    error?: string;
  }> {
    const base = targetUrl !== undefined ? targetUrl.trim().replace(/\/+$/, '') : getApiBaseUrl();
    const endpoint = `${base}/api/health`;
    const start = performance.now();
    try {
      const res = await fetch(endpoint, { method: 'GET', cache: 'no-cache' });
      const pingMs = Math.round(performance.now() - start);
      if (!res.ok) {
        return {
          connected: false,
          pingMs,
          url: endpoint,
          error: `HTTP ${res.status}: ${res.statusText}`,
        };
      }
      const data = await res.json();
      return {
        connected: true,
        pingMs,
        url: endpoint,
        data,
      };
    } catch (err: any) {
      const pingMs = Math.round(performance.now() - start);
      return {
        connected: false,
        pingMs,
        url: endpoint,
        error: err.message || 'Error de red al conectar con el backend de Render',
      };
    }
  },

  // Check live MySQL DB status
  async getDbStatus(): Promise<DbStatusResponse | null> {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/db/status`);
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
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/db/test`, {
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
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/db/schema`);
      if (!res.ok) throw new Error('Error al obtener schema.sql');
      return await res.text();
    } catch (err: any) {
      throw err;
    }
  },

  // Fetch reset_clean.sql text (blanquear a 0)
  async getResetCleanSql(): Promise<string> {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/db/reset-clean-sql`);
      if (!res.ok) throw new Error('Error al obtener reset_clean.sql');
      return await res.text();
    } catch (err: any) {
      throw err;
    }
  },

  // Export and download current state as full SQL dump
  async exportSqlDump(tickets: TicketNumber[], orders: Order[], config: RaffleConfig): Promise<Blob> {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/api/db/export-sql`, {
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

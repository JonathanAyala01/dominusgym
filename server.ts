import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getDbPool,
  getDbStatus,
  testDbConnection,
  generateSqlDump,
  DbConfig,
} from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // MySQL Database Management API Endpoints
  // ==========================================

  // 1. Get current MySQL status
  app.get('/api/db/status', async (req: Request, res: Response) => {
    try {
      const status = await getDbStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Test connection with credentials (live tester)
  app.post('/api/db/test', async (req: Request, res: Response) => {
    try {
      const { host, port, user, password, database, ssl } = req.body;
      const result = await testDbConnection({
        host,
        port: port ? parseInt(port, 10) : undefined,
        user,
        password,
        database,
        ssl: ssl === true || ssl === 'true',
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Return schema.sql file content
  app.get('/api/db/schema', (req: Request, res: Response) => {
    try {
      const schemaPath = path.resolve(__dirname, 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(sqlContent);
      } else {
        res.status(404).json({ error: 'schema.sql not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3b. Return reset_clean.sql file content
  app.get('/api/db/reset-clean-sql', (req: Request, res: Response) => {
    try {
      const resetPath = path.resolve(__dirname, 'database', 'reset_clean.sql');
      if (fs.existsSync(resetPath)) {
        const sqlContent = fs.readFileSync(resetPath, 'utf-8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(sqlContent);
      } else {
        res.status(404).json({ error: 'reset_clean.sql not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Generate & download complete SQL Dump from current state
  app.post('/api/db/export-sql', (req: Request, res: Response) => {
    try {
      const { tickets, orders, config } = req.body;
      if (!tickets || !config) {
        return res.status(400).json({ error: 'Missing tickets or config data' });
      }
      const dumpSql = generateSqlDump(tickets, orders || [], config);
      res.setHeader('Content-Type', 'application/sql; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="dominus_rifa_backup.sql"');
      res.send(dumpSql);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DOMINUS GYM Rifa Backend',
      mysqlDriver: 'mysql2',
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // Vite Integration (Dev) or Static (Prod)
  // ==========================================
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DOMINUS GYM Server running on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

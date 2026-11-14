import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

const ADMIN_EMAIL = process.env.PREVIEW_ADMIN_EMAIL || 'admin@asautodreams.com.br';
const ADMIN_PASSWORD = process.env.PREVIEW_ADMIN_PASSWORD || 'asautodreams2026';

interface StoreData {
  vehicles: Record<string, unknown>[];
  leads: Record<string, unknown>[];
}

const activeSessions = new Map<string, { id: string; email: string; expiresAt: number }>();

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function readStore(): Promise<StoreData> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : [],
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
    };
  } catch {
    const initial: StoreData = { vehicles: [], leads: [] };
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await ensureDirs();
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getBearerToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Sessão administrativa não informada.' });
  }
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/admin/login', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Credenciais administrativas inválidas.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user = { id: 'preview-admin-1', email: ADMIN_EMAIL };
    activeSessions.set(token, { ...user, expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
    return res.json({ token, user });
  });

  app.post('/api/admin/logout', (req, res) => {
    const token = getBearerToken(req);
    if (token) activeSessions.delete(token);
    return res.json({ ok: true });
  });

  app.get('/api/admin/me', requireAdmin, (req, res) => {
    const token = getBearerToken(req)!;
    const session = activeSessions.get(token)!;
    return res.json({ user: { id: session.id, email: session.email } });
  });

  app.get('/api/vehicles', async (_req, res) => {
    try {
      const store = await readStore();
      const sorted = [...store.vehicles].sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || ''))
      );
      res.json(sorted);
    } catch {
      res.status(500).json({ error: 'Erro ao ler veículos.' });
    }
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const store = await readStore();
      const found = store.vehicles.find((v) => v.id === req.params.id);
      if (!found) return res.status(404).json({ error: 'Veículo não encontrado.' });
      res.json(found);
    } catch {
      res.status(500).json({ error: 'Erro ao buscar veículo.' });
    }
  });

  app.post('/api/vehicles', requireAdmin, async (req, res) => {
    try {
      const store = await readStore();
      const now = new Date().toISOString();
      const vehicle = {
        ...req.body,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      };
      store.vehicles.unshift(vehicle);
      await writeStore(store);
      res.status(201).json(vehicle);
    } catch {
      res.status(500).json({ error: 'Erro ao cadastrar veículo.' });
    }
  });

  app.patch('/api/vehicles/:id', requireAdmin, async (req, res) => {
    try {
      const store = await readStore();
      const idx = store.vehicles.findIndex((v) => v.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Veículo não encontrado.' });

      const updated = {
        ...store.vehicles[idx],
        ...req.body,
        id: store.vehicles[idx].id,
        updated_at: new Date().toISOString(),
      };
      store.vehicles[idx] = updated;
      await writeStore(store);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Erro ao atualizar veículo.' });
    }
  });

  app.delete('/api/vehicles/:id', requireAdmin, async (req, res) => {
    try {
      const store = await readStore();
      const before = store.vehicles.length;
      store.vehicles = store.vehicles.filter((v) => v.id !== req.params.id);
      if (store.vehicles.length === before) {
        return res.status(404).json({ error: 'Veículo não encontrado.' });
      }
      await writeStore(store);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'Erro ao excluir veículo.' });
    }
  });

  app.post('/api/upload', requireAdmin, async (req, res) => {
    try {
      const fileName = String(req.body?.fileName || `img-${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '');
      const dataUrl = String(req.body?.dataUrl || '');
      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Formato de imagem inválido.' });
      }
      await ensureDirs();
      const buffer = Buffer.from(match[2], 'base64');
      const targetPath = path.join(UPLOADS_DIR, fileName);
      await fs.writeFile(targetPath, buffer);
      res.json({ url: `/uploads/${fileName}` });
    } catch {
      res.status(500).json({ error: 'Erro ao salvar fotografia.' });
    }
  });

  app.get('/api/leads', requireAdmin, async (_req, res) => {
    try {
      const store = await readStore();
      const sorted = [...store.leads].sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || ''))
      );
      res.json(sorted);
    } catch {
      res.status(500).json({ error: 'Erro ao listar interessados.' });
    }
  });

  app.post('/api/leads', async (req, res) => {
    try {
      if (!req.body?.lgpd_consent) {
        return res.status(400).json({ error: 'Consentimento LGPD é obrigatório.' });
      }
      if (!req.body?.full_name || !req.body?.phone) {
        return res.status(400).json({ error: 'Nome completo e telefone são obrigatórios.' });
      }
      const store = await readStore();
      const lead = {
        id: crypto.randomUUID(),
        vehicle_id: req.body.vehicle_id || null,
        vehicle_title: String(req.body.vehicle_title || 'Consultoria Automotiva'),
        full_name: String(req.body.full_name).trim(),
        phone: String(req.body.phone).trim(),
        message: String(req.body.message || '').trim(),
        lgpd_consent: true,
        contacted: false,
        created_at: new Date().toISOString(),
      };
      store.leads.unshift(lead);
      await writeStore(store);
      res.status(201).json(lead);
    } catch {
      res.status(500).json({ error: 'Erro ao registrar interesse.' });
    }
  });

  app.patch('/api/leads/:id', requireAdmin, async (req, res) => {
    try {
      const store = await readStore();
      const idx = store.leads.findIndex((l) => l.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Registro não encontrado.' });
      store.leads[idx] = {
        ...store.leads[idx],
        contacted: Boolean(req.body?.contacted),
      };
      await writeStore(store);
      res.json(store.leads[idx]);
    } catch {
      res.status(500).json({ error: 'Erro ao atualizar lead.' });
    }
  });

  app.delete('/api/leads/:id', requireAdmin, async (req, res) => {
    try {
      const store = await readStore();
      store.leads = store.leads.filter((l) => l.id !== req.params.id);
      await writeStore(store);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'Erro ao excluir lead.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AS Auto Dreams server running on port ${PORT}`);
  });
}

startServer();

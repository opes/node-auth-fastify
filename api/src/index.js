import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDb } from './utils/db.js';
import accountsController from './controllers/accounts.js';
import dashboardController from './controllers/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'localhost';
const PORT = process.env.PORT || 7891;

const app = fastify({ logger: false });

async function start() {
  try {
    app.register(fastifyCors, {
      origin: [/\.nodeauth.dev/, 'https://nodeauth.dev'],
      credentials: true,
    });

    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
    });

    app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    });

    app.register(accountsController, { prefix: '/api/v1/accounts' });
    app.register(dashboardController, { prefix: '/api/v1/dashboard' });

    console.log(`🚀 Server launching on https://${ROOT_DOMAIN}:${PORT}`);
    await app.listen(PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

connectDb().then(start).catch(console.error);

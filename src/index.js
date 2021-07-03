import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDb } from './utils/db.js';
import accountsController from './controllers/accounts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_URI = process.env.APP_URI || 'http://localhost';
const PORT = process.env.PORT || 7891;

const app = fastify({ logger: false });

async function start() {
  try {
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
    });

    app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    });

    app.register(accountsController, { prefix: '/api/v1/accounts' });

    console.log(`🚀 Server launching on ${APP_URI}:${PORT}`);
    await app.listen(PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

connectDb().then(start).catch(console.error);

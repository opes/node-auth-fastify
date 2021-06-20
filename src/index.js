import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_URI = process.env.APP_URI || 'http://localhost';
const PORT = process.env.PORT || 7891;

const app = fastify({ logger: true });

async function start() {
  try {
    app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    });

    console.log(`🚀 Server launching on ${APP_URI}:${PORT}`);
    await app.listen(PORT);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

connectDb().then(start).catch(console.error);

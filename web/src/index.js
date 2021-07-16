import './env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'localhost';
const PORT = process.env.PORT || 7890;

const app = fastify({ logger: false });

async function start() {
  try {
    app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    });

    app.get('/verify/:email/:token', {}, async (req, reply) => {
      try {
        const { email, token } = req.params;
        const values = { email, token };
        const httpsAgent = new https.Agent({
          rejectUnauthorized: false,
        });
        const res = await fetch(
          `https://${process.env.API_DOMAIN}/api/v1/accounts/verify`,
          {
            method: 'POST',
            body: JSON.stringify(values),
            credentials: 'include',
            agent: httpsAgent,
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          }
        );
        const json = await res.json();

        reply.redirect(`/?success=${json.success}&verified=${json.verified}`);
      } catch (err) {
        console.error(err);
        reply.status(500).send({
          success: false,
          status: 'ERROR',
        });
      }
    });

    app.get(
      '/reset-password/:expires/:email/:token',
      {},
      async (req, reply) => {
        try {
          const { email, expires, token } = req.params;

          // TODO: Create UI for changing password
          reply.send({
            email,
            expires: new Date(Number(expires)).toDateString(),
            token,
          });
        } catch (err) {
          console.error(err);
          reply.status(500).send({
            success: false,
            status: 'ERROR',
          });
        }
      }
    );

    console.log(`🚀 Server launching on https://${ROOT_DOMAIN}:${PORT}`);
    await app.listen(PORT);
  } catch (err) {
    console.error(err);
  }
}

start();

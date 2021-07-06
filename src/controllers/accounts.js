const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  },
};

export default async function routes(app, options) {
  const { default: AccountService } = await import(
    '../services/AccountService.js'
  );
  const { default: AuthService } = await import('../services/AuthService.js');

  app.post('/register', opts, async (req, reply) => {
    try {
      const account = await AccountService.register(req.body);

      reply.send({
        success: true,
        message: `Account registered!`,
        payload: account.toJSON(),
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  app.post('/login', opts, async (req, reply) => {
    try {
      await AuthService.login(req, reply);

      reply.send({
        success: true,
        message: `Logged in!`,
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  app.post('/logout', async (req, reply) => {
    try {
      await AuthService.logout(req, reply);

      reply.send({
        success: true,
        message: `Logged out!`,
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}

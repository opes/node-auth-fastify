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

  const { default: SessionService } = await import(
    '../services/SessionService.js'
  );

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
      const account = await AccountService.verify(req.body);
      if (!account) throw new Error('Account does not exist');

      await SessionService.create(
        {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          userId: account.id,
        },
        reply
      );

      reply.send({
        success: true,
        message: `Logged in!`,
        payload: account.toJSON(),
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}

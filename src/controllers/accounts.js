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
  const { default: Account } = await import('../models/Account.js');

  app.post('/register', opts, async (req, reply) => {
    try {
      const account = await Account.create(req.body);
      reply.send({
        success: true,
        message: `Account registered!`,
        payload: account.toJSON()
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}

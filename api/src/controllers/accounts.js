const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        oldPassword: { type: 'string' },
        newPassword: { type: 'string' },
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

  app.post('/logout', opts, async (req, reply) => {
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

  app.post('/verify', opts, async (req, reply) => {
    try {
      const verified = await AccountService.verify(req.body);

      reply.send({
        success: true,
        verified,
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  app.post('/forgot-password', opts, async (req, reply) => {
    try {
      const { email } = req.body;

      await AccountService.requestPasswordReset(email);

      reply.send({
        success: true,
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  app.post('/change-password', opts, async (req, reply) => {
    try {
      // TODO: Support password resets
      const account = await AuthService.currentUser(req, reply);
      const { oldPassword, newPassword } = req.body;

      if (account) {
        await AccountService.changePassword({
          email: account.email,
          oldPassword,
          newPassword,
        });

        reply.send({
          success: true,
          message: 'Password updated!',
        });
      }

      reply.send({
        success: false,
        message: 'You must be signed in to continue',
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}

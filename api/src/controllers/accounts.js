import { STATUS } from '../utils/constants.js';

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
      const status = await AuthService.login(req, reply);

      reply.send({
        success: true,
        status,
        message:
          status === STATUS.requires2fa
            ? `2FA Required before logging in`
            : `Logged in!`,
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
      const verified = await AccountService.verifyEmail(req.body);

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

  app.post('/reset-password', opts, async (req, reply) => {
    try {
      const success = await AccountService.resetPassword(req.body);

      reply.send({ success });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  app.post('/register-2fa', {}, async (req, reply) => {
    try {
      const { token, secret } = req.body;
      const account = await AuthService.currentUser(req, reply);
      const success = await AuthService.register2fa({ account, secret, token });

      reply.send({ success });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  app.post('/verify-2fa', {}, async (req, reply) => {
    try {
      const status = await AuthService.login(req, reply);

      reply.send({
        success: true,
        message:
          status === STATUS.invalid2fa ? '2FA token invalid' : 'Logged in!',
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  app.get('/self', {}, async (req, reply) => {
    try {
      const account = await AuthService.currentUser(req, reply);

      reply.send({ success: true, account });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}

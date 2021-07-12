export default async function routes(app, options) {
  const { default: AuthService } = await import('../services/AuthService.js');

  app.get('/', {}, async (req, reply) => {
    try {
      const account = await AuthService.currentUser(req, reply);

      if (account) {
        reply.send({
          success: true,
          message: `Account Dashboard`,
          payload: account,
        });
      }

      reply.status(401).send({
        success: false,
        message: `You must sign in to continue`,
        payload: {},
      });
    } catch (err) {
      app.log.error(err);
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}

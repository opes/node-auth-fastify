import jwt from 'jsonwebtoken';
import AccountService from './AccountService.js';
import SessionService from './SessionService.js';

export default class AuthService {
  static async login(req, reply) {
    try {
      const account = await AccountService.verify(req.body);
      if (!account) throw new Error('Account does not exist');

      const session = await SessionService.create({
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        accountId: account.id,
      });

      const now = new Date();
      const expires = now.setDate(now.getDate() + 30);

      const accessToken = jwt.sign(
        {
          sessionId: session.id,
          account,
        },
        process.env.JWT_SECRET
      );

      const refreshToken = jwt.sign(
        { sessionId: session.id },
        process.env.JWT_SECRET
      );

      reply
        .setCookie('accessToken', accessToken, {
          path: '/',
          domain: 'localhost',
          httpOnly: true,
        })
        .setCookie('refreshToken', refreshToken, {
          path: '/',
          domain: 'localhost',
          httpOnly: true,
          expires,
        });

      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

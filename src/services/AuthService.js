import jwt from 'jsonwebtoken';
import Account from '../models/Account.js';
import Session from '../models/Session.js';
import AccountService from './AccountService.js';

export default class AuthService {
  static isLoggedIn(req) {
    return req?.cookies?.refreshToken && req?.cookies?.accessToken;
  }

  static async login(req, reply) {
    if (AuthService.isLoggedIn(req)) return;

    try {
      const account = await AccountService.verify(req.body);
      if (!account) throw new Error('Account does not exist');

      const session = await Session.create({
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        accountId: account.id,
        valid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      AuthService.setCookies(reply, { account, session });

      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async logout(req, reply) {
    try {
      if (req?.cookies?.refreshToken) {
        const { refreshToken } = req.cookies;
        const { sessionId } = jwt.verify(refreshToken, process.env.JWT_SECRET);

        await Session.destroy(sessionId);
      }

      reply.clearCookie('accessToken').clearCookie('refreshToken');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async currentUser(req, reply) {
    try {
      if (req?.cookies?.accessToken) {
        const { accessToken } = req.cookies;
        const { account } = jwt.verify(accessToken, process.env.JWT_SECRET);

        return account;
      }

      if (req?.cookies?.refreshToken) {
        const { refreshToken } = req.cookies;
        const { sessionId } = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const currentSession = await Session.findById(sessionId);

        if (currentSession.valid) {
          const account = await Account.findById(currentSession.accountId);

          AuthService.setCookies(reply, { account, session: currentSession });

          return account.toJSON();
        }
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static setCookies(reply, { account, session }) {
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
    const now = new Date();
    const expires = now.setDate(now.getDate() + 30);

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
  }
}

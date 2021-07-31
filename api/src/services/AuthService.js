import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';

import Account from '../models/Account.js';
import Session from '../models/Session.js';
import AccountService from './AccountService.js';

import { COOKIE_OPTS, STATUS } from '../utils/constants.js';

export default class AuthService {
  static isLoggedIn(req) {
    return req?.cookies?.refreshToken && req?.cookies?.accessToken;
  }

  static async login(req, reply) {
    if (AuthService.isLoggedIn(req)) await AuthService.logout(req, reply);

    try {
      const account = await AccountService.getVerifiedAccount(req.body);
      if (!account) throw new Error('Account does not exist');

      const { authenticatorSecret = '' } = account;

      if (authenticatorSecret) {
        if (!req.body.token) return STATUS.requires2fa;
        
        const isValid = authenticator.verify({
          secret: authenticatorSecret,
          token: req.body.token,
        });

        if (!isValid) return STATUS.invalid2fa;
      }

      const session = await Session.create({
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        accountId: account.id,
        valid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      AuthService.setCookies(reply, { account, session });

      return STATUS.success;
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

      reply
        .clearCookie('accessToken', COOKIE_OPTS)
        .clearCookie('refreshToken', COOKIE_OPTS);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async register2fa({ account, secret, token }) {
    try {
      const isValid = authenticator.verify({ secret, token });

      if (isValid) await account.updateAuthenticator(secret);

      return isValid ? STATUS.success : STATUS.error;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async currentUser(req, reply) {
    try {
      if (req?.cookies?.accessToken) {
        const { accessToken } = req.cookies;
        const { account } = jwt.verify(accessToken, process.env.JWT_SECRET);

        return Account.fromJSON(account);
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

      return null;
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
      .setCookie('accessToken', accessToken, COOKIE_OPTS)
      .setCookie('refreshToken', refreshToken, {
        ...COOKIE_OPTS,
        expires,
      });
  }
}

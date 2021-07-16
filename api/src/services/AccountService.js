import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Account from '../models/Account.js';
import EmailService from './EmailService.js';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

export default class AccountService {
  static async register({ email, password }) {
    try {
      if (!email || !password)
        throw new Error('Email & password are required.');

      const hash = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
      const account = await Account.create({ email, password: hash });

      await AccountService.sendVerificationEmail(email);

      return account;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async verify({ email, token, expires = '' }) {
    try {
      if (AccountService.token(email, expires) === token) {
        await Account.verify(email);
        return true;
      }

      return false;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async changePassword({ email, oldPassword, newPassword }) {
    try {
      if (!email) throw new Error('You must be logged in to continue');
      if (!oldPassword || !newPassword)
        throw new Error('Both the current & new password are required');

      const account = await Account.findByEmail(email);
      if (!account) throw new Error('Invalid email/password');

      const passwordsMatch = bcrypt.compareSync(oldPassword, account.password);
      if (!passwordsMatch) throw new Error('Invalid email/password');

      const hash = bcrypt.hashSync(
        newPassword,
        Number(process.env.SALT_ROUNDS)
      );

      await account.updatePassword(hash);

      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async requestPasswordReset(email) {
    try {
      const account = await Account.findByEmail(email);
      if (account) {
        await AccountService.sendResetEmail(account.email);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async validate({ email, password }) {
    try {
      if (!email || !password)
        throw new Error('Email & password are required.');

      const account = await Account.findByEmail(email);
      if (!account) throw new Error('Invalid email/password');

      const passwordsMatch = bcrypt.compareSync(password, account.password);
      if (!passwordsMatch) throw new Error('Invalid email/password');

      return account;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static token(email, expires = '') {
    const authString = `${process.env.EMAIL_SECRET}:${email}:${expires}`;

    return crypto.createHash('sha256').update(authString).digest('hex');
  }

  static generateTokenUrl({ email, path = 'verify', expires = '' }) {
    const token = AccountService.token(email, expires);
    const url = `https://${process.env.WEB_DOMAIN}/${path}/${encodeURIComponent(
      email
    )}/${token}`;

    return url;
  }

  static async sendVerificationEmail(email) {
    try {
      const url = AccountService.generateTokenUrl({ email });
      const subject = 'Verify Email';
      const html = `<p>Please verify your email by visiting <a href="${url}">here</a></p>`;

      await AccountService.sendEmail(email, subject, html);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async sendResetEmail(email) {
    try {
      const expires = Date.now() + ONE_DAY_IN_MS;
      const url = AccountService.generateTokenUrl({
        email,
        path: `reset-password/${expires}`,
        expires,
      });
      const subject = 'Reset Password';
      const html = `<p>You can reset your password <a href="${url}">here</a></p>`;

      await AccountService.sendEmail(email, subject, html);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async sendEmail(to, subject, html) {
    const mailer = new EmailService();

    return mailer.send({ to, subject, html });
  }
}

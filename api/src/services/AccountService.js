import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Account from '../models/Account.js';
import AccountMailer from './AccountMailer.js';

export default class AccountService {
  static async register({ email, password }) {
    try {
      if (!email || !password)
        throw new Error('Email & password are required.');

      const hash = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
      const account = await Account.create({ email, password: hash });

      await AccountMailer.sendVerificationEmail(email);

      return account;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async verifyEmail({ email, token, expires = '' }) {
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

  static async savePassword({ account, password }) {
    try {
      const hash = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));

      await account.updatePassword(hash);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async changePassword({ email, oldPassword, newPassword }) {
    try {
      if (!email) throw new Error('You must be logged in to continue');
      if (!oldPassword || !newPassword)
        throw new Error('Both the current & new password are required');

      const account = await AccountService.getVerifiedAccount({
        email,
        password: oldPassword,
      });

      await AccountService.savePassword({ account, password: newPassword });

      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async resetPassword({ email, password, token, expires }) {
    try {
      const account = await Account.findByEmail(email);
      if (!account) throw new Error('Invalid email');

      const isValidToken = AccountService.token(email, expires) === token;
      const isExpired = Number(expires) < Date.now();

      if (isValidToken && !isExpired) {
        await AccountService.savePassword({ account, password });

        return true;
      }

      return false;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async requestPasswordReset(email) {
    try {
      const account = await Account.findByEmail(email);
      if (account) {
        await AccountMailer.sendResetEmail(account.email);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async getVerifiedAccount({ email, password }) {
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
}

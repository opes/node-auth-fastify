import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Account from '../models/Account.js';
import EmailService from './EmailService.js';

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

  static async sendVerificationEmail(email) {
    try {
      const mailer = new EmailService();
      const token = AccountService.verificationToken(email);
      const url = `https://${
        process.env.WEB_DOMAIN
      }/verify/${encodeURIComponent(email)}/${token}`;

      await mailer.send({
        to: email,
        subject: 'Verify Email',
        html: `<p>Please verify your email by visiting <a href="${url}">here</a></p>`,
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static verificationToken(email) {
    const authString = `${process.env.EMAIL_SECRET}:${email}`;
    return crypto.createHash('sha256').update(authString).digest('hex');
  }

  static async verify(email, token) {
    try {
      if (AccountService.verificationToken(email) === token) {
        Account.verify(email);
        return true;
      }

      return false;
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
}

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

      await AccountService.sendVerificationEmail(email);

      return Account.create({ email, password: hash });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async sendVerificationEmail(email) {
    try {
      const mailer = new EmailService();
      const token = AccountService.verificationToken(email);
      const url = `https://${
        process.env.ROOT_DOMAIN
      }/api/v1/accounts/verify/${encodeURI(email)}/${token}`;

      await mailer.send({
        to: email,
        subject: 'Verify Email',
        html: `<p>Please verify your email by visiting ${url}</p>`,
      });
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
}

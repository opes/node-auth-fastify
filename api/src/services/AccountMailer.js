import AccountService from './AccountService.js';
import EmailService from './EmailService.js';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

export default class AccountMailer {
  static generateTokenUrl({ email, path = 'verify', expires = '' }) {
    const token = AccountService.token(email, expires);
    const url = `https://${process.env.WEB_DOMAIN}/${path}/${encodeURIComponent(
      email
    )}/${token}`;

    return url;
  }

  static async sendVerificationEmail(email) {
    try {
      const url = AccountMailer.generateTokenUrl({ email });
      const subject = 'Verify Email';
      const html = `<p>Please verify your email by visiting <a href="${url}">here</a></p>`;

      await AccountMailer.sendEmail(email, subject, html);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async sendResetEmail(email) {
    try {
      const expires = Date.now() + ONE_DAY_IN_MS;
      const url = AccountMailer.generateTokenUrl({
        email,
        path: `reset-password/${expires}`,
        expires,
      });
      const subject = 'Reset Password';
      const html = `<p>You can reset your password <a href="${url}">here</a></p>`;

      await AccountMailer.sendEmail(email, subject, html);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async sendEmail(to, subject, html) {
    const mailer = new EmailService();

    return mailer.send({ to, subject, html });
  }
}

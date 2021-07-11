import nodemailer from 'nodemailer';

const testAccount = await nodemailer.createTestAccount();

export default class EmailService {
  constructor() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async send({ from = 'no-reply@nodeauth.dev', to, subject, html }) {
    try {
      await this.transporter.sendMail({ to, from, subject, html });
    } catch (err) {
      console.error(err);
    }
  }
}

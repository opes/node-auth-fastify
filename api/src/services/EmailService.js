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
      const mail = await this.transporter.sendMail({ to, from, subject, html });
      console.log(`mail`, mail);
      console.log(`mail preview: `, nodemailer.getTestMessageUrl(mail));
    } catch (err) {
      console.error(err);
    }
  }
}

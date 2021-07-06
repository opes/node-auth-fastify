import bcrypt from 'bcrypt';
import Account from '../models/Account.js';

export default class AccountService {
  static async register({ email, password }) {
    try {
      if (!email || !password)
        throw new Error('Email & password are required.');

      const hash = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));

      return Account.create({ email, password: hash });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async verify({ email, password }) {
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

import bcrypt from 'bcrypt';
import { client } from '../utils/db.js';

const accounts = client.db(process.env.DB_NAME).collection('accounts');

export default class Account {
  id;
  email;
  password;

  constructor(item) {
    this.id = item._id.toString();
    this.email = item.email.address;
    this.password = item.password;
    this.verified = item.email.verified;
  }

  static async create({ email, password }) {
    const exists = await accounts.findOne({ 'email.address': email });
    if (exists) throw new Error('Account exists for the given email');

    const hash = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
    const { insertedId } = await accounts.insertOne({
      email: {
        address: email,
        verified: false,
      },
      password: hash,
    });
    const account = await accounts.findOne({ _id: insertedId });
    return new Account(account);
  }

  toJSON() {
    // Omit the password when calling .toJSON()
    const { password, ...accountWithoutPassword } = this;
    return accountWithoutPassword;
  }
}

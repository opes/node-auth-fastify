import mongo from 'mongodb';
const { ObjectId } = mongo;
import { client } from '../utils/db.js';

const accounts = client.db(process.env.DB_NAME).collection('accounts');

accounts.createIndex({ 'email.address': 1 });

/** Class representing an account */
export default class Account {
  id;
  email;
  password;
  verified;

  /**
   * Create an account instance
   * @param {object} item - The account object from MongoDB
   * @param {string} item._id - ObjectId of the account
   * @param {object} item.email - The account's email object
   * @param {string} item.email.address - Account's email address
   * @param {boolean} item.email.verified - Email address has been verified
   * @param {string} item.password - Hashed password
   */
  constructor(item) {
    this.id = item._id.toString();
    this.email = item.email.address;
    this.password = item.password;
    this.verified = item.email.verified;
  }

  /**
   * Saves an account to the database
   * @param  {Object} obj - The account object
   * @param   {string} obj.email - Account's email address
   * @param   {string} obj.password - The hashed password
   * @returns {Account} An Account instance
   */
  static async create({ email, password }) {
    const exists = await accounts.findOne({ 'email.address': email });
    if (exists) throw new Error('Account exists for the given email');

    const { insertedId } = await accounts.insertOne({
      email: {
        address: email,
        verified: false,
      },
      password,
    });
    const account = await accounts.findOne({ _id: insertedId });

    return new Account(account);
  }

  /**
   * Find an account by email address
   * @param   {string} email
   * @returns {?Account} An Account instance or null if not found
   */
  static async findByEmail(email) {
    const account = await accounts.findOne({ 'email.address': email });
    if (!account) return null;

    return new Account(account);
  }

  /**
   * Find an account by id
   * @param  {string} id
   * @returns {?Account} An Account instance or null if not found
   */
  static async findById(id) {
    const account = await accounts.findOne({ _id: ObjectId(id) });
    if (!account) return null;

    return new Account(account);
  }

  /**
   * Return an account instance (without the password)
   * @returns {Account} The Account instance
   */
  toJSON() {
    // Omit the password when calling .toJSON()
    const { password, ...accountWithoutPassword } = this;

    return accountWithoutPassword;
  }
}

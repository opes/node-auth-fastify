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
  authenticatorSecret;

  /**
   * Create an account instance
   * @param {object} item - The account object from MongoDB
   * @param {string} item._id - ObjectId of the account
   * @param {object} item.email - The account's email object
   * @param {string} item.email.address - Account's email address
   * @param {boolean} item.email.verified - Email address has been verified
   * @param {string} item.password - Hashed password
   * @param {string} item.authenticatorSecret - 2FA Secret
   */
  constructor(item) {
    this.id = item._id.toString();
    this.email = item.email.address;
    this.password = item.password;
    this.verified = item.email.verified;
    this.authenticatorSecret = item.authenticatorSecret;
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
   * Verify an account's email address
   * @param  {string} email
   */
  static async verify(email) {
    try {
      await accounts.updateOne(
        { 'email.address': email },
        { $set: { 'email.verified': true } }
      );

      return Account.findByEmail(email);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Change an account's password
   * @param  {string} email
   * @param  {string} password
   */
  async updatePassword(password) {
    try {
      await accounts.updateOne(
        { 'email.address': this.email },
        { $set: { password } }
      );

      this.password = password;

      return this;
    } catch (err) {
      console.error(err);
    }
  }

  async updateAuthenticator(authenticatorSecret) {
    try {
      await accounts.updateOne(
        { 'email.address': this.email },
        { $set: { authenticatorSecret } }
      );

      this.authenticatorSecret = authenticatorSecret;

      return this;
    } catch (err) {
      console.error(err);
    }
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

  static fromJSON({ id, email, verified, authenticatorSecret = '' }) {
    const accountDoc = {
      _id: id,
      email: { address: email, verified },
      authenticatorSecret,
    };

    return new Account(accountDoc);
  }
}

import mongo from 'mongodb';
const { ObjectId } = mongo;
import { client } from '../utils/db.js';

const sessions = client.db(process.env.DB_NAME).collection('sessions');

export default class Session {
  id;
  accountId;
  userAgent;
  ip;
  valid;
  createdAt;
  updatedAt;

  constructor(item) {
    this.id = item._id.toString();
    this.accountId = item.accountId;
    this.userAgent = item.userAgent;
    this.ip = item.ip;
    this.valid = item.valid;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
  }

  static async create({
    accountId,
    userAgent,
    ip,
    valid,
    createdAt,
    updatedAt,
  }) {
    const { insertedId } = await sessions.insertOne({
      accountId,
      userAgent,
      ip,
      valid,
      createdAt,
      updatedAt,
    });
    const session = await sessions.findOne({ _id: insertedId });

    return new Session(session);
  }

  static async findById(id) {
    try {
      const session = await sessions.findOne({ _id: ObjectId(id) });

      return new Session(session);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async destroy(id) {
    try {
      await sessions.deleteOne({ _id: ObjectId(id) });

      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

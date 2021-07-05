import { client } from '../utils/db.js';

const sessions = client.db(process.env.DB_NAME).collection('sessions');

export default class Session {
  id;
  sessionToken;
  accountId;
  userAgent;
  ip;
  valid;
  createdAt;
  updatedAt;

  constructor(item) {
    this.id = item._id.toString();
    this.sessionToken = item.sessionToken;
    this.accountId = item.accountId;
    this.userAgent = item.userAgent;
    this.ip = item.ip;
    this.valid = item.valid;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
  }

  static async create({
    sessionToken,
    accountId,
    userAgent,
    ip,
    valid,
    createdAt,
    updatedAt,
  }) {
    const { insertedId } = await sessions.insertOne({
      sessionToken,
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
}

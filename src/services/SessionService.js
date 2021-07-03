import { randomBytes } from 'crypto';
import Session from '../models/Session.js';

export default class SessionService {
  static async create(userId, { ip, userAgent }) {
    try {
      const sessionToken = randomBytes(42).toString('hex');
      const session = await Session.create({
        sessionToken,
        userId,
        userAgent,
        ip,
        valid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return session.sessionToken;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

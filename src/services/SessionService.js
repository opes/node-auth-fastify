import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import Session from '../models/Session.js';

export default class SessionService {
  static async create({ ip, userAgent, accountId }) {
    try {
      const sessionToken = randomBytes(42).toString('hex');
      return Session.create({
        sessionToken,
        accountId,
        userAgent,
        ip,
        valid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static currentUser(request) {
    try {
      if (request?.cookies?.accessToken) {
        const { accessToken } = request.cookies;

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        return decoded;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

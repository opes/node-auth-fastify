import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import Session from '../models/Session.js';

export default class SessionService {
  static async create({ ip, userAgent, userId }, reply) {
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

      const accessToken = jwt.sign(
        {
          sessionId: session.id,
          userId,
        },
        process.env.JWT_SECRET
      );

      const refreshToken = jwt.sign(
        { sessionId: session.id },
        process.env.JWT_SECRET
      );

      const now = new Date();
      const expires = now.setDate(now.getDate() + 30);

      reply
        .setCookie('accessToken', accessToken, {
          path: '/',
          domain: 'localhost',
          httpOnly: true,
        })
        .setCookie('refreshToken', refreshToken, {
          path: '/',
          domain: 'localhost',
          httpOnly: true,
          expires,
        });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async currentUser(request) {
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

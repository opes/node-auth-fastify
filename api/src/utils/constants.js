export const COOKIE_OPTS = {
  path: '/',
  domain: process.env.ROOT_DOMAIN,
  httpOnly: true,
  secure: true,
};

export const STATUS = {
  requires2fa: '2FA',
  success: 'SUCCESS',
  error: 'ERROR',
};

export const COOKIE_OPTS = {
  path: '/',
  domain: process.env.ROOT_DOMAIN,
  httpOnly: true,
  secure: true,
};

export const STATUS = {
  invalid2fa: '2FA-ERROR',
  requires2fa: '2FA',
  success: 'SUCCESS',
  error: 'ERROR',
};

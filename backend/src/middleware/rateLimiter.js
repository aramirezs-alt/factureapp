const rateLimit = require('express-rate-limit');

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for general API use
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Massa peticions des d\'aquesta IP, torna-ho a provar d\'aquí a 15 minuts.' }
});

const creationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 creations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Has arribat al límit de creació per hora. Prova-ho més tard.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Massa intents de connexió. Prova-ho d\'aquí a 15 minuts.' }
});

module.exports = {
  standardLimiter,
  creationLimiter,
  authLimiter
};

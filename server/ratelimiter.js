import rateLimit from 'express-rate-limit';

export const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,      
  max: 90,                  
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Try again shortly.' }
});
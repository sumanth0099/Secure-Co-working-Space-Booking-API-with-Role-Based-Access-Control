const redisClient = require('../config/redis');

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${ip}`;

    const requests = await redisClient.incr(key);
    
    if (requests === 1) {
      await redisClient.expire(key, 60);
    }

    if (requests > 5) {
      return res.status(429).json({ error: 'Too Many Requests' });
    }

    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error);
    next();
  }
};

module.exports = rateLimiter;

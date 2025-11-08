const redisClient = require('../config/redisClient');

const cache = (keyBuilder) => {
  return async (req, res, next) => {
    try {
      // نتحقق واش key ثابت ولا دالة
      const key =
        typeof keyBuilder === 'function' ? keyBuilder(req) : keyBuilder;
      const data = await redisClient.get(key);

      if (data) {
        console.log(`✅ Cache hit for key: ${key}`);
        return res.json(JSON.parse(data));
      }

      console.log(`⚙️ Cache miss for key: ${key}`);
      next();
    } catch (err) {
      console.error('❌ Redis cache error:', err);
      next();
    }
  };
};

module.exports = { cache };

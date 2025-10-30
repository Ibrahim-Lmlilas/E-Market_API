const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('❌ Redis Error:', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
  }
})();

module.exports = redisClient;

//pour runner server redi ecrire: redis-server

//pour voir data caching ecrire dans terminal
//redis-cli
// apres ecrire
//keys *
//pour voir contenu ecrire
//get (key li tl3 lik f terminal)

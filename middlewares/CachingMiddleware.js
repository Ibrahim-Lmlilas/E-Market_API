const cache = (key) => {
  return async (req, res, next) => {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return res.json(JSON.parse(data));
      }
      next();
    } catch (err) {
      console.error(err);
      next();
    }
  };
};

class ResponseHandler {
  logger = (req, res, next) => {
    const now = new Date().toLocaleString();
    console.log(`[${req.method}] ${req.originalUrl} - ${now}`);
    next();
  };

  notFound = (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  };

  errorHandler = (err, req, res) => {
    res.status(err.status || 500).json({
      message: err.message || 'Server Error',
    });
  };
}

module.exports = new ResponseHandler();

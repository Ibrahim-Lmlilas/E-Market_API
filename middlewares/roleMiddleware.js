exports.isAdmin = (req, res, next) => {
  if (req.user.role.name !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Admin access only' });
  }
  next();
};

exports.isSeller = (req, res, next) => {
  if (req.user.role.name !== 'seller') {
    return res
      .status(403)
      .json({ success: false, message: 'Seller access only' });
  }
  next();
};

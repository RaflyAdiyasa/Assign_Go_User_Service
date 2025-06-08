export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

export const isUser = (req, res, next) => {
  if (req.userRole !== 'user') {
    return res.status(403).json({ message: 'Forbidden: User access required' });
  }
  next();
};

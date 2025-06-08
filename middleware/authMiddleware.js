import { verifyToken } from '../utils/jwt.js';

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }

  req.userId = decoded.userId;
  req.userRole = decoded.role;
  next();
};
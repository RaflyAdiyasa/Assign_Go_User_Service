import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const refreshKey = process.env.REFRESH_SECRET || 'your-refresh-secret-key';

export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, secretKey, { expiresIn: '1h' });
};

export const generateRefreshToken = (userId, role) => {
  return jwt.sign({ userId, role }, refreshKey, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, refreshKey);
  } catch (error) {
    return null;
  }
};

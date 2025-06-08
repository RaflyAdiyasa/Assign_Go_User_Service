import User from '../models/userModel.js';
import RegisteredNIM from '../models/nimModel.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { nim, username, password } = req.body;

    // Check if NIM is registered in the system
    const registeredNIM = await RegisteredNIM.findOne({ where: { nim, status: true } });
    if (!registeredNIM) {
      return res.status(400).json({ message: 'NIM not registered in the system' });
    }

    // Check if user with this NIM already exists
    const existingUser = await User.findOne({ where: { nim } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this NIM already exists' });
    }

    // Create new user
    const user = await User.create({
      nim,
      username,
      password,
      role: 'user'
    });

    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    // Save refresh token
    user.refresh_token = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user.id,
        nim: user.nim,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { nim, password } = req.body;

    // Special handling for admin login
    if (nim === 'admin' && password === 'admin123') {
      // Check if admin exists
      let admin = await User.findOne({ where: { nim: 'admin' } });
      
      // If admin doesn't exist, create it
      if (!admin) {
        admin = await User.create({
          nim: 'admin',
          username: 'Admin',
          password: 'admin123', // Akan di-hash oleh hook
          role: 'admin'
        });
        console.log('Admin created during login attempt');
      } else {
        admin.password = 'admin123'; 
        await admin.save();
        console.log('Admin password updated');
      }
      
      // Generate token and refresh token for admin
      const token = generateToken(admin.id, admin.role);
      const refreshToken = generateRefreshToken(admin.id, admin.role);

      admin.refresh_token = refreshToken;
      await admin.save();

      return res.json({
        message: 'Admin login successful',
        token,
        refreshToken,
        user: {
          id: admin.id,
          nim: admin.nim,
          username: admin.username,
          role: admin.role
        }
      });
    }

    // Regular user login
    const user = await User.findOne({ where: { nim } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid password',
        // Add some debug info (remove in production)
        passwordProvided: password,
        userExists: !!user
      });
    }

    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    user.refresh_token = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        nim: user.nim,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newToken = generateToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id, user.role);

    user.refresh_token = newRefreshToken;
    await user.save();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const { userId } = req;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.refresh_token = null;
    await user.save();

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
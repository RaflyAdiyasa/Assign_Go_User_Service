import User from '../models/userModel.js';
import { Op } from 'sequelize';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'nim', 'username', 'createdAt', 'updatedAt']
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user stats (admin only)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    
    // Get monthly registrations for the last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - 5);
    
    const monthlyStats = [];
    
    for (let i = 0; i < 6; i++) {
      const month = date.getMonth() + i;
      const year = date.getFullYear() + Math.floor((date.getMonth() + i) / 12);
      const startDate = new Date(year, month % 12, 1);
      const endDate = new Date(year, (month + 1) % 12, 1);
      
      const count = await User.count({
        where: {
          role: 'user',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }
        }
      });
      
      monthlyStats.push({
        month: startDate.toLocaleString('default', { month: 'long' }),
        year: year,
        count: count
      });
    }
    
    res.json({
      totalUsers,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'nim', 'username', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
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

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
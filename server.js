import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import nimRoutes from './routes/nimRoutes.js';
import User from './models/userModel.js';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/nims', nimRoutes);

// Initialize database and create admin user if not exists
const initializeDB = async () => {
  try {
    await sequelize.sync();
    console.log('Database connected and synchronized');

    // Check if admin user exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      // Create admin user
      const password = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await User.create({
        nim: 'admin',
        username: 'Admin',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Admin user created');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`User service running on port ${PORT}`);
  await initializeDB();
});
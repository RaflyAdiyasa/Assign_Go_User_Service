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
const PORT = process.env.PORT || 8080;

// Middleware
const allowedOrigins = [
  'http://34.46.47.209/',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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
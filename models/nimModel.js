import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RegisteredNIM = sequelize.define('RegisteredNIM', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nim: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // true berarti NIM aktif
  }
}, {
  timestamps: true,
  tableName: 'registered_nims'
});

export default RegisteredNIM;

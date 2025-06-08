import RegisteredNIM from '../models/nimModel.js';
import { Op } from 'sequelize';

// Add a new NIM (admin only)
export const addNIM = async (req, res) => {
  try {
    const { nim } = req.body;

    const existingNIM = await RegisteredNIM.findOne({ where: { nim } });
    if (existingNIM) {
      return res.status(400).json({ message: 'NIM already registered' });
    }

    const registeredNIM = await RegisteredNIM.create({ nim });

    res.status(201).json({
      message: 'NIM registered successfully',
      nim: registeredNIM
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Add multiple NIMs (admin only)
export const addMultipleNIMs = async (req, res) => {
  try {
    const { nims } = req.body;

    if (!Array.isArray(nims) || nims.length === 0) {
      return res.status(400).json({ message: 'Invalid NIMs data. Provide an array of NIMs' });
    }

    const existingNIMs = await RegisteredNIM.findAll({
      where: { nim: { [Op.in]: nims } }
    });

    const existingNIMValues = existingNIMs.map(item => item.nim);
    const newNIMs = nims.filter(nim => !existingNIMValues.includes(nim));

    if (newNIMs.length === 0) {
      return res.status(400).json({ message: 'All NIMs are already registered' });
    }

    const registeredNIMs = await RegisteredNIM.bulkCreate(
      newNIMs.map(nim => ({ nim }))
    );

    res.status(201).json({
      message: 'NIMs registered successfully',
      total: registeredNIMs.length,
      nims: registeredNIMs
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all registered NIMs (admin only)
export const getAllNIMs = async (req, res) => {
  try {
    const nims = await RegisteredNIM.findAll({
      attributes: ['id', 'nim', 'status', 'createdAt']
    });

    res.json({ nims });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Deactivate a NIM (admin only)
export const deactivateNIM = async (req, res) => {
  try {
    const { nimId } = req.params;

    const registeredNIM = await RegisteredNIM.findByPk(nimId);
    if (!registeredNIM) {
      return res.status(404).json({ message: 'NIM not found' });
    }

    registeredNIM.status = false;
    await registeredNIM.save();

    res.json({
      message: 'NIM deactivated successfully',
      nim: registeredNIM
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Activate a NIM (admin only)
export const activateNIM = async (req, res) => {
  try {
    const { nimId } = req.params;

    const registeredNIM = await RegisteredNIM.findByPk(nimId);
    if (!registeredNIM) {
      return res.status(404).json({ message: 'NIM not found' });
    }

    registeredNIM.status = true;
    await registeredNIM.save();

    res.json({
      message: 'NIM activated successfully',
      nim: registeredNIM
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
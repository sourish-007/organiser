import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Year from '../models/Year.js';
import Month from '../models/Month.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });
};

const signup = async (req, res) => {
  const { name, userId, password } = req.body;

  if (!name || !userId || !password) {
    return res.status(400).json({ message: 'Please provide name, userId, and password' });
  }

  try {
    const userExists = await User.findOne({ userId });
    if (userExists) {
      return res.status(400).json({ message: 'User ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      userId,
      passwordHash,
    });

    if (user) {
      const yearsToCreate = [];
      for (let y = 2024; y <= 2030; y++) {
        yearsToCreate.push({ userId: user._id, year: y });
      }
      const createdYears = await Year.insertMany(yearsToCreate);

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      const monthsToCreate = [];
      for (const yr of createdYears) {
        for (const name of monthNames) {
          monthsToCreate.push({ yearId: yr._id, month: name });
        }
      }
      await Month.insertMany(monthsToCreate);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        userId: user.userId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: 'Please provide userId and password' });
  }

  try {
    const user = await User.findOne({ userId });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user._id,
        name: user.name,
        userId: user.userId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid user ID or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { signup, login, getMe };

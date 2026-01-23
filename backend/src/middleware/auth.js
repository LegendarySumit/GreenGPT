import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { userStorage } from '../utils/userStorage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Check if MongoDB is connected
let useMongoose = true;
const checkMongoose = async () => {
  try {
    await User.findOne();
    useMongoose = true;
  } catch (error) {
    useMongoose = false;
  }
};
checkMongoose();

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (useMongoose) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const user = await userStorage.findById(decoded.id);
        req.user = { id: user._id, ...user };
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// This file is deprecated - all database operations now use Firestore
// See backend/src/config/firebaseAdmin.js for Firestore initialization

// Note: MongoDB has been completely replaced with Firebase Firestore
// for better scalability and real-time capabilities.

export const connectDB = async () => {
  // Database initialization now happens in firebaseAdmin.js
  console.log('Using Firestore for all database operations');
};

export default connectDB;

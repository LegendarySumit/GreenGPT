// Simple in-memory user storage as fallback if MongoDB is not available
let users = [];

export const userStorage = {
  create: async (userData) => {
    const user = {
      _id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    users.push(user);
    return user;
  },

  findOne: async (query) => {
    if (query.email) {
      return users.find(u => u.email === query.email);
    }
    if (query._id) {
      return users.find(u => u._id === query._id);
    }
    return null;
  },

  findById: async (id) => {
    return users.find(u => u._id === id);
  },

  getAll: () => {
    return users;
  }
};

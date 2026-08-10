// Mocking the base44 client to prevent build errors and keep imports working
export const base44 = {
  auth: {
    me: async () => ({ id: '1', name: 'Admin User', email: 'admin@example.com' }),
    login: async () => ({ id: '1', name: 'Admin User' }),
    logout: () => {
      console.log("Logged out");
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    }
  },
  db: {
    // Add dummy db methods if your app calls base44.db anywhere
    collection: () => ({
      findMany: async () => [],
      findOne: async () => null,
      insert: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  }
};

export default base44;

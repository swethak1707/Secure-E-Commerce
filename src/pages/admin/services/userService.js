import { 
    collection, 
    getDocs, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy 
  } from 'firebase/firestore';
  import { db } from '../../../firebase.config';
  
  // Collection reference
  const usersCollection = collection(db, 'users');
  
  // Get all regular users (not admins)
  export const getAllUsers = async () => {
    try {
      const q = query(
        usersCollection,
        where('role', '==', 'user'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  };
  
  // Get a user by ID
  export const getUserById = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  };
  
  // Update user profile
  export const updateUserProfile = async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  // Activate/deactivate user
  export const toggleUserStatus = async (userId, isActive) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: isActive,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  };
  
  // Get user orders (assuming we have an orders collection)
  export const getUserOrders = async (userId) => {
    try {
      const ordersCollection = collection(db, 'orders');
      const q = query(
        ordersCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  };
  
  // Search users by name or email
  export const searchUsers = async (searchTerm) => {
    try {
      // Get all users first (not ideal for large datasets, but Firestore doesn't support direct text search)
      const q = query(
        usersCollection,
        where('role', '==', 'user')
      );
      const querySnapshot = await getDocs(q);
      
      // Filter users client-side based on search term
      const searchTermLower = searchTerm.toLowerCase();
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => 
          (user.name && user.name.toLowerCase().includes(searchTermLower)) ||
          (user.email && user.email.toLowerCase().includes(searchTermLower))
        );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };
  
  // Get recent users
  export const getRecentUsers = async (count = 5) => {
    try {
      const q = query(
        usersCollection,
        where('role', '==', 'user'),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting recent users:', error);
      throw error;
    }
  };
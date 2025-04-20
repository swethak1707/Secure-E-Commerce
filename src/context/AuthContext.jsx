import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  logoutUser,
  resetPassword,
  checkIfUserIsAdmin,
  db
} from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'user');
            
            // Combine user auth data with role information
            setCurrentUser({
              ...user,
              role: userData.role || 'user'
            });
          } else {
            setUserRole('user');
            setCurrentUser({
              ...user,
              role: 'user'
            });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('user');
          setCurrentUser({
            ...user,
            role: 'user'
          });
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Clear error
  const clearError = () => {
    setError('');
  };

  // Register with email/password
  const register = async (name, email, password, isAdmin = false) => {
    setLoading(true);
    setError('');
    try {
      const user = await registerWithEmailAndPassword(name, email, password, isAdmin);
      
      // Update user role state after registration
      setUserRole(isAdmin ? 'admin' : 'user');
      
      // Combine user auth data with role information
      setCurrentUser({
        ...user,
        role: isAdmin ? 'admin' : 'user'
      });
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const userWithRole = await loginWithEmailAndPassword(email, password);
      
      // Set user role for the application state
      setUserRole(userWithRole.role || 'user');
      setCurrentUser(userWithRole);
      
      return userWithRole;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    setError('');
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserRole(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Password reset
  const forgotPassword = async (email) => {
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is an admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    clearError,
    register,
    login,
    logout,
    forgotPassword,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
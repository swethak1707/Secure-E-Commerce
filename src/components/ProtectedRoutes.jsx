import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Regular user protected route - accessible by any authenticated user
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    // Save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  return children;
};

// Admin protected route - only accessible by admin users
export const AdminRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login page with current location
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  // Check if user has admin role
  if (!isAdmin()) {
    // If logged in but not admin, redirect to home page
    return <Navigate to="/" />;
  }
  
  return children;
};
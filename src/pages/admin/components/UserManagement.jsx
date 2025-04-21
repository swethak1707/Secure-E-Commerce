import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase.config';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: false });

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Query to get all users with role 'user'
        const usersRef = collection(db, 'users');
        const usersQuery = query(
          usersRef,
          where('role', '==', 'user')
        );
        
        const querySnapshot = await getDocs(usersQuery);
        
        // Process the results
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure isActive property exists with a default value
          isActive: doc.data().isActive === false ? false : true
        }));
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchValue)) ||
      (user.email && user.email.toLowerCase().includes(searchValue))
    );
  });

  // View user details
  const handleViewUser = async (user) => {
    try {
      // Get fresh user data to ensure we have the latest
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
          // Ensure isActive property exists
          isActive: userDoc.data().isActive === false ? false : true
        };
        setSelectedUser(userData);
        setShowUserDetails(true);
      } else {
        console.error('User document not found');
      }
    } catch (error) {
      console.error('Error getting user details:', error);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      setUpdateStatus({ loading: true, error: null, success: false });
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
      // Update selected user if currently viewed
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          isActive: !currentStatus
        });
      }
      
      setUpdateStatus({ loading: false, error: null, success: true });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setUpdateStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      console.error('Error updating user status:', error);
      setUpdateStatus({ loading: false, error: 'Failed to update user status', success: false });
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = typeof timestamp === 'object' && timestamp.toDate 
        ? timestamp.toDate() 
        : new Date(timestamp);
        
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">User Management</h2>
        
        {/* Search bar */}
        <div className="w-full md:w-1/3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status messages */}
      {updateStatus.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {updateStatus.error}
        </div>
      )}
      
      {updateStatus.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
          User status updated successfully!
        </div>
      )}

      {/* User list */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {searchTerm ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-600">
                No users match your search criteria. Try different keywords.
              </p>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                There are no regular users registered in the system yet.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(user.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      disabled={updateStatus.loading}
                      className={`${
                        updateStatus.loading
                          ? 'text-gray-400 cursor-not-allowed'
                          : user.isActive === false
                            ? 'text-green-600 hover:text-green-900'
                            : 'text-red-600 hover:text-red-900'
                      }`}
                    >
                      {updateStatus.loading && updateStatus.userId === user.id
                        ? 'Updating...'
                        : user.isActive === false
                          ? 'Activate'
                          : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User details modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 text-2xl font-bold mb-3">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <h4 className="text-xl font-medium text-gray-900">{selectedUser.name || 'N/A'}</h4>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-base text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedUser.isActive === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Joined</p>
                  <p className="text-base text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Login</p>
                  <p className="text-base text-gray-900">{formatDate(selectedUser.lastLogin) || 'Never'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                <p className="text-base text-gray-900">
                  {selectedUser.address ? (
                    <>
                      {selectedUser.address.street || 'N/A'}<br />
                      {selectedUser.address.city || 'N/A'}, {selectedUser.address.state || 'N/A'} {selectedUser.address.zipCode || 'N/A'}<br />
                      {selectedUser.address.country || 'N/A'}
                    </>
                  ) : (
                    'No address provided'
                  )}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleToggleActive(selectedUser.id, selectedUser.isActive)}
                  disabled={updateStatus.loading}
                  className={`px-4 py-2 rounded-md text-white ${
                    updateStatus.loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : selectedUser.isActive === false 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {updateStatus.loading
                    ? 'Processing...'
                    : selectedUser.isActive === false
                      ? 'Activate User'
                      : 'Deactivate User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
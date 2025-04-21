import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../pages/admin/components/AdminHeader';
import AdminSidebar from '../pages/admin/components/AdminSidebar';

const AdminChatPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch all users with active chats
  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    
    const chatsRef = collection(db, 'chats');
    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      try {
        const uniqueUsers = new Map();
        
        for (const chatDoc of snapshot.docs) {
          const chatData = chatDoc.data();
          
          if (!chatData.userId) continue;
          
          if (!uniqueUsers.has(chatData.userId)) {
            try {
              const userDoc = await getDoc(doc(db, 'users', chatData.userId));
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                
                uniqueUsers.set(chatData.userId, {
                  id: chatData.userId,
                  chatId: chatDoc.id,
                  name: userData.name || chatData.userName || 'Anonymous User',
                  email: userData.email || chatData.userEmail || '',
                  lastMessage: chatData.lastMessage || '',
                  lastMessageTime: chatData.lastMessageTime ? chatData.lastMessageTime.toDate() : null,
                  unreadCount: chatData.unreadByAdmin ? 1 : 0,
                  status: chatData.status || 'open'
                });
              }
            } catch (error) {
              console.error(`Error fetching user data for ${chatData.userId}:`, error);
            }
          }
        }
        
        // Convert map to array and sort by last message time
        const usersArray = Array.from(uniqueUsers.values());
        usersArray.sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return b.lastMessageTime - a.lastMessageTime;
        });
        
        setUsers(usersArray);
        
        // Select first user if none selected
        if (usersArray.length > 0 && !selectedUser) {
          setSelectedUser(usersArray[0]);
          setSelectedChat(usersArray[0].chatId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error processing chats:', error);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser, selectedUser]);
  
  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;
    
    const messagesRef = collection(db, 'chats', selectedChat, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messageList);
      
      // Mark messages as read
      if (selectedUser) {
        updateUnreadStatus();
      }
    });
    
    return () => unsubscribe();
  }, [selectedChat, selectedUser]);
  
  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat || !currentUser || isSending) return;
    
    setIsSending(true);
    
    try {
      // Add message to subcollection
      const messagesRef = collection(db, 'chats', selectedChat, 'messages');
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        sender: 'admin',
        senderName: currentUser.displayName || 'Admin',
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update chat document
      const chatRef = doc(db, 'chats', selectedChat);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: 'admin',
        unreadByAdmin: false,
        adminOnline: true
      });
      
      // Clear message input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Update unread status
  const updateUnreadStatus = async () => {
    try {
      const chatRef = doc(db, 'chats', selectedChat);
      await updateDoc(chatRef, {
        unreadByAdmin: false,
        adminOnline: true
      });
    } catch (error) {
      console.error('Error updating unread status:', error);
    }
  };
  
  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedChat(user.chatId);
  };
  
  // Format time (HH:MM format)
  const formatTime = (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };
  
  // Format timestamp from Firestore
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatTime(date);
  };
  
  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });
  
  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle logout
  const handleLogout = async () => {
    // Implement logout logic
    console.log('Logout clicked');
  };
  
  // Get the first letter for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-30 md:z-auto`}>
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          handleLogout={handleLogout} 
        />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader 
          username={currentUser?.displayName || currentUser?.email} 
          toggleSidebar={toggleSidebar}
        />
        
        {/* Chat Interface */}
        <main className="flex-1 flex overflow-hidden">
          {/* Users Sidebar */}
          <div className="w-72 bg-white border-r overflow-hidden flex flex-col">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Customer Chats</h2>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No chats found
                </div>
              ) : (
                <ul>
                  {filteredUsers.map(user => (
                    <li 
                      key={user.id}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-gray-100' : ''}`}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                            {getInitial(user.name)}
                          </div>
                          <div className="ml-3">
                            <div className="flex justify-between w-full">
                              <p className="text-base font-medium">{user.name}</p>
                              {user.lastMessageTime && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(user.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.lastMessage && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {user.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Chat Panel */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b p-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                    {getInitial(selectedUser.name)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-md ${
                              message.sender === 'admin' 
                                ? 'bg-purple-100 text-purple-800 ml-auto' 
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <div className="text-sm">{message.text}</div>
                            <div className="text-xs text-right mt-1 text-gray-500">
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="bg-white border-t p-4">
                  <form onSubmit={sendMessage} className="flex items-center">
                    <input 
                      type="text" 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      placeholder="Type your message..." 
                      className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      disabled={isSending}
                    />
                    <button 
                      type="submit" 
                      className={`p-2 rounded-r-md text-white ${
                        isSending || !newMessage.trim() 
                          ? 'bg-purple-300' 
                          : 'bg-purple-600'
                      }`}
                      disabled={isSending || !newMessage.trim()}
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No chat selected</h3>
                <p className="text-gray-500 text-center">
                  Select a customer from the sidebar to view their messages and respond.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminChatPage;
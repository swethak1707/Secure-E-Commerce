import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ChatPage = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Effect for scrolling on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Effect for loading/creating chat
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    
    const fetchOrCreateChat = async () => {
      try {
        // Check if user has an existing chat
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('userId', '==', currentUser.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            // Chat exists
            const chatDoc = snapshot.docs[0];
            setChatId(chatDoc.id);
            
            // Set admin online status
            setAdminOnline(chatDoc.data().adminOnline || false);
            
            // Subscribe to messages
            const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
            
            const messageUnsubscribe = onSnapshot(messagesQuery, (msgSnapshot) => {
              const messageList = msgSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setMessages(messageList);
              setLoading(false);
            });
            
            return () => {
              messageUnsubscribe();
            };
          } else {
            // Create new chat
            addDoc(chatsRef, {
              userId: currentUser.uid,
              userName: currentUser.displayName || 'Anonymous User',
              userEmail: currentUser.email,
              createdAt: serverTimestamp(),
              lastMessage: null,
              lastMessageTime: null,
              adminOnline: false,
              unreadCount: 0,
              status: 'open'
            }).then(docRef => {
              setChatId(docRef.id);
              setLoading(false);
            });
          }
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching/creating chat:', error);
        setLoading(false);
      }
    };
    
    fetchOrCreateChat();
  }, [currentUser]);
  
  // Send message function
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId || !currentUser) return;
    
    setIsSending(true);
    
    try {
      // Add message to subcollection
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        sender: 'user',
        senderName: currentUser.displayName || 'You',
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update chat document with last message info
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: 'user',
        unreadByAdmin: true
      });
      
      // Clear message input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-lg text-gray-700 mb-8">
              You need to be logged in to access customer support chat.
            </p>
            <a
              href="/login"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Login to Your Account
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-500 hover:text-purple-600">Home</a>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-600 md:ml-2 font-medium">Customer Support</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
            <p className="text-gray-600 mt-2">
              Chat with our support team. We're here to help!
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Chat Header */}
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-full mr-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold">Support Team</h2>
                  <p className="text-sm text-purple-100 flex items-center">
                    <span className={`inline-block h-2 w-2 rounded-full mr-1 ${adminOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                    {adminOnline ? 'Online' : 'Offline (messages will be answered soon)'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="p-4 h-96 overflow-y-auto bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="h-16 w-16 text-purple-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <div className="text-sm">{message.text}</div>
                        <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
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
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex items-center">
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type your message..." 
                  className="flex-1 rounded-l-md border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  disabled={isSending}
                />
                <button 
                  type="submit" 
                  className={`px-4 py-2 bg-purple-600 text-white rounded-r-md ${
                    isSending || !newMessage.trim() 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-purple-700'
                  }`}
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Help Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-gray-700 mb-4">Our support team is here to assist you with:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Order issues and tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Product information and recommendations</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Returns and refunds</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Account-related issues</span>
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              <strong>Support Hours:</strong> Monday-Friday, 9 AM - 6 PM EST
            </p>
            <p className="text-sm text-gray-500 mt-2">
              When support is offline, messages will be answered during the next business day.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatPage;
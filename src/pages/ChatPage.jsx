import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ChatPage = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Find or create a conversation for the current user
  useEffect(() => {
    const getOrCreateConversation = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Check if user already has a conversation
        const conversationsRef = collection(db, 'supportChats');
        const q = query(conversationsRef, where('customerId', '==', currentUser.uid));
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Existing conversation found
          const conversationData = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
          };
          setConversation(conversationData);
        } else {
          // Create a new conversation
          const newConversation = {
            customerId: currentUser.uid,
            customerName: currentUser.displayName || 'Anonymous User',
            customerEmail: currentUser.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: null,
            adminUnread: true,
            customerUnread: false
          };
          
          const docRef = await addDoc(conversationsRef, newConversation);
          setConversation({
            id: docRef.id,
            ...newConversation
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error getting/creating conversation:', err);
        setError('Failed to set up chat. Please try again later.');
        setLoading(false);
      }
    };
    
    getOrCreateConversation();
  }, [currentUser]);

  // Load messages when conversation is set
  useEffect(() => {
    if (!conversation) return;
    
    try {
      // Set up real-time listener for messages
      const messagesRef = collection(db, 'supportChats', conversation.id, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesList);
        
        // Mark customer messages as read
        if (conversation.customerUnread) {
          updateDoc(doc(db, 'supportChats', conversation.id), {
            customerUnread: false
          });
        }
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up messages listener:', err);
      setError('Failed to load messages. Please try again.');
    }
  }, [conversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation) return;
    
    try {
      // Add message to firestore
      const messagesRef = collection(db, 'supportChats', conversation.id, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous User',
        isAdmin: false,
        timestamp: serverTimestamp()
      });
      
      // Update conversation with last message
      await updateDoc(doc(db, 'supportChats', conversation.id), {
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
        adminUnread: true
      });
      
      // Clear input field
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-yellow-100 p-6 rounded-lg mb-6">
              <svg className="h-16 w-16 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
              <p className="text-gray-600 mb-6">Please log in to use the customer support chat.</p>
              <a
                href="/login"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                Go to Login
              </a>
            </div>
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Chat header */}
            <div className="bg-purple-700 px-6 py-4 text-white">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h2 className="text-lg font-semibold">Live Chat Support</h2>
              </div>
              <p className="text-purple-200 mt-1 text-sm">
                Our support team is here to help. Feel free to ask any questions you have.
              </p>
            </div>
            
            {/* Chat messages */}
            <div className="h-96 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start the conversation by sending a message to our support team.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${
                          message.isAdmin 
                            ? 'bg-gray-200 text-gray-800' 
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.isAdmin ? 'Support Agent' : 'You'}
                        </div>
                        <div>{message.text}</div>
                        <div className="text-xs mt-1 text-right opacity-70">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef}></div>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="border-t border-gray-200 p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-grow px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-l-md"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className={`px-4 py-2 rounded-r-md font-medium text-white ${
                    loading || !newMessage.trim()
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Send
                </button>
              </form>
              
              <p className="text-xs text-gray-500 mt-2">
                Our support team typically responds within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatPage;
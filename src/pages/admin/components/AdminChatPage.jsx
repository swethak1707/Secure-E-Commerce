import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase.config';
import { useAuth } from '../../../context/AuthContext';

const AdminChatPage = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch all customer conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Get all support chat threads
        const conversationsRef = collection(db, 'supportChats');
        const q = query(
          conversationsRef,
          orderBy('updatedAt', 'desc')
        );
        
        // Set up real-time listener for conversations
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const conversationList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConversations(conversationList);
          setLoading(false);
          
          // Auto-select the first conversation if none is selected
          if (conversationList.length > 0 && !selectedConversation) {
            setSelectedConversation(conversationList[0]);
          }
        }, (err) => {
          console.error('Error fetching conversations:', err);
          setError('Failed to load conversations. Please try again.');
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up conversations listener:', error);
        setError('Failed to load conversations. Please try again.');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    
    const fetchMessages = async () => {
      try {
        const messagesRef = collection(db, 'supportChats', selectedConversation.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        
        // Set up real-time listener for messages
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const messageList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(messageList);
        }, (err) => {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages. Please try again.');
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up messages listener:', error);
        setError('Failed to load messages. Please try again.');
      }
    };
    
    fetchMessages();
  }, [selectedConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      // Add message to the selected conversation's messages subcollection
      const messagesRef = collection(db, 'supportChats', selectedConversation.id, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Admin',
        isAdmin: true,
        timestamp: serverTimestamp(),
      });
      
      // Update conversation's last message and timestamp
      const conversationRef = doc(db, 'supportChats', selectedConversation.id);
      await updateDoc(conversationRef, {
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
        adminUnread: false,
        customerUnread: true,
      });
      
      // Clear input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get relative time for conversation list
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'No date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Support</h2>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(80vh-2rem)]">
          {/* Conversation List */}
          <div className="col-span-1 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Conversations</h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">No conversations found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <li 
                    key={conversation.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedConversation?.id === conversation.id ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="px-4 py-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {conversation.customerName ? conversation.customerName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900 flex items-center">
                              {conversation.customerName || 'Anonymous User'}
                              {conversation.adminUnread && (
                                <span className="ml-2 h-2.5 w-2.5 rounded-full bg-purple-600"></span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(conversation.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Chat Area */}
          <div className="col-span-2 flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                    {selectedConversation.customerName ? selectedConversation.customerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{selectedConversation.customerName || 'Anonymous User'}</p>
                    <p className="text-sm text-gray-500">{selectedConversation.customerEmail || 'No email provided'}</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-gray-600">No messages yet</p>
                        <p className="text-sm text-gray-500 mt-1">Start the conversation by sending a message</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                              message.isAdmin 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <div className="text-sm mb-1">
                              {message.isAdmin ? 'Admin' : message.senderName || 'Customer'}
                            </div>
                            <div>{message.text}</div>
                            <div className="text-xs text-right mt-1 opacity-70">
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
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No conversation selected</h3>
                  <p className="text-gray-600">Select a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminChatPage;
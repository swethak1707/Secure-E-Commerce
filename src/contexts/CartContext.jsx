// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  increment,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { user, anonymousLogin } = useAuth();

  // Calculate cart total whenever cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      calculateCartTotal();
    } else {
      setCartTotal(0);
    }
  }, [cartItems]);

  // Calculate total price of items in cart
  const calculateCartTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);
    
    setCartTotal(total);
  };

  // Get cart items for current user
  const getCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, 'cartItems'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const cartData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCartItems(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product) => {
    // If not logged in, do anonymous login
    if (!user) {
      await anonymousLogin();
    }
    
    try {
      // Check if product already in cart
      const q = query(
        collection(db, 'cartItems'), 
        where('userId', '==', user.uid),
        where('productId', '==', product.id)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Product already in cart, increase quantity
        const cartItemId = snapshot.docs[0].id;
        return await increaseQuantity(cartItemId);
      }
      
      // Add new cart item
      await addDoc(collection(db, 'cartItems'), {
        userId: user.uid,
        productId: product.id,
        productName: product.name,
        productImageURL: product.image,
        price: product.price,
        quantity: 1,
        createdAt: serverTimestamp()
      });
      
      toast.success('Added to cart');
      getCart(); // Refresh cart
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      return false;
    }
  };

  // Increase quantity of cart item
  const increaseQuantity = async (cartItemId) => {
    try {
      await updateDoc(doc(db, 'cartItems', cartItemId), {
        quantity: increment(1)
      });
      
      toast.success('Item quantity increased');
      getCart(); // Refresh cart
      return true;
    } catch (error) {
      console.error('Error increasing quantity:', error);
      toast.error('Failed to update cart');
      return false;
    }
  };

  // Decrease quantity of cart item
  const decreaseQuantity = async (cartItemId, currentQuantity) => {
    try {
      if (currentQuantity <= 1) {
        // Remove item if quantity will be zero
        return await removeFromCart(cartItemId);
      }
      
      await updateDoc(doc(db, 'cartItems', cartItemId), {
        quantity: increment(-1)
      });
      
      toast.success('Item quantity decreased');
      getCart(); // Refresh cart
      return true;
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      toast.error('Failed to update cart');
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      await deleteDoc(doc(db, 'cartItems', cartItemId));
      
      toast.success('Item removed from cart');
      getCart(); // Refresh cart
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      return false;
    }
  };

  // Favorites/Wishlist
  // Get favorite items
  const getFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, 'favoriteItems'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const favoritesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFavoriteItems(favoritesData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load your favorites');
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async (product) => {
    // If not logged in, do anonymous login
    if (!user) {
      await anonymousLogin();
    }
    
    try {
      // Check if already in favorites
      const q = query(
        collection(db, 'favoriteItems'), 
        where('userId', '==', user.uid),
        where('productId', '==', product.id)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Already in favorites, remove it
        const favoriteItemId = snapshot.docs[0].id;
        return await removeFromFavorites({ id: favoriteItemId });
      }
      
      // Add to favorites
      await addDoc(collection(db, 'favoriteItems'), {
        userId: user.uid,
        productId: product.id,
        productName: product.name,
        productImageURL: product.image,
        price: product.price,
        createdAt: serverTimestamp()
      });
      
      toast.success('Added to favorites');
      getFavorites(); // Refresh favorites
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add to favorites');
      return false;
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (item) => {
    try {
      await deleteDoc(doc(db, 'favoriteItems', item.id));
      
      toast.success('Removed from favorites');
      getFavorites(); // Refresh favorites
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
      return false;
    }
  };

  // Transaction history
  // Get transaction history
  const getTransactionHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'completedTransactions'),
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTransactionHistory(historyData);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  // Record completed transaction
  const recordTransaction = async (orderDetails) => {
    try {
      await addDoc(collection(db, 'completedTransactions'), {
        customerId: user.uid,
        ...orderDetails,
        createdAt: serverTimestamp()
      });
      
      toast.success('Order completed successfully!');
      return true;
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast.error('Failed to save your order details');
      return false;
    }
  };

  // Clear cart after successful checkout
  const clearCart = async () => {
    if (!user) return;
    
    try {
      const q = query(collection(db, 'cartItems'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      setCartItems([]);
      setCartTotal(0);
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  // Reset everything on logout
  const resetCart = () => {
    setCartItems([]);
    setFavoriteItems([]);
    setTransactionHistory([]);
    setCartTotal(0);
  };

  // Load user's cart and favorites when user changes
  useEffect(() => {
    if (user) {
      getCart();
      getFavorites();
      getTransactionHistory();
    } else {
      resetCart();
    }
  }, [user]);

  const value = {
    cartItems,
    favoriteItems,
    cartTotal,
    transactionHistory,
    loading,
    getCart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    getTransactionHistory,
    recordTransaction,
    clearCart,
    resetCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
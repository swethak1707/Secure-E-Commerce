import { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const { currentUser } = useAuth();

  // Fetch cart items when user logs in
  useEffect(() => {
    const fetchCartItems = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Get user's cart from Firestore
          const cartRef = collection(db, 'carts');
          const q = query(cartRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // No cart items found for this user
            setCartItems([]);
            setLoading(false);
            return;
          }

          // Get the first document (user should only have one cart document)
          const cartDoc = querySnapshot.docs[0];
          const cartData = cartDoc.data();
          
          if (cartData && cartData.items) {
            setCartItems(cartData.items);
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // User not logged in, try to get cart from localStorage
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        } else {
          setCartItems([]);
        }
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [currentUser]);

  // Calculate cart total and count whenever cartItems changes
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    setCartTotal(total);
    setCartCount(count);
    
    // If user is not logged in, save to localStorage
    if (!currentUser) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser]);

  const addToCart = async (product, quantity = 1, currentStock) => {
    try {
      // Validate quantity against current stock
      if (currentStock !== undefined && quantity > currentStock) {
        throw new Error(`Only ${currentStock} items available in stock.`);
      }

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      let updatedCart;

      if (existingItemIndex >= 0) {
        // Ensure total quantity doesn't exceed stock
        const newQuantity = cartItems[existingItemIndex].quantity + quantity;
        
        if (currentStock !== undefined && newQuantity > currentStock) {
          throw new Error(`Cannot add ${quantity} more items. Only ${currentStock - cartItems[existingItemIndex].quantity} more available.`);
        }
        
        // Update existing item
        updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: quantity,
          stock: currentStock // Store current stock for validation
        };
        updatedCart = [...cartItems, newItem];
      }

      // Update local state first for better UX
      setCartItems(updatedCart);

      // If user is logged in, update Firestore
      if (currentUser) {
        const cartRef = collection(db, 'carts');
        const q = query(cartRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Create new cart document for user
          await addDoc(cartRef, {
            userId: currentUser.uid,
            items: updatedCart,
            updatedAt: new Date()
          });
        } else {
          // Update existing cart document
          const cartDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'carts', cartDoc.id), {
            items: updatedCart,
            updatedAt: new Date()
          });
        }
      }

      return true; // Success
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error; // Re-throw to handle in component
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Remove item from cart
      const updatedCart = cartItems.filter(item => item.id !== productId);
      
      // Update local state first
      setCartItems(updatedCart);

      // If user is logged in, update Firestore
      if (currentUser) {
        const cartRef = collection(db, 'carts');
        const q = query(cartRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cartDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'carts', cartDoc.id), {
            items: updatedCart,
            updatedAt: new Date()
          });
        }
      }

      return true; // Success
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false; // Failed
    }
  };

  const updateCartItemQuantity = async (productId, quantity, maxStock) => {
    try {
      // Validate quantity against max stock
      if (maxStock !== undefined && quantity > maxStock) {
        throw new Error(`Cannot add more than ${maxStock} items due to stock limitations.`);
      }

      // Find the item
      const itemIndex = cartItems.findIndex(item => item.id === productId);
      if (itemIndex === -1) return false;

      // Update item quantity
      const updatedCart = [...cartItems];
      updatedCart[itemIndex].quantity = quantity;
      
      // Update local state first
      setCartItems(updatedCart);

      // If user is logged in, update Firestore
      if (currentUser) {
        const cartRef = collection(db, 'carts');
        const q = query(cartRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cartDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'carts', cartDoc.id), {
            items: updatedCart,
            updatedAt: new Date()
          });
        }
      }

      return true; // Success
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error; // Re-throw to handle in component
    }
  };

  const clearCart = async () => {
    try {
      // If user is logged in, remove cart from Firestore
      if (currentUser) {
        const cartRef = collection(db, 'carts');
        const q = query(cartRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cartDoc = querySnapshot.docs[0];
          await deleteDoc(doc(db, 'carts', cartDoc.id));
        }
      }

      // Clear local state
      setCartItems([]);
      localStorage.removeItem('cart');

      return true; // Success
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false; // Failed
    }
  };

  // Process checkout and update product stocks
  const checkout = async () => {
    if (cartItems.length === 0) return false;
    
    try {
      // For each item in cart, we need to check current stock and update it
      for (const item of cartItems) {
        // Get current product stock - FIXED HERE
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          throw new Error(`Product ${item.name} no longer exists.`);
        }
        
        const currentStock = productSnap.data().stock;
        
        if (currentStock < item.quantity) {
          throw new Error(`Not enough stock for ${item.name}. Only ${currentStock} available.`);
        }
        
        // Update product stock (subtract purchased quantity)
        await updateDoc(productRef, {
          stock: currentStock - item.quantity
        });
      }
      
      // Create order record
      if (currentUser) {
        await addDoc(collection(db, 'orders'), {
          userId: currentUser.uid,
          items: cartItems,
          total: cartTotal,
          status: 'pending',
          createdAt: new Date()
        });
      }
      
      // Clear cart after successful checkout
      await clearCart();
      
      return true;
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  };

  // Merge cart when user logs in
  const mergeWithLocalCart = async () => {
    if (!currentUser) return;

    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (localCart.length === 0) return;

    try {
      // Get user's cart from Firestore
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      let userCart = [];
      let cartDocId = null;

      if (!querySnapshot.empty) {
        const cartDoc = querySnapshot.docs[0];
        cartDocId = cartDoc.id;
        userCart = cartDoc.data().items || [];
      }

      // Merge carts
      const mergedCart = [...userCart];

      for (const localItem of localCart) {
        const existingItemIndex = mergedCart.findIndex(item => item.id === localItem.id);

        if (existingItemIndex >= 0) {
          // Update existing item
          mergedCart[existingItemIndex].quantity += localItem.quantity;
        } else {
          // Add new item
          mergedCart.push(localItem);
        }
      }

      // Update Firestore
      if (cartDocId) {
        await updateDoc(doc(db, 'carts', cartDocId), {
          items: mergedCart,
          updatedAt: new Date()
        });
      } else {
        await addDoc(cartRef, {
          userId: currentUser.uid,
          items: mergedCart,
          updatedAt: new Date()
        });
      }

      // Update local state
      setCartItems(mergedCart);
      
      // Clear localStorage
      localStorage.removeItem('cart');

      return true; // Success
    } catch (error) {
      console.error('Error merging carts:', error);
      return false; // Failed
    }
  };

  const value = {
    cartItems,
    loading,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    checkout,
    mergeWithLocalCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
import { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch wishlist items when user logs in
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Get user's wishlist from Firestore
          const wishlistRef = collection(db, 'wishlists');
          const q = query(wishlistRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // No wishlist items found for this user
            setWishlistItems([]);
            setLoading(false);
            return;
          }

          // Get the first document (user should only have one wishlist document)
          const wishlistDoc = querySnapshot.docs[0];
          const wishlistData = wishlistDoc.data();
          
          if (wishlistData && wishlistData.items) {
            setWishlistItems(wishlistData.items);
          } else {
            setWishlistItems([]);
          }
        } catch (error) {
          console.error('Error fetching wishlist items:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // User not logged in, try to get wishlist from localStorage
        const localWishlist = localStorage.getItem('wishlist');
        if (localWishlist) {
          setWishlistItems(JSON.parse(localWishlist));
        } else {
          setWishlistItems([]);
        }
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, [currentUser]);

  // Save wishlist to localStorage whenever it changes (for non-logged in users)
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, currentUser]);

  // Check if a product is in the wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Add or remove from wishlist (toggle functionality)
  const toggleWishlist = async (product) => {
    try {
      const isProductInWishlist = isInWishlist(product.id);
      
      // If product is already in wishlist, remove it, otherwise add it
      let updatedWishlist;
      
      if (isProductInWishlist) {
        // Remove product from wishlist
        updatedWishlist = wishlistItems.filter(item => item.id !== product.id);
      } else {
        // Add product to wishlist
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          stock: product.stock,
          addedAt: new Date().toISOString()
        };
        updatedWishlist = [...wishlistItems, newItem];
      }

      // Update local state first for better UX
      setWishlistItems(updatedWishlist);

      // If user is logged in, update Firestore
      if (currentUser) {
        const wishlistRef = collection(db, 'wishlists');
        const q = query(wishlistRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Create new wishlist document for user
          await addDoc(wishlistRef, {
            userId: currentUser.uid,
            items: updatedWishlist,
            updatedAt: new Date()
          });
        } else {
          // Update existing wishlist document
          const wishlistDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'wishlists', wishlistDoc.id), {
            items: updatedWishlist,
            updatedAt: new Date()
          });
        }
      }

      return !isProductInWishlist; // Return true if added, false if removed
    } catch (error) {
      console.error('Error updating wishlist:', error);
      return false;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      // Remove item from wishlist
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      
      // Update local state first
      setWishlistItems(updatedWishlist);

      // If user is logged in, update Firestore
      if (currentUser) {
        const wishlistRef = collection(db, 'wishlists');
        const q = query(wishlistRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const wishlistDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'wishlists', wishlistDoc.id), {
            items: updatedWishlist,
            updatedAt: new Date()
          });
        }
      }

      return true; // Success
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false; // Failed
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      // If user is logged in, update Firestore
      if (currentUser) {
        const wishlistRef = collection(db, 'wishlists');
        const q = query(wishlistRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const wishlistDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'wishlists', wishlistDoc.id), {
            items: [],
            updatedAt: new Date()
          });
        }
      }

      // Clear local state
      setWishlistItems([]);
      localStorage.removeItem('wishlist');

      return true; // Success
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false; // Failed
    }
  };

  // Merge wishlist when user logs in
  const mergeWithLocalWishlist = async () => {
    if (!currentUser) return;

    const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (localWishlist.length === 0) return;

    try {
      // Get user's wishlist from Firestore
      const wishlistRef = collection(db, 'wishlists');
      const q = query(wishlistRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      let userWishlist = [];
      let wishlistDocId = null;

      if (!querySnapshot.empty) {
        const wishlistDoc = querySnapshot.docs[0];
        wishlistDocId = wishlistDoc.id;
        userWishlist = wishlistDoc.data().items || [];
      }

      // Merge wishlists (avoiding duplicates)
      const mergedWishlist = [...userWishlist];
      let isUpdated = false;

      for (const localItem of localWishlist) {
        const existingItemIndex = mergedWishlist.findIndex(item => item.id === localItem.id);

        if (existingItemIndex === -1) {
          // Add new item
          mergedWishlist.push({
            ...localItem,
            addedAt: localItem.addedAt || new Date().toISOString()
          });
          isUpdated = true;
        }
      }

      // Only update if there were changes
      if (isUpdated) {
        // Update Firestore
        if (wishlistDocId) {
          await updateDoc(doc(db, 'wishlists', wishlistDocId), {
            items: mergedWishlist,
            updatedAt: new Date()
          });
        } else {
          await addDoc(wishlistRef, {
            userId: currentUser.uid,
            items: mergedWishlist,
            updatedAt: new Date()
          });
        }

        // Update local state
        setWishlistItems(mergedWishlist);
      }
      
      // Clear localStorage
      localStorage.removeItem('wishlist');

      return true; // Success
    } catch (error) {
      console.error('Error merging wishlists:', error);
      return false; // Failed
    }
  };

  const value = {
    wishlistItems,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    mergeWithLocalWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export default WishlistContext;
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    limit 
  } from 'firebase/firestore';
  import { db } from '../../../firebase.config';
  
  // Collection reference
  const productsCollection = collection(db, 'products');
  
  // Get all products
  export const getAllProducts = async () => {
    try {
      const querySnapshot = await getDocs(productsCollection);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  };
  
  // Get products by category
  export const getProductsByCategory = async (category) => {
    try {
      const q = query(productsCollection, where('category', '==', category));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  };
  
  // Get low stock products
  export const getLowStockProducts = async (threshold = 10) => {
    try {
      const q = query(productsCollection, where('stock', '<', threshold));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  };
  
  // Get a single product by ID
  export const getProductById = async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        return {
          id: productDoc.id,
          ...productDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  };
  
  // Add a new product
  export const addProduct = async (productData) => {
    try {
      // Add created timestamp
      const newProduct = {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(productsCollection, newProduct);
      return {
        id: docRef.id,
        ...newProduct
      };
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };
  
  // Update an existing product
  export const updateProduct = async (productId, productData) => {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Add updated timestamp
      const updatedProduct = {
        ...productData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(productRef, updatedProduct);
      return {
        id: productId,
        ...updatedProduct
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };
  
  // Delete a product
  export const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };
  
  // Update product stock
  export const updateProductStock = async (productId, newStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  };
  
  // Get featured/newest products
  export const getNewestProducts = async (count = 5) => {
    try {
      const q = query(
        productsCollection,
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting newest products:', error);
      throw error;
    }
  };
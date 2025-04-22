// src/contexts/ShopContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  increment, 
  orderBy,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ShopContext = createContext();

export function useShop() {
  return useContext(ShopContext);
}

export function ShopProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [displayProducts, setDisplayProducts] = useState([]);
  
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const productsPerPage = 12;
  const productsVisited = pageNumber * productsPerPage;

  // Pagination controls
  const nextPage = () => {
    setPageNumber(prevPage => prevPage + 1);
  };
  
  const prevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 0));
  };
  
  // Update displayed products when products or page changes
  useEffect(() => {
    if (products.length > 0) {
      updateDisplayProducts();
    }
  }, [products, pageNumber]);
  
  const updateDisplayProducts = () => {
    setDisplayProducts(
      products.slice(productsVisited, productsVisited + productsPerPage)
    );
  };

  // Get all products
  const getProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('category', 'asc'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get product by ID
  const getProduct = async (id) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        toast.error('Product not found');
        return null;
      }
    } catch (error) {
      toast.error('Error fetching product');
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get products by category
  const getCategoryProducts = async (categoryName) => {
    setLoading(true);
    setCategoryProducts([]);
    try {
      const q = query(collection(db, 'products'), where('category', '==', categoryName));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategoryProducts(productsData);
    } catch (error) {
      toast.error('Failed to load category products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get all categories
  const getCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'categories'));
      const snapshot = await getDocs(q);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get similar products (for product details page)
  const getSimilarProducts = async (productCategory) => {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', productCategory)
      );
      const snapshot = await getDocs(q);
      const similarProductsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.id !== (product?.id || '')); // Exclude current product
      
      setSimilarProducts(similarProductsData);
    } catch (error) {
      console.error('Error getting similar products:', error);
    }
  };

  // Search products
  const searchProducts = async (searchTerm) => {
    setLoading(true);
    try {
      // Firebase doesn't support full-text search natively
      // This is a simplified approach that searches by name prefix
      const q = query(
        collection(db, 'products'),
        orderBy('name'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff')
      );
      
      const snapshot = await getDocs(q);
      const searchResultsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSearchResults(searchResultsData);
      
      if (searchResultsData.length > 0) {
        navigate('/search');
      } else {
        toast.error('No products found matching your search');
      }
      
      return searchResultsData;
    } catch (error) {
      toast.error('Error searching for products');
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  // Create a new product
  const createProduct = async (productData) => {
    if (!isAdmin()) {
      toast.error('You do not have permission to create products');
      return null;
    }
    
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp()
      });
      
      toast.success('Product created successfully');
      return { id: docRef.id, ...productData };
    } catch (error) {
      toast.error('Failed to create product');
      console.error(error);
      return null;
    }
  };

  // Update product stock (increase)
  const increaseProductStock = async (productId) => {
    if (!isAdmin()) {
      toast.error('You do not have permission to update stock');
      return false;
    }
    
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: increment(1)
      });
      
      toast.success('Stock increased');
      getProducts(); // Refresh products
      return true;
    } catch (error) {
      toast.error('Failed to update stock');
      console.error(error);
      return false;
    }
  };

  // Update product stock (decrease)
  const decreaseProductStock = async (productId) => {
    if (!isAdmin()) {
      toast.error('You do not have permission to update stock');
      return false;
    }
    
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: increment(-1)
      });
      
      toast.success('Stock decreased');
      getProducts(); // Refresh products
      return true;
    } catch (error) {
      toast.error('Failed to update stock');
      console.error(error);
      return false;
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!isAdmin()) {
      toast.error('You do not have permission to delete products');
      return false;
    }
    
    try {
      await deleteDoc(doc(db, 'products', productId));
      
      toast.success('Product deleted successfully');
      getProducts(); // Refresh products
      return true;
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
      return false;
    }
  };

  // Load initial data
  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  const value = {
    categories,
    products,
    product,
    categoryProducts,
    similarProducts,
    searchResults,
    loading,
    displayProducts,
    pageNumber,
    getProducts,
    getProduct,
    getCategoryProducts,
    getCategories,
    getSimilarProducts,
    searchProducts,
    createProduct,
    increaseProductStock,
    decreaseProductStock,
    deleteProduct,
    nextPage,
    prevPage
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}
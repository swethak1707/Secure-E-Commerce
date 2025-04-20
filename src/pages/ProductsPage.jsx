import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from "../firebase.config"
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(categoryFilter || 'all');
  const [sortOption, setSortOption] = useState('newest');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const PRODUCTS_PER_PAGE = 10;
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    // Reset pagination when filters change
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
    setLoading(true);
    
    fetchProducts(true);
  }, [activeCategory, sortOption, searchQuery]);
  
  const fetchProducts = async (isFirstPage = false) => {
    try {
      let productsRef = collection(db, 'products');
      let constraints = [];
      
      // Apply category filter
      if (activeCategory && activeCategory !== 'all') {
        constraints.push(where('category', '==', activeCategory));
      }
      
      // Apply search filter (this is a simple implementation)
      // For more complex search, consider using Algolia or similar
      if (searchQuery) {
        constraints.push(where('name', '>=', searchQuery));
        constraints.push(where('name', '<=', searchQuery + '\uf8ff'));
      }
      
      // Apply sorting
      let sortField, sortDirection;
      switch (sortOption) {
        case 'priceAsc':
          sortField = 'price';
          sortDirection = 'asc';
          break;
        case 'priceDesc':
          sortField = 'price';
          sortDirection = 'desc';
          break;
        case 'popular':
          sortField = 'reviewCount';
          sortDirection = 'desc';
          break;
        case 'oldest':
          sortField = 'createdAt';
          sortDirection = 'asc';
          break;
        case 'newest':
        default:
          sortField = 'createdAt';
          sortDirection = 'desc';
      }
      
      constraints.push(orderBy(sortField, sortDirection));
      
      // If this is not the first page, use the last document for pagination
      if (!isFirstPage && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      
      constraints.push(limit(PRODUCTS_PER_PAGE));
      
      // Build and execute the query
      const q = query(productsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      // Save the last document for pagination
      if (!querySnapshot.empty) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        setHasMore(false);
      }
      
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (isFirstPage) {
        setProducts(productsData);
      } else {
        setProducts(prev => [...prev, ...productsData]);
      }
      
      if (productsData.length < PRODUCTS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const loadMoreProducts = () => {
    if (!hasMore || loading) return;
    setLoading(true);
    fetchProducts();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-500 hover:text-purple-600">Home</Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-600 md:ml-2 font-medium">Products</span>
                </div>
              </li>
            </ol>
          </nav>
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeCategory !== 'all' ? activeCategory : 'All Products'}
            </h1>
            {searchQuery && (
              <p className="mt-2 text-gray-600">
                Search results for: <span className="font-medium">{searchQuery}</span>
              </p>
            )}
          </div>
          
          {/* Filters and Sort Section */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Filter */}
            <div className="lg:col-span-3">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeCategory === 'all' 
                        ? 'bg-purple-100 text-purple-800 font-medium' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    All Products
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeCategory === category.name 
                          ? 'bg-purple-100 text-purple-800 font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleCategoryChange(category.name)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Products Grid with Sort */}
            <div className="lg:col-span-9">
              {/* Sort Options */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">
                  {products.length} product{products.length !== 1 && 's'} found
                </p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="mr-2 text-sm text-gray-700">Sort by:</label>
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="border-gray-300 rounded-md py-1 pl-3 pr-8 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="popular">Popularity</option>
                  </select>
                </div>
              </div>
              
              {/* Products Grid */}
              {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Product Skeleton Loader */}
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="w-full h-64 bg-gray-300 rounded-lg"></div>
                      <div className="mt-4 h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="mt-2 h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="mt-2 h-8 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-800">
                  {error}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-gray-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={loadMoreProducts}
                        disabled={loading}
                        className={`inline-block px-6 py-3 border border-purple-600 rounded-md font-medium ${
                          loading 
                            ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                            : 'text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        {loading ? 'Loading...' : 'Load More Products'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
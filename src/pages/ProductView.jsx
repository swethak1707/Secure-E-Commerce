import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit, updateDoc, increment } from 'firebase/firestore';
import { db } from "../firebase.config";
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [cartError, setCartError] = useState('');
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          console.error("No product ID provided");
          setError('Product ID is missing');
          setLoading(false);
          return;
        }

        console.log("Fetching product with ID:", id);
        
        // Get the product document
        const productDoc = doc(db, 'products', id);
        const productSnapshot = await getDoc(productDoc);
        
        if (productSnapshot.exists()) {
          const productData = {
            id: productSnapshot.id,
            ...productSnapshot.data()
          };
          console.log("Product data:", productData);
          setProduct(productData);
          
          // Optionally increment view count if you want to track this
          try {
            await updateDoc(productDoc, {
              viewCount: increment(1)
            });
          } catch (viewCountError) {
            console.log('Could not update view count:', viewCountError);
            // This is non-critical, so we continue execution
          }
          
          // Fetch related products (same category)
          if (productData.category) {
            try {
              console.log("Fetching related products from category:", productData.category);
              
              // Simple query that doesn't require composite index
              const relatedQuery = query(
                collection(db, 'products'),
                where('category', '==', productData.category),
                limit(4)
              );
              
              const relatedSnapshot = await getDocs(relatedQuery);
              console.log("Found related products:", relatedSnapshot.size);
              
              // Filter out the current product in JavaScript
              const relatedData = relatedSnapshot.docs
                .map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }))
                .filter(product => product.id !== id);
              
              setRelatedProducts(relatedData);
            } catch (relatedError) {
              console.error('Error fetching related products:', relatedError);
              // Non-critical, so we don't set the main error state
            }
          }
        } else {
          console.error("Product not found in database");
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Error loading product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Reset state when product changes
    setQuantity(1);
    setCartError('');
    
    // Scroll to top when viewing a product
    window.scrollTo(0, 0);
    
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    
    // Validate quantity against stock
    if (quantity > product.stock) {
      setCartError(`Cannot add ${quantity} items. Only ${product.stock} available in stock.`);
      return;
    }
    
    setIsAddingToCart(true);
    setCartError('');
    
    try {
      // Pass the current stock for validation
      await addToCart(product, quantity, product.stock);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Success!</strong> ${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart.`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartError(error.message || 'Failed to add to cart');
      
      // Show error message in a toast
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Error!</strong> ${error.message || 'Failed to add to cart'}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product || isTogglingWishlist) return;
    
    setIsTogglingWishlist(true);
    
    try {
      const isAdded = await toggleWishlist(product);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Success!</strong> ${product.name} ${isAdded ? 'added to' : 'removed from'} wishlist.`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      
      // Show error message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Error!</strong> Failed to update wishlist.`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    
    if (isNaN(value) || value < 1) {
      setQuantity(1);
      return;
    }
    
    // Don't allow setting quantity higher than stock
    if (product && value > product.stock) {
      setCartError(`Cannot set quantity above available stock (${product.stock})`);
      setQuantity(product.stock);
      return;
    }
    
    setCartError(''); // Clear error when valid quantity is set
    setQuantity(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-300 rounded-lg"></div>
                <div>
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-8"></div>
                  <div className="h-10 bg-gray-300 rounded mb-4"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center py-16">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-lg text-gray-700">{error}</p>
            <Link 
              to="/products" 
              className="mt-6 inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-lg text-gray-700">The product you're looking for could not be found.</p>
            <Link 
              to="/products" 
              className="mt-6 inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine the max quantity that can be added
  const maxQuantity = product.stock || 0;
  
  // Check if product is in wishlist
  const productInWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-500 hover:text-purple-600">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link to="/products" className="ml-1 text-gray-500 hover:text-purple-600 md:ml-2">Products</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-600 md:ml-2 font-medium">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Product Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <img 
                src={product.imageUrl || 'https://picsum.photos/400/400'} 
                alt={product.name} 
                className="w-full h-full object-contain object-center"
                style={{ maxHeight: '500px' }}
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                {/* Rating Stars */}
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating || 0} ({product.reviewCount || 0} reviews)
                </span>
              </div>
              
              {/* Price */}
              <div className="flex items-center mb-6">
                {product.originalPrice ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900">${product.price?.toFixed(2)}</p>
                    <p className="ml-3 text-lg text-gray-500 line-through">${product.originalPrice?.toFixed(2)}</p>
                    <span className="ml-3 bg-purple-100 text-purple-800 text-sm font-medium px-2 py-0.5 rounded">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">${product.price?.toFixed(2)}</p>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{product.description || 'No description available.'}</p>
              </div>
              
              {/* Category & Stock */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="text-gray-900">{product.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                  <p className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {product.stock > 0 ? 
                      (product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} available`) 
                      : 'Out of Stock'}
                  </p>
                </div>
              </div>
              
              {/* Error message */}
              {cartError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {cartError}
                </div>
              )}
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button 
                    className="text-gray-500 focus:outline-none focus:text-gray-600 p-1 border rounded-l-md"
                    onClick={() => handleQuantityChange({ target: { value: quantity - 1 } })}
                    disabled={!product.stock || isAddingToCart || quantity <= 1}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    className="mx-0 text-center w-16 border-t border-b focus:outline-none focus:ring-purple-500"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={maxQuantity}
                    disabled={!product.stock || isAddingToCart}
                  />
                  <button 
                    className="text-gray-500 focus:outline-none focus:text-gray-600 p-1 border rounded-r-md"
                    onClick={() => handleQuantityChange({ target: { value: quantity + 1 } })}
                    disabled={!product.stock || isAddingToCart || quantity >= maxQuantity}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <p className="mt-1 text-sm text-amber-600">
                    Low stock! Only {product.stock} items left.
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || isAddingToCart}
                  className={`flex-1 py-3 px-8 rounded-md font-medium text-white ${
                    isAddingToCart
                      ? 'bg-purple-400 cursor-not-allowed'
                      : product.stock > 0
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                  } transition-colors duration-200`}
                >
                  {isAddingToCart ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                {/* Wishlist Button */}
                <button 
                  onClick={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  className={`p-3 rounded-md border ${
                    productInWishlist 
                      ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50'
                  } transition-colors`}
                  title={productInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  {isTogglingWishlist ? (
                    <svg className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  ) : productInWishlist ? (
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
            
            {/* Review Form */}
            <ReviewForm productId={id} />
            
            {/* Review List */}
            <div className="mt-12">
              <ReviewList productId={id} />
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(relatedProduct => (
                  <Link 
                    key={relatedProduct.id} 
                    to={`/product/${relatedProduct.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-200">
                      <img 
                        src={relatedProduct.imageUrl || 'https://picsum.photos/200/300'} 
                        alt={relatedProduct.name} 
                        className="w-full h-48 object-cover object-center"
                      />
                      <div className="p-4">
                        <h3 className="text-gray-900 font-medium truncate">{relatedProduct.name}</h3>
                        <p className="text-purple-600 font-bold">${relatedProduct.price?.toFixed(2)}</p>
                        {relatedProduct.stock ? (
                          <p className="text-xs text-green-600 mt-1">
                            {relatedProduct.stock <= 5 ? `Only ${relatedProduct.stock} left` : 'In Stock'}
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 mt-1">Out of Stock</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductView;
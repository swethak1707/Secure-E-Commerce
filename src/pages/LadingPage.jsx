import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from "../firebase.config"
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the 5 most recent products from Firestore
  useEffect(() => {
    const fetchRecentProducts = async () => {
      setIsLoading(true);
      try {
        // Query Firestore for the 5 most recent products
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        
        // Map the documents to our product objects
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure all required properties exist with defaults
          rating: doc.data().rating || 4,
          reviewCount: doc.data().reviewCount || 0,
          stock: doc.data().stock || 0
        }));
        
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching recent products:", error);
        // Fallback to empty array if there's an error
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-grow">
        {/* Add padding for fixed navbar */}
        <div className="pt-28">
          {/* Hero Section */}
          <Hero />
          
          {/* Featured Products - Displaying recent products from Firestore */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Latest Products</h2>
                <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                  Discover our most recent additions to the store
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-5">
                {isLoading ? (
                  // Enhanced Product Skeleton Loader
                  [...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="w-full h-80 bg-gray-300 rounded-lg"></div>
                      <div className="mt-4 h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="mt-2 h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="mt-2 h-6 bg-gray-300 rounded"></div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="h-10 bg-gray-300 rounded"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-5 text-center py-10">
                    <p className="text-gray-500">No products found. Check back soon!</p>
                  </div>
                )}
              </div>
              
              <div className="mt-12 text-center">
                <Link
                  to="/products"
                  className="inline-block bg-purple-600 py-3 px-8 border border-transparent rounded-md font-medium text-white hover:bg-purple-700 transition-colors duration-200"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </section>
          
          {/* Banner - Enhanced design */}
          <section className="py-16 bg-gradient-to-r from-purple-800 to-purple-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="text-center lg:text-left mb-8 lg:mb-0">
                  <span className="inline-block py-1 px-3 rounded-full bg-purple-900 text-purple-100 text-sm font-medium mb-4">Limited Time</span>
                  <h2 className="text-4xl font-bold text-white">Summer Sale</h2>
                  <p className="mt-4 text-xl text-purple-100 max-w-lg">
                    Up to 50% off on selected items. Don't miss out on these amazing deals.
                  </p>
                </div>
                <div>
                  <Link
                    to="/products"
                    className="inline-block bg-white py-4 px-10 border border-transparent rounded-md font-medium text-purple-700 hover:bg-purple-50 shadow-md hover:shadow-lg transition-all duration-200 text-lg"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </section>
          
          {/* New Arrivals - Enhanced design */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">Just Landed</span>
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">New Arrivals</h2>
                <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                  The latest additions to our collection
                </p>
              </div>
              
              {/* Image grid showcase */}
              <div className="mt-12 grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-6 lg:grid-cols-3">
                <div className="relative group h-96 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1603189343302-e603f7add05a?q=80&w=1974" 
                    alt="New Arrivals" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white">Summer Collection</h3>
                    <p className="text-sm text-white mb-4">Refresh your wardrobe</p>
                    <Link 
                      to="/products" 
                      className="inline-block bg-white text-purple-700 py-2 px-4 rounded-md font-medium hover:bg-purple-100 transition-colors duration-200"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
                
                <div className="relative group h-96 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1974" 
                    alt="Accessories" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white">Modern Accessories</h3>
                    <p className="text-sm text-white mb-4">Complete your look</p>
                    <Link 
                      to="/products" 
                      className="inline-block bg-white text-purple-700 py-2 px-4 rounded-md font-medium hover:bg-purple-100 transition-colors duration-200"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
                
                <div className="relative group h-96 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070" 
                    alt="Home Essentials" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white">Home Essentials</h3>
                    <p className="text-sm text-white mb-4">Elevate your space</p>
                    <Link 
                      to="/products" 
                      className="inline-block bg-white text-purple-700 py-2 px-4 rounded-md font-medium hover:bg-purple-100 transition-colors duration-200"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Testimonials - Enhanced design */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">Testimonials</span>
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
                <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                  Don't just take our word for it, hear from our satisfied customers
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                  <div className="absolute -top-4 -left-4 h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"I'm absolutely in love with my new dress! The quality is amazing and the shipping was super fast. Will definitely be shopping here again."</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">S</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">Verified Buyer</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                  <div className="absolute -top-4 -left-4 h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"The customer service here is exceptional. I had an issue with my order and they resolved it immediately. The products are top quality too!"</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">M</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Michael Rodriguez</p>
                      <p className="text-xs text-gray-500">Verified Buyer</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                  <div className="absolute -top-4 -left-4 h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"Great selection of products at reasonable prices. Shipping took a bit longer than expected, but the quality makes up for it. Would recommend!"</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">J</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Jennifer Patel</p>
                      <p className="text-xs text-gray-500">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* CTA Section - Enhanced design */}
          <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-purple-700 rounded-lg shadow-2xl overflow-hidden">
                <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      <span className="block">Ready to get started?</span>
                      <span className="block text-purple-200">Join our newsletter today.</span>
                    </h2>
                    <p className="mt-4 text-lg text-purple-100 max-w-lg">
                      Sign up for our newsletter to receive updates on new products, exclusive offers, and more.
                    </p>
                  </div>
                  <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
                    <div className="inline-flex flex-col sm:flex-row rounded-md shadow">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="px-5 py-3 rounded-t-md sm:rounded-tr-none sm:rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                      />
                      <button
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-b-md sm:rounded-bl-none sm:rounded-r-md text-white bg-purple-900 hover:bg-purple-800 transition-colors duration-200"
                      >
                        Subscribe
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-purple-200 text-center sm:text-left">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
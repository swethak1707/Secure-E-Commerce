// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ShopProvider } from './contexts/ShopContext';
import { CartProvider } from './contexts/CartContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import MyAccount from './pages/MyAccount';
import Favorites from './pages/Favorites';
import AdminPanel from './pages/AdminPanel';
import CategoryPage from './pages/CategoryPage';
import SearchResults from './pages/SearchResults';
import OrderHistory from './pages/OrderHistory';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="auth" element={<Auth />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="categories/:id" element={<CategoryPage />} />
                <Route path="search" element={<SearchResults />} />
                
                {/* Protected Routes - require authentication */}
                <Route path="checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="success" element={
                  <ProtectedRoute>
                    <Success />
                  </ProtectedRoute>
                } />
                <Route path="account" element={
                  <ProtectedRoute>
                    <MyAccount />
                  </ProtectedRoute>
                } />
                <Route path="favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                <Route path="orders" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes - require admin privileges */}
                <Route path="admin/*" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
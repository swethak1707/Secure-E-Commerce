// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { StripeProvider } from './context/StripeContext'; // Add the Stripe Provider
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';

// Public Pages
import LandingPage from "./pages/LadingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProductView from "./pages/ProductView";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatPage from './pages/ChatPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage'; // Add the new Checkout page
import PaymentSuccessPage from './pages/PaymentSuccessPage'; // Add the Payment Success page
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <StripeProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductView />} />
                <Route path="/cart" element={<CartPage />} />
                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                } />
                <Route path='/support' element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path='/orders' element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                
                {/* Checkout and Payment Routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="/payment-success" element={
                  <ProtectedRoute>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } />
                
                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard activeTab="dashboard" />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminDashboard activeTab="products" />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminDashboard activeTab="users" />
                  </AdminRoute>
                } />
                <Route path="/admin/chat" element={
                  <AdminRoute>
                    <AdminDashboard activeTab="chat" />
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminDashboard activeTab="settings" />
                  </AdminRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </StripeProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
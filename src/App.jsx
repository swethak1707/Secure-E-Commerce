// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';
// import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';

// // Public Pages
// import LandingPage from "./pages/LadingPage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import NotFoundPage from './pages/NotFoundPage';
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import ProductView from "./pages/ProductView";
// import ProductsPage from "./pages/ProductsPage";
// import CartPage from "./pages/CartPage";
// import AdminDashboard from './pages/admin/AdminDashboard';

// function App() {
//   return (
//     <AuthProvider>
//       <CartProvider>
//         <BrowserRouter>
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/register" element={<RegisterPage />} />
//             <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//             <Route path="/products" element={<ProductsPage />} />
//             <Route path="/product/:id" element={<ProductView />} />
//             <Route path="/cart" element={<CartPage />} />
            
//             {/* Protected User Routes */}
//             <Route path="/profile" element={
//               <ProtectedRoute>
//                 <div>User Profile Page</div>
//               </ProtectedRoute>
//             } />
//             <Route path="/orders" element={
//               <ProtectedRoute>
//                 <div>User Orders Page</div>
//               </ProtectedRoute>
//             } />
//             <Route path="/wishlist" element={
//               <ProtectedRoute>
//                 <div>User Wishlist Page</div>
//               </ProtectedRoute>
//             } />
            
//             {/* Protected Admin Routes */}
//             <Route path="/admin/dashboard" element={
//               <AdminRoute>
//                 <AdminDashboard />
//               </AdminRoute>
//             } />
//             <Route path="/admin/products" element={
//               <AdminRoute>
//                 <AdminDashboard activeTab="products" />
//               </AdminRoute>
//             } />
//             <Route path="/admin/users" element={
//               <AdminRoute>
//                 <AdminDashboard activeTab="users" />
//               </AdminRoute>
//             } />
//             <Route path="/admin/settings" element={
//               <AdminRoute>
//                 <AdminDashboard activeTab="settings" />
//               </AdminRoute>
//             } />
            
//             {/* 404 Route */}
//             <Route path="*" element={<NotFoundPage />} />
//           </Routes>
//         </BrowserRouter>
//       </CartProvider>
//     </AuthProvider>
//   );
// }

// export default App;



import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
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
                  <div>User Profile Page</div>
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
              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
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
              <Route path="/admin/settings" element={
                <AdminRoute>
                  <AdminDashboard activeTab="settings" />
                </AdminRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
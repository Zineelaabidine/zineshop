import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import Categories from './components/Categories';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';

import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import SignInPage from './pages/SignInPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const HomePage = () => (
    <> 
      <div className="pt-19">
        <Hero />
      </div>
      <ProductShowcase />
      <Categories />
      <Newsletter />
    </>
  );

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

          {/* Scroll to top on route changes */}
          <ScrollToTop
            excludePatterns={[]}
            excludeSearchParams={['page', 'limit', 'search', 'category', 'sortBy', 'sortOrder']}
          />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Floating scroll to top button */}
          <ScrollToTopButton />

          <Footer />
          </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
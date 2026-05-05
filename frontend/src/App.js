import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CartProvider, WishlistProvider } from './common/shared';
import { AuthProvider } from './contexts/AuthContext/AuthContext';
import { NotifyProvider } from './contexts/NotifyContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordOtpPage from './components/ResetPasswordOtpPage';
import HomePage from './components/HomePage';
import ProductListingPage from './components/ProductListingPage';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import MyOrdersPage from './components/MyOrdersPage';
import OrderTrackingPage from './components/OrderTrackingPage';
import ReviewsPage from './components/ReviewsPage';
import SavedAddressesPage from './components/SavedAddressesPage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import UserProfilePage from './components/UserProfilePage';
import WishlistPage from './components/WishlistPage';

export default function App() {
  return (
    <BrowserRouter>
      <NotifyProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/verify" element={<ResetPasswordOtpPage />} />
            <Route path="/products" element={<ProductListingPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/order/:orderId/tracking" element={<OrderTrackingPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile/addresses" element={<SavedAddressesPage />} />
            <Route path="/profile/settings" element={<ProfileSettingsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotifyProvider>
    </BrowserRouter>
  );
}

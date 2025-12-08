// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";

// Import pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/products/ProductList";
import ProductCreate from "./pages/products/ProductCreate";
import ProductEdit from "./pages/products/ProductEdit";
import OrderList from "./pages/orders/OrderList";
import OrderCreate from "./pages/orders/OrderCreate";
import OrderDetail from "./pages/orders/OrderDetail";
import StockList from "./pages/stocks/StockList";
import StockCreate from "./pages/stocks/StockCreate";
import CustomerList from "./pages/customers/CustomerList";
import CustomerCreate from "./pages/customers/CustomerCreate";
import CustomerEdit from "./pages/customers/CustomerEdit";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            index
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/create"
            element={
              <ProtectedRoute>
                <ProductCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/create"
            element={
              <ProtectedRoute>
                <OrderCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stocks"
            element={
              <ProtectedRoute>
                <StockList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stocks/create"
            element={
              <ProtectedRoute>
                <StockCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/create"
            element={
              <ProtectedRoute>
                <CustomerCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedRoute>
                <CustomerEdit />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: Redirect to home or login */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/products/ProductList";
import ProductCreate from "./pages/products/ProductCreate";
import OrderList from "./pages/orders/OrderList";
import OrderCreate from "./pages/orders/OrderCreate";
import StockList from "./pages/stocks/StockList";

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/create" element={<OrderCreate />} />
          <Route path="/stocks" element={<StockList />} />
        </Routes>
      </div>
    </div>
  );
}

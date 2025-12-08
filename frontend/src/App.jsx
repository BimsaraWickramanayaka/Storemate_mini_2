// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
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

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/products/:id/edit" element={<ProductEdit />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/create" element={<OrderCreate />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/stocks" element={<StockList />} />
          <Route path="/stocks/create" element={<StockCreate />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/create" element={<CustomerCreate />} />
          <Route path="/customers/:id/edit" element={<CustomerEdit />} />
        </Routes>
      </div>
    </div>
  );
}

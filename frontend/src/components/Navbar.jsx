// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { TenantContext } from "../context/TenantContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { tenant } = useContext(TenantContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Only show navbar if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white p-4 flex items-center justify-between shadow">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold text-lg">Storemate OMS</Link>
        <span className="text-sm text-gray-500">|</span>
        <span className="text-sm text-gray-600">{tenant?.name}</span>
        
        <Link to="/products" className="hover:text-indigo-600">Products</Link>
        <Link to="/customers" className="hover:text-indigo-600">Customers</Link>
        <Link to="/orders" className="hover:text-indigo-600">Orders</Link>
        <Link to="/stocks" className="hover:text-indigo-600">Stocks</Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{user?.name}</span>
          <span className="text-gray-500 mx-2">({user?.email})</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { TenantContext } from "../context/TenantContext";

export default function Navbar() {
  const { tenant, switchTenant, tenants } = useContext(TenantContext);

  return (
    <nav className="bg-white p-4 flex items-center justify-between shadow">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold">Storemate OMS</Link>
        <Link to="/products">Products</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/stocks">Stocks</Link>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={tenant.id}
          onChange={(e) => {
            const selected = tenants.find(t => t.id === e.target.value);
            if (selected) switchTenant(selected);
          }}
          className="border rounded p-1"
        >
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
    </nav>
  );
}

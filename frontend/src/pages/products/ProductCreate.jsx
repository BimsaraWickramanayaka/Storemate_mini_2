// src/pages/products/ProductCreate.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../api/productApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function ProductCreate(){
  const navigate = useNavigate();
  const { tenant } = useContext(TenantContext);
  const [form, setForm] = useState({ name: "", sku: "", description: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createProduct({
        name: form.name,
        sku: form.sku,
        description: form.description,
        price: parseFloat(form.price)
      });
      // after creating, go to list for current tenant
      navigate("/products");
    } catch (err) {
      setError(err);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Create Product</h2>
      <ErrorBox error={error} />
      <form onSubmit={submit} className="space-y-3 max-w-md">
        <div>
          <label className="block text-sm">Name</label>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">SKU</label>
          <input required value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">Price</label>
          <input required type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border rounded p-2" />
        </div>
        <div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => navigate("/products")} className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

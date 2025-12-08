// src/pages/products/ProductEdit.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProduct, updateProduct } from "../../api/productApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function ProductEdit(){
  const navigate = useNavigate();
  const { id } = useParams();
  const { tenant } = useContext(TenantContext);
  const [form, setForm] = useState({ name: "", sku: "", description: "", price: "" });
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const product = await fetchProduct(id);
        console.log("Loaded product:", product);
        setProductName(product.name);
        setForm({
          name: product.name || "",
          sku: product.sku || "",
          description: product.description || "",
          price: product.price ? parseFloat(product.price).toFixed(2) : ""
        });
      } catch (err) {
        console.error("Error loading product:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, tenant.id]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Don't update SKU - it's immutable after creation
      await updateProduct(id, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price)
      });
      navigate("/products");
    } catch (err) {
      // Handle 409 Conflict (product has order items)
      if (err.response?.status === 409) {
        setError({
          message: "Cannot edit this product because it has associated orders. Products can only be edited before they are ordered."
        });
      } else {
        setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h2 className="text-xl mb-2">Edit Product</h2>
      {productName && <p className="text-gray-600 text-sm mb-4">Editing: <strong>{productName}</strong></p>}
      <ErrorBox error={error} />
      <form onSubmit={submit} className="space-y-3 max-w-md bg-white rounded shadow p-6">
        <div>
          <label className="block text-sm">Name</label>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">SKU <span className="text-gray-500 text-xs">(not editable)</span></label>
          <input disabled value={form.sku} className="w-full border rounded p-2 bg-gray-100 text-gray-600" />
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate("/products")} className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

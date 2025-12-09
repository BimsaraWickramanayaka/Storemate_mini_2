// src/pages/products/ProductList.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, deleteProduct } from "../../api/productApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function ProductList(){
  const { tenant, tenantChangeCount } = useContext(TenantContext);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const [actionError, setActionError] = useState(null); // For action-specific errors
  const [actionInProgress, setActionInProgress] = useState(null);

  const load = async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { items, meta: m } = await fetchProducts({ page: pg });
      setProducts(items || []);
      setMeta(m || null);
      setPage(pg);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if (tenant) {
      load(1);
    }
    // Re-run when tenant changes
  }, [tenant?.id, tenantChangeCount]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      return;
    }

    setActionInProgress(id);
    setActionError(null); // Clear previous errors
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      // Handle 409 Conflict (product has order items)
      if (err.response?.status === 409) {
        setActionError({
          message: "Cannot delete this product because it has associated orders. Products can only be deleted before they are ordered."
        });
      } else {
        setActionError(err);
      }
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const getTotalStock = (p) => {
    const stocks = p.stocks ?? [];
    return stocks.reduce((s, b) => s + (b.quantity || 0), 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link to="/products/create" className="bg-blue-600 text-white px-3 py-1 rounded">Add Product</Link>
      </div>

      {/* Action Error Alert (doesn't hide the list) */}
      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{actionError.message || "An error occurred"}</p>
          <button
            onClick={() => setActionError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">SKU</th>
            <th className="p-2 text-right">Price</th>
            <th className="p-2 text-right">Total Stock</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.sku}</td>
              <td className="p-2 text-right">{typeof p.price === "number" ? p.price.toFixed(2) : p.price}</td>
              <td className="p-2 text-right">{getTotalStock(p)}</td>
              <td className="p-2 space-x-2">
                <Link to={`/products/${p.id}/edit`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Edit</Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={actionInProgress === p.id}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {actionInProgress === p.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="5" className="p-4 text-center">No products found</td></tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between mt-4">
          <div>Page {meta.current_page} of {meta.last_page} — Total {meta.total}</div>
          <div className="space-x-2">
            <button onClick={()=>load(page-1)} disabled={meta.current_page <= 1} className="px-3 py-1 border rounded">Prev</button>
            <button onClick={()=>load(page+1)} disabled={meta.current_page >= meta.last_page} className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

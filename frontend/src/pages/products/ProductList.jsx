// src/pages/products/ProductList.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../api/productApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function ProductList(){
  const { tenant } = useContext(TenantContext);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

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
    load(1);
    // re-run when tenant changes
  }, [tenant.id]);

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

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">SKU</th>
            <th className="p-2 text-right">Price</th>
            <th className="p-2 text-right">Total Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.sku}</td>
              <td className="p-2 text-right">{typeof p.price === "number" ? p.price.toFixed(2) : p.price}</td>
              <td className="p-2 text-right">{getTotalStock(p)}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="4" className="p-4 text-center">No products found</td></tr>
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

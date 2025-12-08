// src/pages/stocks/StockList.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchStocks, deleteStock } from "../../api/stockApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function StockList(){
  const { tenant, tenantChangeCount } = useContext(TenantContext);
  const [stocks,setStocks] = useState([]);
  const [meta,setMeta] = useState(null);
  const [page,setPage] = useState(1);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  const load = async (pg=1) => {
    setLoading(true);
    setError(null);
    try {
      const { items, meta: m } = await fetchStocks({ page: pg });
      setStocks(items || []);
      setMeta(m || null);
      setPage(pg);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (stockId) => {
    if (!window.confirm("Delete this stock batch? This cannot be undone.")) return;
    
    setActionInProgress(stockId);
    try {
      await deleteStock(stockId);
      // Reload stocks
      load(page);
    } catch (err) {
      setError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  useEffect(()=> { load(1); }, [tenant.id, tenantChangeCount]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Stock Batches</h2>
        <Link to="/stocks/create" className="bg-blue-600 text-white px-3 py-1 rounded">Add Stock</Link>
      </div>

      {error && <ErrorBox error={error} />}

      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Batch Code</th>
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-right">Quantity</th>
            <th className="p-2 text-left">Received</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map(s => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{s.batch_code || "—"}</td>
              <td className="p-2">{s.product?.name ?? s.product_name}</td>
              <td className="p-2 text-right font-semibold">{s.quantity}</td>
              <td className="p-2">{formatDate(s.received_at)}</td>
              <td className="p-2">
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={actionInProgress === s.id}
                  className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {actionInProgress === s.id ? "..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
          {stocks.length === 0 && <tr><td colSpan="5" className="p-4 text-center">No stock batches found</td></tr>}
        </tbody>
      </table>

      {meta && (
        <div className="flex items-center justify-between mt-4">
          <div>Page {meta.current_page} of {meta.last_page} — Total {meta.total}</div>
          <div className="space-x-2">
            <button onClick={()=>load(page-1)} disabled={meta.current_page <= 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Prev</button>
            <button onClick={()=>load(page+1)} disabled={meta.current_page >= meta.last_page} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

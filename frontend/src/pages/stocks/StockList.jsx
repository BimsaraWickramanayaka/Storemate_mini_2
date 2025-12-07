// src/pages/stocks/StockList.jsx
import React, { useEffect, useState, useContext } from "react";
import { fetchStocks } from "../../api/stockApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function StockList(){
  const { tenant } = useContext(TenantContext);
  const [stocks,setStocks] = useState([]);
  const [meta,setMeta] = useState(null);
  const [page,setPage] = useState(1);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

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

  useEffect(()=> { load(1); }, [tenant.id]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div>
      <h2 className="text-xl mb-4">Stock Batches</h2>
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr><th>Batch</th><th>Product</th><th>Qty</th><th>Received</th></tr>
        </thead>
        <tbody>
          {stocks.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.batch_code}</td>
              <td className="p-2">{s.product?.name ?? s.product_name}</td>
              <td className="p-2">{s.quantity}</td>
              <td className="p-2">{s.received_at}</td>
            </tr>
          ))}
          {stocks.length === 0 && <tr><td colSpan="4" className="p-4 text-center">No stock batches found</td></tr>}
        </tbody>
      </table>

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

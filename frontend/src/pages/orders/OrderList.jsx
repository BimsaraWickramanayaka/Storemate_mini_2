// src/pages/orders/OrderList.jsx
import React, { useEffect, useState, useContext } from "react";
import { fetchOrders } from "../../api/orderApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function OrderList(){
  const { tenant } = useContext(TenantContext);
  const [orders,setOrders] = useState([]);
  const [meta,setMeta] = useState(null);
  const [page,setPage] = useState(1);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  const load = async (pg=1) => {
    setLoading(true);
    setError(null);
    try {
      const { items, meta: m } = await fetchOrders({ page: pg });
      setOrders(items || []);
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
      {/* <h2 className="text-xl mb-4">Orders</h2> */}

      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        <Link to="/orders/create" className="bg-blue-600 text-white px-3 py-1 rounded">Add Order</Link>
      </div> */}

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr><th className="p-2">Order#</th><th className="p-2">Customer</th><th className="p-2">Total</th><th className="p-2">Status</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-t">
              <td className="p-2">{o.order_number}</td>
              <td className="p-2">{o.customer?.name ?? o.customer_email}</td>
              <td className="p-2">{o.total_amount}</td>
              <td className="p-2">{o.status}</td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan="4" className="p-4 text-center">No orders found</td></tr>}
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

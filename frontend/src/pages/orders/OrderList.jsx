// src/pages/orders/OrderList.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchOrders, confirmOrder, cancelOrder, deleteOrder } from "../../api/orderApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function OrderList(){
  const { tenant, tenantChangeCount } = useContext(TenantContext);
  const [orders,setOrders] = useState([]);
  const [meta,setMeta] = useState(null);
  const [page,setPage] = useState(1);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null); // Track which order is being acted on

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

  const handleConfirm = async (orderId) => {
    if (!window.confirm("Confirm this order? Stock will be deducted.")) return;
    
    setActionInProgress(orderId);
    try {
      await confirmOrder(orderId);
      // Reload orders to show updated status
      load(page);
    } catch (err) {
      setError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    
    setActionInProgress(orderId);
    try {
      await cancelOrder(orderId);
      // Reload orders to show updated status
      load(page);
    } catch (err) {
      setError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    
    setActionInProgress(orderId);
    try {
      await deleteOrder(orderId);
      // Reload orders
      load(page);
    } catch (err) {
      setError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      shipped: "bg-blue-100 text-blue-800",
    };
    return `px-2 py-1 rounded text-sm font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-800"}`;
  };

  const getOrderActions = (order) => {
    const isActing = actionInProgress === order.id;
    
    switch (order.status) {
      case "pending":
        return (
          <div className="flex gap-1">
            <button
              onClick={() => handleConfirm(order.id)}
              disabled={isActing}
              className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {isActing ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => handleCancel(order.id)}
              disabled={isActing}
              className="bg-orange-600 text-white px-2 py-1 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {isActing ? "..." : "Cancel"}
            </button>
            <button
              onClick={() => handleDelete(order.id)}
              disabled={isActing}
              className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {isActing ? "..." : "Delete"}
            </button>
          </div>
        );
      case "confirmed":
        return <span className="text-gray-500 text-sm italic">Order locked</span>;
      case "cancelled":
        return <span className="text-red-500 text-sm italic">Cancelled</span>;
      case "shipped":
        return <span className="text-blue-500 text-sm italic">Shipped</span>;
      default:
        return null;
    }
  };

  useEffect(()=> { load(1); }, [tenant.id, tenantChangeCount]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        <Link to="/orders/create" className="bg-blue-600 text-white px-3 py-1 rounded">Add Order</Link>
      </div>

      {error && <ErrorBox error={error} />}

      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Order#</th>
            <th className="p-2 text-left">Customer</th>
            <th className="p-2 text-right">Total</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-t hover:bg-gray-50">
              <td className="p-2">
                <Link to={`/orders/${o.id}`} className="text-blue-600 hover:underline font-medium">
                  {o.order_number}
                </Link>
              </td>
              <td className="p-2">{o.customer?.name ?? o.customer_email ?? "Guest"}</td>
              <td className="p-2 text-right">${typeof o.total_amount === "number" ? o.total_amount.toFixed(2) : o.total_amount}</td>
              <td className="p-2">
                <span className={getStatusBadge(o.status)}>{o.status}</span>
              </td>
              <td className="p-2">{getOrderActions(o)}</td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan="5" className="p-4 text-center">No orders found</td></tr>}
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

// src/pages/orders/OrderDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, confirmOrder, cancelOrder, deleteOrder } from "../../api/orderApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenant } = useContext(TenantContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrder(id);
        const data = response.data || response;
        setOrder(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, tenant.id]);

  const handleConfirm = async () => {
    if (!window.confirm("Are you sure you want to confirm this order? This will deduct stock.")) {
      return;
    }
    setActionInProgress("confirm");
    try {
      const response = await confirmOrder(id);
      const data = response.data || response;
      setOrder(data);
    } catch (err) {
      setError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }
    setActionInProgress("cancel");
    try {
      const response = await cancelOrder(id);
      const data = response.data || response;
      setOrder(data);
    } catch (err) {
      setError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order? This cannot be undone.")) {
      return;
    }
    setActionInProgress("delete");
    try {
      await deleteOrder(id);
      navigate("/orders");
    } catch (err) {
      setError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return <Loading />;
  if (!order) return <ErrorBox error={error || { message: "Order not found" }} />;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && <ErrorBox error={error} />}

      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate("/orders")} className="text-blue-600 hover:underline mb-4">
          ← Back to Orders
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{order.order_number}</h1>
            <p className="text-gray-600 text-sm mt-1">Created: {formatDate(order.created_at)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Customer Section */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{order.customer?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{order.customer?.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{order.customer?.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer ID</p>
            <p className="font-medium text-xs text-gray-500">{order.customer_id}</p>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white rounded shadow overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-medium">Product</th>
                <th className="p-4 text-left font-medium">SKU</th>
                <th className="p-4 text-right font-medium">Quantity</th>
                <th className="p-4 text-right font-medium">Price</th>
                <th className="p-4 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{item.product?.name || "-"}</p>
                      <p className="text-sm text-gray-600">{item.product?.description || ""}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{item.product?.sku || "-"}</td>
                  <td className="p-4 text-right">{item.quantity}</td>
                  <td className="p-4 text-right">${parseFloat(item.price_at_purchase).toFixed(2)}</td>
                  <td className="p-4 text-right font-medium">
                    ${(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-3xl font-bold text-blue-600">${parseFloat(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium capitalize">{order.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ordered Date</p>
            <p className="font-medium">{formatDate(order.ordered_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created At</p>
            <p className="font-medium text-sm text-gray-500">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Updated At</p>
            <p className="font-medium text-sm text-gray-500">{formatDate(order.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {order.status === "pending" && (
          <>
            <button
              onClick={handleConfirm}
              disabled={actionInProgress === "confirm"}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {actionInProgress === "confirm" ? "Confirming..." : "Confirm Order"}
            </button>
            <button
              onClick={handleCancel}
              disabled={actionInProgress === "cancel"}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {actionInProgress === "cancel" ? "Cancelling..." : "Cancel Order"}
            </button>
            <button
              onClick={handleDelete}
              disabled={actionInProgress === "delete"}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {actionInProgress === "delete" ? "Deleting..." : "Delete Order"}
            </button>
          </>
        )}
        {order.status === "confirmed" && (
          <div className="bg-green-50 border border-green-200 rounded p-4 w-full">
            <p className="text-green-800 font-medium">✓ Order locked - Stock has been deducted</p>
          </div>
        )}
        {(order.status === "cancelled" || order.status === "shipped") && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full">
            <p className="text-gray-800 font-medium">Order is {order.status.toUpperCase()} - No further actions available</p>
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/orders")}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        Back to Orders
      </button>
    </div>
  );
}

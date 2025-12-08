// src/pages/stocks/StockCreate.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../api/productApi";
import { createStock } from "../../api/stockApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function StockCreate(){
  const { tenant, tenantChangeCount } = useContext(TenantContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form fields
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [receivedAt, setReceivedAt] = useState("");

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { items: pItems } = await fetchProducts({ per_page: 100 });
        setProducts(pItems || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [tenant.id, tenantChangeCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!productId) {
      setError({ message: "Please select a product" });
      return;
    }
    if (!quantity || quantity < 1) {
      setError({ message: "Quantity must be at least 1" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: productId,
        quantity: parseInt(quantity, 10),
        batch_code: batchCode || null,
        received_at: receivedAt || new Date().toISOString(),
      };

      await createStock(payload);
      navigate("/stocks");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Add Stock Batch</h2>

      {error && <ErrorBox error={error} />}

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 space-y-4">
        {/* Product Selection */}
        <div>
          <label htmlFor="productId" className="block text-sm font-medium mb-2">
            Product <span className="text-red-500">*</span>
          </label>
          <select
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (SKU: {p.sku})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 100"
          />
        </div>

        {/* Batch Code */}
        <div>
          <label htmlFor="batchCode" className="block text-sm font-medium mb-2">
            Batch Code <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            id="batchCode"
            type="text"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., BATCH-2024-001"
          />
        </div>

        {/* Received Date */}
        <div>
          <label htmlFor="receivedAt" className="block text-sm font-medium mb-2">
            Received Date <span className="text-gray-500 text-xs">(optional, defaults to today)</span>
          </label>
          <input
            id="receivedAt"
            type="date"
            value={receivedAt}
            onChange={(e) => setReceivedAt(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Add Stock"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/stocks")}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About Stock Batches</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each stock entry represents a batch/lot of a product</li>
          <li>• Batches are used for FIFO (First-In-First-Out) stock deduction</li>
          <li>• Batch codes help track inventory origins</li>
          <li>• Received dates determine stock order for FIFO logic</li>
        </ul>
      </div>
    </div>
  );
}

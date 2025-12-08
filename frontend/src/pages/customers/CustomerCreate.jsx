// src/pages/customers/CustomerCreate.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../../api/customerApi";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function CustomerCreate() {
  const { tenant } = useContext(TenantContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError({ message: "Customer name is required" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      };

      await createCustomer(payload);
      navigate("/customers");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Add Customer</h2>

      {error && <ErrorBox error={error} />}

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 space-y-4">
        {/* Customer Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., john@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., +1 (555) 123-4567"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Add Customer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About Customers</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Customers are used to track orders in the system</li>
          <li>• Name is required, email and phone are optional</li>
          <li>• Customers can have multiple orders</li>
          <li>• You can only delete customers without any orders</li>
        </ul>
      </div>
    </div>
  );
}

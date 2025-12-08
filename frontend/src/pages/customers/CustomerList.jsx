// src/pages/customers/CustomerList.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchCustomers, deleteCustomer } from "../../api/customerApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function CustomerList() {
  const { tenant, tenantChangeCount } = useContext(TenantContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null); // For delete-specific errors
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { items } = await fetchCustomers({ per_page: 100 });
        setCustomers(items || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [tenant.id, tenantChangeCount]);

  const handleDelete = async (id) => {
    const customer = customers.find(c => c.id === id);
    
    if (customer?.orders?.length > 0) {
      setActionError({
        message: `Cannot delete customer with ${customer.orders.length} order(s). Please delete or reassign the orders first.`
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this customer? This cannot be undone.")) {
      return;
    }

    setActionInProgress(id);
    setActionError(null); // Clear previous errors
    try {
      await deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      setActionError(err);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Customers</h2>
        <Link to="/customers/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Customer
        </Link>
      </div>

      {error && <ErrorBox error={error} />}

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

      {customers.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-500">
          <p>No customers yet. <Link to="/customers/create" className="text-blue-600 hover:underline">Create one</Link></p>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">Phone</th>
                <th className="p-4 text-left font-medium">Orders</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{customer.name}</td>
                  <td className="p-4 text-gray-600">{customer.email || "-"}</td>
                  <td className="p-4 text-gray-600">{customer.phone || "-"}</td>
                  <td className="p-4 text-gray-600">{customer.orders?.length || 0}</td>
                  <td className="p-4 space-x-2">
                    <Link to={`/customers/${customer.id}/edit`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Edit</Link>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      disabled={actionInProgress === customer.id}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionInProgress === customer.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

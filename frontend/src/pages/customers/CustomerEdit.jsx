// src/pages/customers/CustomerEdit.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCustomer, updateCustomer } from "../../api/customerApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { TenantContext } from "../../context/TenantContext";

export default function CustomerEdit(){
  const navigate = useNavigate();
  const { id } = useParams();
  const { tenant } = useContext(TenantContext);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const customer = await fetchCustomer(id);
        console.log("Loaded customer:", customer);
        setCustomerName(customer.name);
        setForm({
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || ""
        });
      } catch (err) {
        console.error("Error loading customer:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomer();
  }, [id, tenant.id]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateCustomer(id, {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null
      });
      navigate("/customers");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h2 className="text-xl mb-2">Edit Customer</h2>
      {customerName && <p className="text-gray-600 text-sm mb-4">Editing: <strong>{customerName}</strong></p>}
      <ErrorBox error={error} />
      <form onSubmit={submit} className="space-y-3 max-w-md bg-white rounded shadow p-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name <span className="text-red-500">*</span></label>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email <span className="text-gray-500 text-xs">(optional)</span></label>
          <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone <span className="text-gray-500 text-xs">(optional)</span></label>
          <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate("/customers")} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

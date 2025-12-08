// src/pages/orders/OrderCreate.jsx
import React, { useEffect, useState, useContext } from "react";
import { fetchProducts } from "../../api/productApi";
import { fetchCustomers } from "../../api/customerApi";
import { createOrder } from "../../api/orderApi";
import Loading from "../../components/Loading";
import ErrorBox from "../../components/ErrorBox";
import { useNavigate } from "react-router-dom";
import { TenantContext } from "../../context/TenantContext";

export default function OrderCreate(){
  const { tenant, tenantChangeCount } = useContext(TenantContext);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [useExisting, setUseExisting] = useState(true);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const navigate = useNavigate();

  const loadLists = async () => {
    setLoading(true);
    setError(null);
    try {
      // try to get more items in one page (per_page) so selects have many options
      const { items: pItems } = await fetchProducts({ per_page: 100 });
      const { items: cItems } = await fetchCustomers({ per_page: 100 });
      setProducts(pItems || []);
      setCustomers(cItems || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    loadLists();
  }, [tenant.id, tenantChangeCount]);

  const addRow = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const updateRow = (idx, key, value) => {
    const copy = [...items];
    copy[idx][key] = key === "quantity" ? parseInt(value || 0, 10) : value;
    setItems(copy);
  };
  const removeRow = (idx) => setItems(items.filter((_,i)=>i!==idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try{
      // Get the customer data based on selection method
      let customerData = {};
      
      if (useExisting && customerId) {
        // Using existing customer
        const selected = customers.find(c => c.id === customerId);
        if (selected) {
          customerData = {
            name: selected.name,
            email: selected.email || null,
            phone: selected.phone || null,
          };
        }
      } else if (!useExisting) {
        // Creating new customer with inline details
        customerData = {
          name: newCustomer.name,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
        };
      }
      // If neither selected, customerData remains empty (default "Customer")

      const payload = {
        customer: customerData,
        items: items.map(it => ({ product_id: it.product_id, quantity: it.quantity }))
      };
      await createOrder(payload);
      navigate(`/orders`);
    }catch(err){
      setError(err);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div>
      <h2 className="text-xl mb-3">Create Order</h2>
      <ErrorBox error={error} />
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded shadow p-6">
        
        {/* Customer Selection Section */}
        <div className="border-b pb-4">
          <label className="block text-sm font-medium mb-3">Customer</label>
          
          {/* Toggle between existing and new */}
          <div className="flex gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                checked={useExisting} 
                onChange={() => setUseExisting(true)}
                className="mr-2"
              />
              <span>Select existing customer</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                checked={!useExisting} 
                onChange={() => setUseExisting(false)}
                className="mr-2"
              />
              <span>Create new customer</span>
            </label>
          </div>

          {/* Existing Customer Selection */}
          {useExisting && (
            <select 
              value={customerId} 
              onChange={e => setCustomerId(e.target.value)} 
              className="border border-gray-300 p-2 rounded w-full max-w-md"
            >
              <option value="">-- No customer / Default --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email || "no email"})</option>)}
            </select>
          )}

          {/* New Customer Form */}
          {!useExisting && (
            <div className="space-y-3 bg-gray-50 p-4 rounded max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                  required={!useExisting}
                  type="text"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email <span className="text-gray-500 text-xs">(optional)</span></label>
                <input 
                  type="email"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone <span className="text-gray-500 text-xs">(optional)</span></label>
                <input 
                  type="tel"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Items <span className="text-red-500">*</span></label>
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2">
              <select className="flex-1 border border-gray-300 p-2 rounded" value={it.product_id} onChange={e=>updateRow(idx,"product_id",e.target.value)}>
                <option value="">-- select product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
              </select>
              <input type="number" min="1" className="w-24 border border-gray-300 p-2 rounded" value={it.quantity} onChange={e=>updateRow(idx,"quantity",e.target.value)} />
              <button type="button" onClick={()=>removeRow(idx)} className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">x</button>
            </div>
          ))}
          <button type="button" onClick={addRow} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">+ Add item</button>
        </div>

        {/* Submit Section */}
        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Order</button>
          <button type="button" onClick={() => navigate("/orders")} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </form>
    </div>
  );
}

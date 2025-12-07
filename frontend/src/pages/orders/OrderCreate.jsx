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
  const { tenant } = useContext(TenantContext);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [customerId, setCustomerId] = useState("");
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
  }, [tenant.id]);

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
      const payload = {
        customer: customerId ? { id: customerId } : {},
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Customer (optional)</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="border p-2 rounded w-full max-w-md">
            <option value="">-- New customer (created automatically) --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Items</label>
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2">
              <select className="flex-1 border p-2 rounded" value={it.product_id} onChange={e=>updateRow(idx,"product_id",e.target.value)}>
                <option value="">-- select product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
              </select>
              <input type="number" min="1" className="w-24 border p-2 rounded" value={it.quantity} onChange={e=>updateRow(idx,"quantity",e.target.value)} />
              <button type="button" onClick={()=>removeRow(idx)} className="bg-red-500 text-white px-2 rounded">x</button>
            </div>
          ))}
          <button type="button" onClick={addRow} className="bg-gray-200 px-3 py-1 rounded">Add item</button>
        </div>

        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Order</button>
        </div>
      </form>
    </div>
  );
}

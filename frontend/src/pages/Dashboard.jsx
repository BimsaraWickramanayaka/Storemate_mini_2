// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { fetchProducts } from "../api/productApi";
import { fetchOrders } from "../api/orderApi";
import { fetchCustomers } from "../api/customerApi";
import { fetchStocks } from "../api/stockApi";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { TenantContext } from "../context/TenantContext";

export default function Dashboard(){
  const { tenant } = useContext(TenantContext);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [counts,setCounts]=useState({products:0,orders:0,customers:0,stock:0});
  const [chartData,setChartData]=useState([]);

  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ items: pItems, meta: pMeta }, { items: oItems, meta: oMeta }, { items: cItems, meta: cMeta }, { items: sItems, meta: sMeta }] = await Promise.all([
          fetchProducts({ per_page: 10 }),
          fetchOrders({ per_page: 10 }),
          fetchCustomers({ per_page: 10 }),
          fetchStocks({ per_page: 10 })
        ]);

        const totalProducts = pMeta?.total ?? (pItems?.length ?? 0);
        const totalOrders = oMeta?.total ?? (oItems?.length ?? 0);
        const totalCustomers = cMeta?.total ?? (cItems?.length ?? 0);
        const totalStock = (sMeta?.total ? null : (sItems?.reduce((acc,b)=>acc+(b.quantity||0),0))) ?? (sItems?.reduce((acc,b)=>acc+(b.quantity||0),0) || 0);

        setCounts({
          products: totalProducts,
          orders: totalOrders,
          customers: totalCustomers,
          stock: totalStock
        });

        // Simple demo chart: recent orders sample
        const sample = (oItems || []).slice(-7).map((ord, i)=>({ name: `#${i+1}`, orders: 1 }));
        setChartData(sample);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (tenant) {
      load();
    }
  }, [tenant?.id]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div>
      <h2 className="text-2xl mb-4">Dashboard</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Products: <strong>{counts.products}</strong></div>
        <div className="bg-white p-4 rounded shadow">Orders: <strong>{counts.orders}</strong></div>
        <div className="bg-white p-4 rounded shadow">Customers: <strong>{counts.customers}</strong></div>
        <div className="bg-white p-4 rounded shadow">Total Stock: <strong>{counts.stock}</strong></div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2">Recent Orders (sample chart)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

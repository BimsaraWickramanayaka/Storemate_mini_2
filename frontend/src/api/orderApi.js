// src/api/orderApi.js
import client from "./axiosClient";
import { extractList } from "./_helpers";

export const getOrders = (params = {}) => client.get("/orders", { params });
export const getOrder = (id) => client.get(`/orders/${id}`);
export const createOrder = (payload) => client.post("/orders", payload);

// convenience wrapper
export async function fetchOrders(params = {}) {
  const res = await getOrders(params);
  return extractList(res);
}

export { extractList as extractOrderList };

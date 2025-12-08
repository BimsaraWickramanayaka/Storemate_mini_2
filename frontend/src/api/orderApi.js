// src/api/orderApi.js
import client from "./axiosClient";
import { extractList } from "./_helpers";

// Basic CRUD
export const getOrders = (params = {}) => client.get("/orders", { params });
export const getOrder = (id) => client.get(`/orders/${id}`);
export const createOrder = (payload) => client.post("/orders", payload);

// Order workflow - new endpoints
export const confirmOrder = (id) => client.post(`/orders/${id}/confirm`, {});
export const cancelOrder = (id) => client.post(`/orders/${id}/cancel`, {});
export const deleteOrder = (id) => client.delete(`/orders/${id}`);

// convenience wrapper
export async function fetchOrders(params = {}) {
  const res = await getOrders(params);
  return extractList(res);
}

export { extractList as extractOrderList };

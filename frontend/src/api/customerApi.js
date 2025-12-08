// src/api/customerApi.js
import client from "./axiosClient";
import { extractList } from "./_helpers";

export const getCustomers = (params = {}) => client.get("/customers", { params });
export const getCustomer = (id) => client.get(`/customers/${id}`);
export const createCustomer = (payload) => client.post("/customers", payload);
export const updateCustomer = (id, payload) => client.put(`/customers/${id}`, payload);
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);

// convenience wrapper
export async function fetchCustomers(params = {}) {
  const res = await getCustomers(params);
  return extractList(res);
}

// Fetch single customer and return data directly
export async function fetchCustomer(id) {
  const res = await getCustomer(id);
  return res.data || res;
}

export { extractList as extractCustomerList };

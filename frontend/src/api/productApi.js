// src/api/productApi.js
import client from "./axiosClient";
import { extractList } from "./_helpers";

/**
 * Note:
 * - getProducts returns the raw axios response so you can access headers/meta if needed.
 * - Use extractList(response) to get { items, meta } normalized for paginated and non-paginated responses.
 */

// Basic CRUD
export const getProducts = (params = {}) => client.get("/products", { params });
export const getProduct = (id) => client.get(`/products/${id}`);
export const createProduct = (payload) => client.post("/products", payload);
export const updateProduct = (id, payload) => client.put(`/products/${id}`, payload);
export const deleteProduct = (id) => client.delete(`/products/${id}`);

// convenience wrapper to fetch and return items + meta directly (optional)
export async function fetchProducts(params = {}) {
  const res = await getProducts(params);
  return extractList(res);
}

// Fetch single product and return data directly
export async function fetchProduct(id) {
  const res = await getProduct(id);
  return res.data || res;
}

export { extractList as extractProductList };

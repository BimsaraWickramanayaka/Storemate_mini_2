// src/api/productApi.js
import client from "./axiosClient";
import { extractList } from "./_helpers";

/**
 * Note:
 * - getProducts returns the raw axios response so you can access headers/meta if needed.
 * - Use extractList(response) to get { items, meta } normalized for paginated and non-paginated responses.
 */

export const getProducts = (params = {}) => client.get("/products", { params });
export const getProduct = (id) => client.get(`/products/${id}`);
export const createProduct = (payload) => client.post("/products", payload);

// convenience wrapper to fetch and return items + meta directly (optional)
export async function fetchProducts(params = {}) {
  const res = await getProducts(params);
  return extractList(res);
}

export { extractList as extractProductList };

// src/api/stockApi.js
import client from "./axiosClient";
import { extractList } from "./_helpers";

export const getStocks = (params = {}) => client.get("/stocks", { params });
export const getStock = (id) => client.get(`/stocks/${id}`);
export const createStock = (payload) => client.post("/stocks", payload);
export const deleteStock = (id) => client.delete(`/stocks/${id}`);

// convenience wrapper
export async function fetchStocks(params = {}) {
  const res = await getStocks(params);
  return extractList(res);
}

export { extractList as extractStockList };

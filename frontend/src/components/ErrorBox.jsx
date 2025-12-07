// src/components/ErrorBox.jsx
export default function ErrorBox({ error }) {
  if (!error) return null;
  const msg = error?.response?.data?.message || error?.response?.data || error?.message || "Unknown error";
  // If error.response.data is an object, stringify a bit
  const display = typeof msg === "object" ? JSON.stringify(msg) : msg;
  return <div className="bg-red-100 text-red-800 p-3 rounded my-2">{display}</div>;
}

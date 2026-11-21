import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "Something went wrong";
    return Promise.reject(
      Object.assign(new Error(Array.isArray(message) ? message.join(", ") : String(message)), {
        status: error.response?.status,
        data: error.response?.data,
      }),
    );
  },
);

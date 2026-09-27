import axios, { AxiosError } from "axios";

const client = axios.create({
  baseURL:
    (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
      ?.VITE_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.detail ??
      error.message ??
      "Erro inesperado ao comunicar com o servidor.";

    return Promise.reject(new Error(message));
  }
);

export default client;
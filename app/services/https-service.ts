import axios, { AxiosInstance, AxiosResponse } from "axios";

import Constants from "expo-constants";
const BASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_URL || process.env.EXPO_PUBLIC_BASE_URL || "";

export interface HttpOptions {
  token?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  /** When true, skip the request and throw 404 so caller can treat 4XX as success (e.g. dummy save). */
  dummySuccess?: boolean;
}

export interface HttpError {
  status?: number;
  message: string;
}

/** Thrown by http* functions; has message and optional status. */
export function toHttpError(error: unknown): Error & { status?: number } {
  const { status, message } = handleHttpError(error);
  const err = new Error(message) as Error & { status?: number };
  err.status = status;
  return err;
}

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Log all requests
http.interceptors.request.use(
  (config) => {
    console.log("[HTTP REQUEST]", {
      method: config.method,
      url: (config.baseURL ?? "") + (config.url ?? ""),
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.log("[HTTP REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// Log all responses
http.interceptors.response.use(
  (response) => {
    console.log("[HTTP RESPONSE]", {
      url: (response.config.baseURL ?? "") + (response.config.url ?? ""),
      status: response.status,
      data: JSON.stringify(response.data),
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.log("[HTTP RESPONSE ERROR]", {
        url: (error.response.config.baseURL ?? "") + (error.response.config.url ?? ""),
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.log("[HTTP RESPONSE ERROR]", error);
    }
    return Promise.reject(error);
  }
);

const attachAuth = (headers: Record<string, string> = {}, token?: string) => {
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
};

const handleHttpError = (error: unknown): HttpError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "HTTP Error";
    return { status, message };
  }
  return { message: "Unknown error" };
};

export const httpGet = async <T = any>(url: string, options: HttpOptions = {}): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await http.get(url, {
      params: options.params,
      headers: attachAuth(options.headers, options.token),
    });
    return response.data;
  } catch (error) {
    throw toHttpError(error);
  }
};

export const httpPost = async <T = any>(
  url: string,
  data?: any,
  options: HttpOptions = {}
): Promise<T> => {
  if (options.dummySuccess) {
    const err = new Error("Not Found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  try {
    const response: AxiosResponse<T> = await http.post(url, data, {
      headers: attachAuth(options.headers, options.token),
    });
    return response.data;
  } catch (error) {
    throw toHttpError(error);
  }
};

export const httpPatch = async <T = any>(
  url: string,
  data?: any,
  options: HttpOptions = {}
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await http.patch(url, data, {
      headers: attachAuth(options.headers, options.token),
    });
    return response.data;
  } catch (error) {
    throw toHttpError(error);
  }
};

export const httpDelete = async <T = any>(url: string, options: HttpOptions = {}): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await http.delete(url, {
      data: options.data,
      headers: attachAuth(options.headers, options.token),
    });
    return response.data;
  } catch (error) {
    throw toHttpError(error);
  }
};

export { http };

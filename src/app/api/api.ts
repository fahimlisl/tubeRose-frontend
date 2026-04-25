const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: Record<string, any> | FormData;
  headers?: Record<string, string>;
  authContext?: "user" | "admin";
}

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

let isRefreshing = false;

export const request = async <T = any>(
  endpoint: string,
  options: RequestOptions = {},
  retry = true,
): Promise<ApiResponse<T>> => {
  const { method = "GET", body, headers = {}, authContext = "user" } = options;

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: { ...headers },
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
      config.body = JSON.stringify(body);
    }
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    const contentType = res.headers.get("content-type") ?? "";
    let data: any;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error(
        `Expected JSON but got ${contentType || "unknown"} (status ${res.status})`
      );
    }

    if (res.status === 401 && retry && !isRefreshing) {
      isRefreshing = true;
      const refreshEndpoint =
        authContext === "admin"
          ? `${BASE_URL}/admin/refresh/access-token`
          : `${BASE_URL}/user/refresh/access-token`;

      try {
        const refreshRes = await fetch(refreshEndpoint, {
          method: "POST",
          credentials: "include",
        });

        isRefreshing = false;

        if (!refreshRes.ok) throw new Error("Refresh failed");

        return request(endpoint, options, false); 
      } catch {
        isRefreshing = false;
        window.location.href =
          authContext === "admin" ? "/auth/admin" : "/auth";

        throw new Error("Session expired, please login again.");
      }
    }

    if (!res.ok) {
      throw new Error(data?.message ?? `HTTP ${res.status}: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};
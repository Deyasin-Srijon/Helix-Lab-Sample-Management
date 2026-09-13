import { API_BASE_URL } from "../utils/constants";

export const defaultFetchOptions = {
  credentials: "include",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

export function buildUrl(path) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export async function request(path, options = {}) {
  const {
    notifyOnBackendUnavailable = false,
    headers,
    ...rest
  } = options;

  let response;

  try {
    response = await fetch(buildUrl(path), {
      ...defaultFetchOptions,
      ...rest,
      credentials: "include",
      headers: {
        ...defaultFetchOptions.headers,
        ...headers,
      },
    });
  } catch {
    if (
      notifyOnBackendUnavailable &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(
        new CustomEvent("backend:unavailable")
      );
    }

    return {
      success: false,
      error:
        "We couldn't complete your request right now. Please try again later.",
      status: 0,
      data: null,
    };
  }

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();

      if (text) {
        data = text;
      }
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const serverError =
      response.status >= 500 &&
      response.status <= 599;

    if (serverError) {
      return {
        success: false,
        error:
          "We couldn't complete your request right now. Please try again later.",
        status: response.status,
        data,
      };
    }

    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      "We couldn't complete your request right now. Please try again later.";

    return {
      success: false,
      error: message,
      status: response.status,
      data,
    };
  }

  return {
    success: true,
    status: response.status,
    data,
  };
}
/**
 * Centralized API client for all backend communication.
 * Handles base URLs, Auth headers (Bearer tokens), and JSON serialization.
 */

const API_HOST = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://zone-out.onrender.com");

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
    const isExternal = endpoint.startsWith("http");
    let url = endpoint;
    let headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (!isExternal) {
        // Ensure endpoint starts with /api
        const cleanPath = endpoint.startsWith("/api") ? endpoint : `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
        url = `${API_HOST}${cleanPath}`;
        // Only internal requests get the auth token
        headers = { ...headers, ...getAuthHeaders() };
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMsg = "API Request Failed";
        try {
            const data = await response.json();
            errorMsg = data.message || data.error || errorMsg;
        } catch (e) {
            errorMsg = response.statusText || `HTTP ${response.status}`;
        }

        if (response.status === 401 && !isExternal) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/") window.location.href = "/";
        }

        throw new Error(`${response.status}: ${errorMsg}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const api = {
    get: (endpoint, options) => request(endpoint, { ...options, method: "GET" }),
    post: (endpoint, body, options) => request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    put: (endpoint, body, options) => request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: "DELETE" }),
};

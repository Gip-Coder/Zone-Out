/**
 * Centralized API client for all backend communication.
 * Handles base URLs, Auth headers (Bearer tokens), and JSON serialization.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : (import.meta.env.DEV ? "http://localhost:5000/api" : "https://zone-out.onrender.com/api");
console.log("API_BASE:", API_BASE);
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    console.log("[DEBUG] Current Token:", token ? `${token.substring(0, 10)}...` : "MISSING");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log("[DEBUG] Auth Headers:", headers);
    return headers;
}

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });
    console.log(`[DEBUG] Request to ${url} returned status: ${response.status}`);

    // Handle standard HTTP errors
    if (!response.ok) {
        let errorMsg = "API Request Failed";
        try {
            const data = await response.json();
            errorMsg = data.message || data.error || errorMsg;
        } catch (e) {
            // if not json, just use status text
            errorMsg = response.statusText || `HTTP ${response.status}`;
        }

        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Avoid redirect loops — only redirect if not already on login
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }

        throw new Error(`${response.status}: ${errorMsg}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const api = {
    get: (endpoint, options) => request(endpoint, { ...options, method: "GET" }),
    post: (endpoint, body, options) => request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    put: (endpoint, body, options) => request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: "DELETE" }),
};

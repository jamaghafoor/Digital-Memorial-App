const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const accessToken = () => localStorage.getItem("memory-card-access-token");
const isNgrokApi = /\.ngrok(?:-free)?\.app(?:\/|$)/i.test(API_URL);

console.log("API_URL", API_URL);

export const saveSession = ({ accessToken: access, refreshToken, user }) => {
  localStorage.setItem("memory-card-access-token", access);
  localStorage.setItem("memory-card-refresh-token", refreshToken);
  localStorage.setItem("memory-card-user", JSON.stringify(user));
};
export const clearSession = () =>
  [
    "memory-card-access-token",
    "memory-card-refresh-token",
    "memory-card-user",
  ].forEach((key) => localStorage.removeItem(key));
export const readSessionUser = () => {
  try {
    return JSON.parse(localStorage.getItem("memory-card-user"));
  } catch {
    return null;
  }
};

export async function api(path, options = {}, retry = true) {
  const headers = {
    ...(options.body && { "Content-Type": "application/json" }),
    ...options.headers,
    ...(accessToken() && { Authorization: `Bearer ${accessToken()}` }),
    // ngrok's browser-warning page can replace API responses unless this header
    // is present. It is harmless for local and non-ngrok API URLs.
    ...(isNgrokApi && { "ngrok-skip-browser-warning": "true" }),
  };
  let response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (
    response.status === 401 &&
    retry &&
    localStorage.getItem("memory-card-refresh-token")
  ) {
    const refresh = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: localStorage.getItem("memory-card-refresh-token"),
      }),
    });
    if (refresh.ok) {
      saveSession(await refresh.json());
      return api(path, options, false);
    }
    clearSession();
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

export { API_URL };

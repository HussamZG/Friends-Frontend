const FALLBACK_URL = "https://friends-backend-oqhk.onrender.com";
const API_URL = import.meta.env.VITE_API_URL || FALLBACK_URL;
const SOCKET_URL = import.meta.env.VITE_API_URL || FALLBACK_URL;

export { API_URL, SOCKET_URL };

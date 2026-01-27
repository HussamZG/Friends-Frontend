const PROD_URL = "https://friends-backend-oqhk.onrender.com";
const LOCAL_URL = "http://localhost:5000";

const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL = import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')
    ? import.meta.env.VITE_API_URL
    : (isLocalhost ? LOCAL_URL : PROD_URL);

const SOCKET_URL = API_URL;



export { API_URL, SOCKET_URL };

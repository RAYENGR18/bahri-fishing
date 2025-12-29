import axios from 'axios';

const client = axios.create({
    // BACKEND (local ou prod)
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

    // ❌ IMPORTANT : avec JWT on NE DOIT PAS envoyer de cookies
    withCredentials: false,
});

// =========================
// INTERCEPTEUR JWT
// =========================
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        // ✅ On ajoute Authorization SEULEMENT si le token existe
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // 🔥 TRÈS IMPORTANT
            // Supprimer Authorization si absent (évite 403 sur routes publiques)
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =========================
// GESTION DES ERREURS
// =========================
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;

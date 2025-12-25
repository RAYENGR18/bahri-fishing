import axios from 'axios';

const client = axios.create({
    // C'est cette ligne qui fait le travail intelligent
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

// --- L'INTERCEPTEUR : GESTION DU TOKEN ---
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- GESTION DES ERREURS ---
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expiré ou invalide -> On déconnecte proprement
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
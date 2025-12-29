import axios from 'axios';

const client = axios.create({
    // LOGIQUE IMPORTANTE :
    // 1. En PROD (Vercel) : Il utilisera la variable d'environnement VITE_API_URL
    // 2. En LOCAL : Il utilisera http://127.0.0.1:8000 (Le port par défaut de Django)
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000', 
    
    headers: {
        'Content-Type': 'application/json',
        // Django a parfois besoin de ça pour accepter les requêtes JSON
        'Accept': 'application/json', 
    },
    // Important pour que les cookies/sessions passent si besoin (optionnel avec JWT pur mais recommandé)
    withCredentials: true 
});

// --- L'INTERCEPTEUR : GESTION DU TOKEN ---
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Django SimpleJWT attend souvent "Bearer <token>"
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
            // Token expiré ou invalide
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // On redirige vers le login uniquement si on n'y est pas déjà
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
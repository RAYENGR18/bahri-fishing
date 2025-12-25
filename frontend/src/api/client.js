import axios from 'axios';

const client = axios.create({
    // L'adresse de votre API Django
    // (J'ai ajouté le support pour Vercel ici au passage pour plus tard)
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    
    // ❌ ON A SUPPRIMÉ LES HEADERS ICI !
    // Axios détectera tout seul si c'est du JSON ou un Fichier.
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
    (error) => {
        return Promise.reject(error);
    }
);

// --- GESTION DES ERREURS (Déconnexion si token invalide) ---
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expiré ou invalide -> On nettoie tout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optionnel : Rediriger vers login
             window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
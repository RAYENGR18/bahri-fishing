import axios from 'axios';

const client = axios.create({
    // MODIFICATION IMPORTANTE :
    // 1. Si une variable VITE_API_URL existe (ex: en local), on l'utilise.
    // 2. Sinon (sur Vercel), on utilise le chemin relatif '/api'.
    // Cela signifie que client.post('/users/...') deviendra 'https://ton-site.vercel.app/api/users/...'
    baseURL: import.meta.env.VITE_API_URL || '/api',
    
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- L'INTERCEPTEUR : GESTION DU TOKEN (Rien à changer ici, c'est parfait) ---
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
            // Si tu stockes d'autres infos user, supprime-les aussi
            // localStorage.removeItem('user'); 
            
            // Redirection forcée vers le login
            // Note : Ceci recharge la page, ce qui est acceptable pour une déconnexion de sécurité
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
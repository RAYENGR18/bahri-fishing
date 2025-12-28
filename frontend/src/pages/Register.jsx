import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { GoogleLogin } from '@react-oauth/google'; // <-- 1. Import Google

const Register = () => {
    // État pour les champs du formulaire classique
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '',
        phone: '', address: '', city: ''
    });
    
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- Gestionnaire pour Google ---
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            // On envoie le token Google à notre backend
            const res = await client.post('/users/google-login/', {
                token: credentialResponse.credential
            });

            if (res.data.tokens) {
                // Stockage du token
                localStorage.setItem('token', res.data.tokens.access);
                
                // Redirection vers l'accueil (on force le rechargement pour mettre à jour l'état Auth)
                window.location.href = '/'; 
            }
        } catch (err) {
            console.error("Erreur Google:", err);
            setError("Échec de l'inscription via Google.");
        }
    };

    // --- Gestionnaire pour le formulaire classique ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Inscription
            await client.post('/users/register/', formData);
            
            // 2. Connexion automatique après inscription
            await login(formData.email, formData.password);
            
            // 3. Redirection
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.email ? "Cet email est déjà utilisé." : "Erreur lors de l'inscription. Vérifiez vos données.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Créer un compte</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                {/* --- SECTION GOOGLE --- */}
                <div className="mb-6 flex justify-center">
                     <GoogleLogin 
                        text="signup_with" // Affiche "S'inscrire avec Google"
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Échec de la connexion Google")}
                        width="300" // Ajuste la largeur si besoin
                     />
                </div>

                {/* Séparateur visuel */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Ou avec votre email</span>
                    </div>
                </div>

                {/* --- FORMULAIRE CLASSIQUE --- */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="first_name" placeholder="Prénom" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                        <input name="last_name" placeholder="Nom" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                    </div>
                    
                    <input name="email" type="email" placeholder="Email" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                    <input name="password" type="password" placeholder="Mot de passe" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />

                    {/* Champs supplémentaires requis */}
                    <input name="phone" placeholder="Téléphone (ex: 22 333 444)" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                    <input name="address" placeholder="Adresse complète" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                    <input name="city" placeholder="Ville / Gouvernorat" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                    
                    <button type="submit" className="w-full bg-bahri-blue text-white py-3 rounded font-bold hover:bg-opacity-90 transition transform active:scale-95">
                        S'inscrire & Gagner des points
                    </button>
                </form>
                
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-bahri-blue hover:underline text-sm">Déjà un compte ? Se connecter</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
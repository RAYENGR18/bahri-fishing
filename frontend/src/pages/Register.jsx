import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '',
        phone: '', address: '', city: ''
    });
    
    const [error, setError] = useState('');
    const { loginWithGoogle } = useContext(AuthContext); // 🔥 CORRECTION : utilise loginWithGoogle
    const navigate = useNavigate();

    // ================= GOOGLE REGISTER (🔥 CORRIGÉ) =================
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            // 🔥 CORRECTION 1 : Envoie 'credential', pas 'token'
            const res = await client.post('/users/google-login/', {
                credential: credentialResponse.credential
            });

            const { user, tokens } = res.data;

            // 🔥 CORRECTION 2 : Utilise loginWithGoogle du contexte
            loginWithGoogle(user, tokens);

            // Redirection
            navigate('/');
        } catch (err) {
            console.error("❌ Erreur Google:", err);
            console.error("Détails:", err.response?.data);
            setError(err.response?.data?.error || "Échec de l'inscription via Google.");
        }
    };

    // ================= INSCRIPTION CLASSIQUE =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Inscription
            const response = await client.post('/users/register/', formData);
            
            // 2. Connexion automatique après inscription
            const { user, tokens } = response.data;
            loginWithGoogle(user, tokens);
            
            // 3. Redirection
            navigate('/');
        } catch (err) {
            console.error("❌ Erreur inscription:", err);
            setError(
                err.response?.data?.email 
                    ? "Cet email est déjà utilisé." 
                    : "Erreur lors de l'inscription. Vérifiez vos données."
            );
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Créer un compte</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Rejoignez notre programme de fidélité
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* ===== GOOGLE SIGNUP ===== */}
                <div className="mb-6 flex justify-center">
                    <GoogleLogin 
                        text="signup_with"
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.error("❌ Échec Google Signup");
                            setError("Échec de la connexion Google");
                        }}
                        width="300"
                    />
                </div>

                {/* ===== SEPARATOR ===== */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Ou avec votre email
                        </span>
                    </div>
                </div>

                {/* ===== FORMULAIRE CLASSIQUE ===== */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            name="first_name" 
                            placeholder="Prénom" 
                            required 
                            className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" 
                            onChange={handleChange} 
                        />
                        <input 
                            name="last_name" 
                            placeholder="Nom" 
                            required 
                            className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <input 
                        name="email" 
                        type="email" 
                        placeholder="Email" 
                        required 
                        className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" 
                        onChange={handleChange} 
                    />
                    
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Mot de passe (min. 8 caractères)" 
                        required 
                        minLength="8"
                        className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" 
                        onChange={handleChange} 
                    />

                    <input 
                        name="phone" 
                        placeholder="Téléphone (ex: 22 333 444)" 
                        required 
                        className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" 
                        onChange={handleChange} 
                    />
                    
                    <input 
                        name="address" 
                        placeholder="Adresse complète" 
                        required 
                        className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" 
                        onChange={handleChange} 
                    />
                    
                    <input 
                        name="city" 
                        placeholder="Ville / Gouvernorat" 
                        required 
                        className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" 
                        onChange={handleChange} 
                    />
                    
                    <button 
                        type="submit" 
                        className="w-full bg-bahri-blue text-white py-3 rounded font-bold hover:bg-opacity-90 transition transform active:scale-95"
                    >
                        S'inscrire & Gagner des points
                    </button>
                </form>
                
                <div className="mt-6 text-center text-sm">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-bahri-blue font-medium hover:underline">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
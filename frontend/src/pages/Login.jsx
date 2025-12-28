import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client'; // <-- Import API
import { GoogleLogin } from '@react-oauth/google'; // <-- Import Google

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- Gestionnaire Connexion Google ---
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            // On envoie le token Google au Backend
            const res = await client.post('/users/google-login', {
                token: credentialResponse.credential
            });

            if (res.data.tokens) {
                // On stocke le token
                localStorage.setItem('token', res.data.tokens.access);
                
                // On redirige vers l'accueil (rechargement pour mettre à jour l'AuthContext)
                window.location.href = '/'; 
            }
        } catch (err) {
            console.error("Erreur Google:", err);
            setError("Échec de la connexion Google.");
        }
    };

    // --- Gestionnaire Connexion Classique ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const result = await login(email, password);
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Connexion</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Accédez à votre espace fidélité
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                    </div>
                )}

                {/* --- SECTION GOOGLE --- */}
                <div className="mt-6 flex justify-center">
                    <GoogleLogin 
                        text="signin_with" // Affiche "Se connecter avec Google"
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Échec de la connexion Google")}
                        width="300"
                    />
                </div>

                {/* Séparateur */}
                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Ou avec votre email</span>
                    </div>
                </div>

                {/* --- FORMULAIRE CLASSIQUE --- */}
                <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-bahri-blue focus:border-bahri-blue focus:z-10 sm:text-sm"
                                placeholder="Adresse Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-bahri-blue focus:border-bahri-blue focus:z-10 sm:text-sm"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-bahri-blue hover:text-opacity-80">
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bahri-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bahri-blue"
                        >
                            Se connecter
                        </button>
                    </div>
                </form>
                
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="font-medium text-bahri-blue hover:text-opacity-80">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
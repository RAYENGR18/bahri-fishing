import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login, loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    // ================= GOOGLE LOGIN (🔥 CORRIGÉ) =================
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            // 🔥 CORRECTION : Envoie 'credential', pas 'token'
            const res = await client.post('/users/google-login/', {
                credential: credentialResponse.credential
            });

            const { user, tokens } = res.data;

            // Mise à jour du contexte
            loginWithGoogle(user, tokens);

            // Redirection
            navigate('/');
        } catch (err) {
            console.error("❌ Erreur Google:", err);
            console.error("Détails:", err.response?.data);
            setError(err.response?.data?.error || "Échec de la connexion Google");
        }
    };

    // ================= LOGIN CLASSIQUE =================
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
                    <h2 className="text-3xl font-extrabold text-gray-900">Connexion</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Accédez à votre espace fidélité
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                    </div>
                )}

                {/* ===== GOOGLE ===== */}
                <div className="flex justify-center mt-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.error("❌ Échec Google Login");
                            setError("Échec de la connexion Google");
                        }}
                    />
                </div>

                {/* ===== SEPARATOR ===== */}
                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Ou avec votre email
                        </span>
                    </div>
                </div>

                {/* ===== LOGIN EMAIL ===== */}
                <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <input
                            type="email"
                            required
                            className="block w-full px-3 py-2 border rounded-t-md focus:ring-bahri-blue"
                            placeholder="Adresse Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="block w-full px-3 py-2 border rounded-b-md focus:ring-bahri-blue"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end text-sm">
                        <Link to="/forgot-password" className="text-bahri-blue">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-bahri-blue text-white rounded-md font-semibold"
                    >
                        Se connecter
                    </button>
                </form>

                <div className="text-center mt-4 text-sm">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-bahri-blue font-medium">
                        Créer un compte
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
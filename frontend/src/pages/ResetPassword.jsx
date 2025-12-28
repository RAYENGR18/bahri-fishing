import React, { useState } from 'react';
import client from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // On récupère l'email s'il a été passé par la page précédente
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            await client.post('/users/reset-password/', {
                email,
                code,
                new_password: newPassword
            });
            setMessage('Mot de passe modifié avec succès !');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Code invalide ou erreur.");
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Nouveau mot de passe</h2>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            required
                            placeholder="Confirmez votre email"
                            className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-bahri-blue"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            required
                            placeholder="Code reçu par email (6 chiffres)"
                            maxLength="6"
                            className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-bahri-blue"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            required
                            placeholder="Nouveau mot de passe"
                            className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-bahri-blue"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 rounded text-white bg-bahri-blue hover:bg-opacity-90 font-medium"
                    >
                        Valider le changement
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
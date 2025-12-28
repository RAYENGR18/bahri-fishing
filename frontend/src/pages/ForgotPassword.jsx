import React, { useState } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Appel à l'endpoint Django créé précédemment
            await client.post('/users/forgot-password/', { email });
            setMessage('Code envoyé ! Vérifiez votre email.');
            
            // Après 2 secondes, on redirige vers la page de reset
            setTimeout(() => {
                navigate('/reset-password', { state: { email } }); // On passe l'email pour pré-remplir
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors de l'envoi du code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Réinitialiser le mot de passe</h2>
                
                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Votre Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-bahri-blue focus:border-bahri-blue outline-none"
                            placeholder="exemple@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bahri-blue hover:bg-opacity-90 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
import React, { useState } from 'react';
import client from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // ÉTATS
    const [step, setStep] = useState(1); // 1 = Vérif Code, 2 = Nouveau MDP
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    
    // Champs mot de passe
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Messages
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- ÉTAPE 1 : VÉRIFIER LE CODE ---
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // On appelle la nouvelle route backend pour vérifier le code
            await client.post('/users/verify-code/', { email, code });
            // Si c'est bon, on passe à l'étape 2
            setStep(2);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || "Code invalide.");
        } finally {
            setLoading(false);
        }
    };

    // --- ÉTAPE 2 : CHANGER LE MOT DE PASSE ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // 1. Vérifier que les mots de passe correspondent
        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas !");
            return;
        }

        if (newPassword.length < 6) {
            setError("Le mot de passe doit faire au moins 6 caractères.");
            return;
        }

        setLoading(true);

        try {
            // On envoie le tout pour le changement final
            await client.post('/users/reset-password/', {
                email,
                code,
                new_password: newPassword
            });
            setMessage('Mot de passe modifié avec succès ! Redirection...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors du changement de mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                    {step === 1 ? "Vérification du code" : "Nouveau mot de passe"}
                </h2>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                {/* --- FORMULAIRE ÉTAPE 1 : CODE --- */}
                {step === 1 && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                disabled={!!location.state?.email} // Désactivé si l'email vient de la page précédente
                                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Code de confirmation</label>
                            <input
                                type="text"
                                required
                                placeholder="Entrez le code à 6 chiffres"
                                maxLength="6"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-bahri-blue focus:border-bahri-blue outline-none text-center tracking-widest text-lg"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 rounded text-white bg-bahri-blue hover:bg-opacity-90 font-medium disabled:bg-gray-400"
                        >
                            {loading ? 'Vérification...' : 'Vérifier le code'}
                        </button>
                    </form>
                )}

                {/* --- FORMULAIRE ÉTAPE 2 : NOUVEAU MDP --- */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-bahri-blue focus:border-bahri-blue outline-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-bahri-blue focus:border-bahri-blue outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} // Mise à jour de la confirmation
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 rounded text-white bg-green-600 hover:bg-green-700 font-medium disabled:bg-gray-400"
                        >
                            {loading ? 'Modification...' : 'Changer le mot de passe'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
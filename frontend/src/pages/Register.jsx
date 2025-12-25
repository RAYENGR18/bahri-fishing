import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '',
        phone: '', address: '', city: '' // Nouveaux champs
    });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await client.post('/users/register/', formData);
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.email ? "Email déjà utilisé" : "Erreur lors de l'inscription");
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
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="first_name" placeholder="Prénom" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                        <input name="last_name" placeholder="Nom" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                    </div>
                    
                    <input name="email" type="email" placeholder="Email" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />
                    <input name="password" type="password" placeholder="Mot de passe" required className="p-3 border rounded w-full focus:ring-2 focus:ring-bahri-blue outline-none" onChange={handleChange} />

                    {/* Nouveaux Champs */}
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
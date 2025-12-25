import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { User, Save, MapPin, Phone } from 'lucide-react';

const Profile = () => {
    const { user, login } = useContext(AuthContext); // login utilisé ici pour rafraîchir le state global si besoin, ou on force un reload
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', phone: '', address: '', city: ''
    });
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || ''
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await client.put('/users/profile/update/', formData);
            // On met à jour le localStorage pour que la Navbar change tout de suite
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Note: Pour une mise à jour parfaite du contexte, un reload est le plus simple ici
            window.location.reload(); 
            
            setMsg({ type: 'success', text: 'Profil mis à jour avec succès !' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        }
    };

    if (!user) return <div className="text-center py-10">Connectez-vous pour voir votre profil.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <User size={32} className="text-bahri-blue"/> Mon Profil
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="mb-6 pb-6 border-b flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Points de fidélité</p>
                        <p className="text-3xl font-bold text-bahri-blue">{parseFloat(user.loyalty_points).toFixed(2)} pts</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Email (non modifiable)</p>
                        <p className="font-medium">{user.email}</p>
                    </div>
                </div>

                {msg.text && (
                    <div className={`p-3 rounded mb-4 text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Phone size={16}/> Téléphone</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><MapPin size={16}/> Adresse par défaut</label>
                            <input name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                            <input name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"/>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="bg-bahri-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 flex items-center gap-2">
                            <Save size={18} /> Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Profile;
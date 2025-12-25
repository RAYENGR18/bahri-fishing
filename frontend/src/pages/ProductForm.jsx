import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, CheckCircle, AlertCircle } from 'lucide-react'; // Ajout d'icônes pour le message

const ProductForm = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState('');

    // 👇 NOUVEAU : État pour gérer les messages de succès/erreur dans la page
    const [notification, setNotification] = useState({ type: '', message: '' });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        stock: 10,
    });

    useEffect(() => {
        client.get('/products/categories/').then(res => setCategories(res.data));
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // On efface les anciens messages
        setNotification({ type: '', message: '' });
        
        const dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('description', formData.description);
        dataToSend.append('price', formData.price);
        dataToSend.append('category', formData.category);
        dataToSend.append('stock', formData.stock);
        
        if (imageFile) {
            dataToSend.append('image', imageFile); 
        }

        try {
            await client.post('/products/create/', dataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }); 
            
            // 👇 CHANGEMENT ICI : Plus d'alert(), on affiche le message dans la page
            setNotification({ 
                type: 'success', 
                message: 'Produit créé avec succès ! Redirection vers le dashboard...' 
            });

            // On attend 2 secondes pour que l'utilisateur voie le message, puis on redirige
            setTimeout(() => {
                navigate('/admin');
            }, 2000);

        } catch (err) {
            console.error("Erreur Backend:", err.response?.data);
            // Affichage de l'erreur dans la page aussi
            setNotification({ 
                type: 'error', 
                message: err.response?.data?.error || "Erreur lors de la création du produit." 
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <button onClick={() => navigate('/admin')} className="flex items-center text-gray-500 mb-6 hover:text-bahri-blue">
                <ArrowLeft size={20}/> Retour Dashboard
            </button>
            
            <h1 className="text-3xl font-bold mb-8">Ajouter un nouveau produit</h1>
            
            {/* 👇 NOUVEAU : ZONE D'AFFICHAGE DU MESSAGE */}
            {notification.message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
                    notification.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {notification.type === 'success' ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                
                <div>
                    <label className="block font-bold mb-2">Nom du produit</label>
                    <input required className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold mb-2">Prix (TND)</label>
                        <input type="number" step="0.01" required className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                            value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">Stock</label>
                        <input type="number" required className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                            value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block font-bold mb-2">Catégorie</label>
                    <select required className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none bg-white"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="">Choisir une catégorie...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-bold mb-2">Image du produit</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center">
                            <Upload className="text-gray-400 mb-2" size={32} />
                            <span className="text-gray-500">
                                {imageFile ? imageFile.name : "Cliquez pour uploader une image"}
                            </span>
                        </div>
                    </div>
                    
                    {previewUrl && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500 mb-2">Aperçu :</p>
                            <img src={previewUrl} alt="Aperçu" className="h-40 object-contain mx-auto border rounded shadow-sm"/>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block font-bold mb-2">Description</label>
                    <textarea rows="4" className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <button type="submit" disabled={notification.type === 'success'} className={`w-full text-white py-4 rounded-lg font-bold text-lg flex justify-center items-center gap-2 ${notification.type === 'success' ? 'bg-green-500 cursor-not-allowed' : 'bg-bahri-blue hover:bg-opacity-90'}`}>
                    <Save size={24}/> {notification.type === 'success' ? 'Enregistré !' : 'Enregistrer le produit'}
                </button>
            </form>
        </div>
    );
};

export default ProductForm;
import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Loader } from 'lucide-react';

const AdminProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [categories, setCategories] = useState([]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false); // Pour le bouton
    
    // Pour gérer les erreurs/succès sans 'alert'
    const [message, setMessage] = useState({ type: '', text: '' }); 

    const [formData, setFormData] = useState({
        title: '', description: '', price: '', category: '', stock: 10
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. D'abord on charge les catégories
                const catRes = await client.get('/products/categories/');
                setCategories(catRes.data);
                const loadedCategories = catRes.data;

                // 2. Ensuite on charge le produit (si on est en édition)
                if (isEditMode) {
                    const prodRes = await client.get('/products/admin/all/');
                    const product = prodRes.data.find(p => p.id === id);
                    
                    if (product) {
                        // Logique intelligente pour retrouver l'ID de la catégorie
                        let foundCatId = '';

                        // Cas A : C'est déjà un objet {id: "..."}
                        if (product.category && typeof product.category === 'object') {
                            foundCatId = product.category.id;
                        }
                        // Cas B : C'est un ID (string long)
                        else if (product.category && product.category.length > 15) {
                            foundCatId = product.category;
                        }
                        // Cas C : C'est un Nom ("Cannes"), on cherche l'ID dans la liste chargée
                        else if (product.category) {
                            const match = loadedCategories.find(c => c.name === product.category);
                            if (match) foundCatId = match.id;
                        }

                        setFormData({
                            title: product.title,
                            description: product.description,
                            price: product.price,
                            category: foundCatId, // <--- L'ID correct est ici
                            stock: product.stock
                        });

                        if(product.image) {
                            setPreview(product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`);
                        }
                    }
                }
            } catch (err) {
                console.error("Erreur chargement données", err);
            }
        };

        loadData();
    }, [id, isEditMode]);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if(f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const data = new FormData();
        
        // Ajout des champs
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });
        
        if (file) {
            data.append('image', file);
        }

        try {
            const config = {
                // 👇 ASTUCE : On supprime le Content-Type pour laisser le navigateur mettre le sien
                headers: { "Content-Type": undefined },
                transformRequest: (data, headers) => {
                    return data; // Empêche Axios de transformer le FormData
                }
            };

            if (isEditMode) {
                await client.put(`/products/admin/${id}/`, data, config);
            } else {
                await client.post('/products/admin/all/', data, config);
            }
            
            navigate('/admin/products'); 
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || "Erreur lors de l'enregistrement.";
            setMessage({ type: 'error', text: errorMsg });
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <button onClick={() => navigate('/admin/products')} className="flex items-center text-gray-500 mb-6 hover:text-bahri-blue">
                <ArrowLeft size={20}/> Annuler
            </button>
            
            <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Modifier le produit' : 'Nouveau Produit'}</h1>
            
            {/* Message d'erreur intégré */}
            {message.text && (
                <div className={`p-4 rounded mb-6 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                
                {/* Zone Upload Image Stylisée */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition relative group">
                    <input type="file" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                    {preview ? (
                        <div className="relative">
                            <img src={preview} alt="Aperçu" className="h-48 mx-auto object-contain rounded"/>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded text-white font-bold">
                                Changer l'image
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 py-8">
                            <Upload size={48} className="mx-auto mb-2 text-gray-300"/>
                            <p className="font-medium text-gray-500">Cliquez ou glissez une image ici</p>
                        </div>
                    )}
                </div>

                {/* Champs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nom du produit</label>
                        <input required className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                        <select required className="w-full p-3 border rounded bg-white focus:ring-2 ring-bahri-blue outline-none"
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="">-- Sélectionner --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Prix (TND)</label>
                        <input type="number" step="0.01" required className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                            value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                        <input type="number" required className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                            value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea rows="4" className="w-full p-3 border rounded focus:ring-2 ring-bahri-blue outline-none"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-bahri-blue text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition flex justify-center items-center gap-2 disabled:bg-gray-400"
                >
                    {loading ? <Loader className="animate-spin" /> : <Save />} 
                    {loading ? 'Enregistrement...' : (isEditMode ? 'Sauvegarder les modifications' : 'Créer le produit')}
                </button>
            </form>
        </div>
    );
};
export default AdminProductForm;
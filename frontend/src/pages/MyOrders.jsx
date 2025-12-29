import React, { useEffect, useState, useContext } from 'react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ImageOff } from 'lucide-react';

const MyOrders = () => {
    const { user, loading, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Si tu utilises Cloudinary, cette URL de base ne servira que pour les images locales de secours
    const API_URL = "http://127.0.0.1:8000"; 

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            fetchMyOrders();
            refreshUser();
        }
    }, []);

    const fetchMyOrders = async () => {
        try {
            const token = localStorage.getItem('token'); 
            if (!token) {
                setIsLoadingData(false);
                return;
            }

            const res = await client.get('/orders/my-orders/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Sécurité : On s'assure que c'est bien un tableau
            if (Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                setOrders([]);
            }

        } catch (err) {
            console.error("Erreur chargement commandes", err);
            setOrders([]); 
        } finally {
            setIsLoadingData(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14}/> En Attente</span>;
            case 'VALIDATED': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14}/> Validée</span>;
            case 'SHIPPED': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold"><Truck size={14}/> Expédiée</span>;
            case 'DELIVERED': return <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold"><Package size={14}/> Livrée</span>;
            default: return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={14}/> Annulée</span>;
        }
    };

    // --- FONCTION CORRIGÉE POUR CLOUDINARY ---
    const getImageUrl = (item) => {
        // On essaie plusieurs propriétés au cas où le serializer changerait de nom
        const imagePath = item.image || item.product_image || item.product?.image;

        if (!imagePath) return null;
        
        // Si c'est déjà une URL complète (Cloudinary), on la retourne telle quelle
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            return imagePath;
        }
        
        // Sinon, c'est une image locale, on ajoute l'URL de l'API
        return `${API_URL}${imagePath}`;
    };

    if (loading || isLoadingData) return <div className="p-10 text-center text-gray-500 font-medium">Chargement de vos commandes...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Commandes</h1>
            <p className="text-gray-500 mb-8">Suivez l'état de vos achats récents.</p>

            {!orders || orders.length === 0 ? (
                <div className="bg-white p-10 rounded-xl shadow text-center border border-gray-100">
                    <Package size={48} className="mx-auto text-gray-300 mb-4"/>
                    <h3 className="text-xl font-bold text-gray-700">Aucune commande trouvée</h3>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande.</p>
                    <button onClick={() => navigate('/')} className="bg-bahri-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90">
                        Commencer mon shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                            {/* En-tête de la commande */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-200 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Commande n°</p>
                                    <p className="font-mono text-gray-800 font-bold">#{order.id ? order.id.toString().slice(-6) : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Date</p>
                                    <p className="text-sm text-gray-800 font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                                    <p className="font-bold text-bahri-blue">{order.total_amount} TND</p>
                                </div>
                                <div>
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>
                            
                            {/* Liste des produits */}
                            <div className="p-6 bg-white">
                                <div className="space-y-4">
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                
                                                {/* --- BLOC IMAGE CORRIGÉ --- */}
                                                <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                                                    {getImageUrl(item) ? (
                                                        <img 
                                                            src={getImageUrl(item)} 
                                                            alt={item.title} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null; 
                                                                e.target.src = "https://via.placeholder.com/64?text=No+Img"; // Fallback ultime
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageOff size={24} />
                                                        </div>
                                                    )}
                                                    {/* Badge quantité */}
                                                    <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md">
                                                        x{item.quantity}
                                                    </span>
                                                </div>
                                                {/* ------------------------- */}

                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-base">{item.title}</span>
                                                    <span className="text-xs text-gray-500">Réf: {item.product_id || "STD"}</span>
                                                </div>
                                            </div>
                                            <span className="text-gray-700 font-bold whitespace-nowrap bg-gray-50 px-3 py-1 rounded-lg">
                                                {item.price} TND
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
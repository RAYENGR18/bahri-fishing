import React, { useEffect, useState, useContext } from 'react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

const MyOrders = () => {
    // On récupère refreshUser du contexte
    const { user, loading, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            fetchMyOrders();
            // --- MAGIE ICI ---
            // On met à jour les points chaque fois qu'on vient sur cette page
            refreshUser(); 
        }
    // Ajoutez refreshUser aux dépendances pour éviter les avertissements
    }, [user, loading, refreshUser]); 

    const fetchMyOrders = async () => {
        try {
            const token = localStorage.getItem('token'); 
            
            if (!token) {
                setIsLoadingData(false);
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const res = await client.get('/orders/my-orders/', config);
            
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

    // ... (Le reste de votre code : getStatusBadge et le return ne changent pas)
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14}/> En Attente</span>;
            case 'VALIDATED': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14}/> Validée</span>;
            case 'SHIPPED': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold"><Truck size={14}/> Expédiée</span>;
            case 'DELIVERED': return <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold"><Package size={14}/> Livrée</span>;
            default: return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={14}/> Annulée</span>;
        }
    };

    if (loading || isLoadingData) return <div className="p-10 text-center">Chargement de vos commandes...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
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
                             {/* ... Le reste de votre code d'affichage ... */}
                             <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-200 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Commande n°</p>
                                    <p className="font-mono text-gray-800">#{order.id ? order.id.toString().slice(-6) : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Date</p>
                                    <p className="text-sm text-gray-800">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                                    <p className="font-bold text-bahri-blue">{order.total_amount} TND</p>
                                </div>
                                <div>
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 border">
                                                                                                            {item.image ? (
                                                                                                                <img 
                                                                                                                    src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`} 
                                                                                                                    alt="" 
                                                                                                                    className="w-full h-full object-cover"
                                                                                                                />
                                                                                                            ) : (
                                                                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                                                                    <Package size={16}/>
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                <div className="bg-gray-100 w-10 h-10 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                                                    x{item.quantity}
                                                </div>
                                                <span className="font-medium text-gray-800">{item.title}</span>
                                            </div>
                                            <span className="text-gray-600">{item.price} TND</span>
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
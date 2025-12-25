import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Package, Users, DollarSign, ShoppingBag, 
    CheckCircle, XCircle, Truck, Eye, Trash2, Plus, List 
} from 'lucide-react';
// Import du nouveau composant
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [refresh, setRefresh] = useState(0);
    
    // États pour les Modales
    const [selectedOrder, setSelectedOrder] = useState(null); // Pour voir les détails
    
    // État pour la confirmation (Suppression / Status)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        isDanger: false,
        action: null
    });

    useEffect(() => {
        if (!loading) {
            if (!user || !user.is_admin) {
                navigate('/');
                return;
            }
            fetchData();
        }
    }, [user, loading, refresh]);

    const fetchData = async () => {
        try {
            const statsRes = await client.get('/admin/stats/');
            setStats(statsRes.data);
            const ordersRes = await client.get('/admin/orders/');
            setOrders(ordersRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    // --- GESTION DES ACTIONS ---

    const requestStatusChange = (orderId, newStatus) => {
        setConfirmModal({
            isOpen: true,
            title: "Changer le statut",
            message: `Voulez-vous vraiment passer cette commande en "${newStatus}" ? Les points de fidélité seront mis à jour si applicable.`,
            isDanger: newStatus === 'CANCELLED',
            action: async () => {
                try {
                    await client.post(`/admin/orders/${orderId}/update/`, { status: newStatus });
                    setRefresh(prev => prev + 1);
                } catch (err) {
                    console.error("Erreur update", err);
                }
            }
        });
    };

    const requestDelete = (orderId) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer la commande",
            message: "⚠️ Attention : Cette action est irréversible. Voulez-vous vraiment supprimer cette commande définitivement ?",
            isDanger: true,
            action: async () => {
                try {
                    await client.delete(`/admin/orders/${orderId}/delete/`);
                    setRefresh(prev => prev + 1);
                } catch (err) {
                    console.error("Erreur suppression", err);
                }
            }
        });
    };

    if (!stats) return <div className="min-h-screen flex items-center justify-center text-bahri-blue font-bold">Chargement du Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative min-h-screen">
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
            />

            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Administrateur</h1>

            {/* --- 1. STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 flex justify-between items-center">
                    <div><p className="text-gray-500">Commandes</p><p className="text-2xl font-bold">{stats.total_orders}</p></div>
                    <ShoppingBag className="text-blue-500" size={32} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500 flex justify-between items-center">
                    <div><p className="text-gray-500">En Attente</p><p className="text-2xl font-bold">{stats.pending_orders}</p></div>
                    <Package className="text-yellow-500" size={32} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 flex justify-between items-center">
                    <div><p className="text-gray-500">CA Total</p><p className="text-2xl font-bold">{stats.revenue} TND</p></div>
                    <DollarSign className="text-green-500" size={32} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500 flex justify-between items-center">
                    <div><p className="text-gray-500">Clients</p><p className="text-2xl font-bold">{stats.total_users}</p></div>
                    <Users className="text-purple-500" size={32} />
                </div>
            </div>

            {/* --- 2. ACTIONS RAPIDES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link to="/admin/products" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex justify-between items-center group border border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-bahri-blue">Gestion du Catalogue</h3>
                        <p className="text-gray-500 text-sm">Gérer les produits et les stocks</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full group-hover:bg-blue-100"><List className="text-bahri-blue"/></div>
                </Link>
                <Link to="/admin/products/new" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex justify-between items-center group border border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600">Ajouter un Produit</h3>
                        <p className="text-gray-500 text-sm">Créer une nouvelle fiche article</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full group-hover:bg-green-100"><Plus className="text-green-600"/></div>
                </Link>
            </div>

            {/* --- 3. TABLEAU COMMANDES --- */}
            <div className="bg-white rounded-xl shadow overflow-hidden mb-10 border border-gray-100">
                <div className="px-6 py-4 border-b bg-gray-50"><h2 className="text-lg font-bold text-gray-700">Dernières Commandes</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Statut</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">#{order.id.slice(-6)}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{order.client_name || "Invité"}</div>
                                        <button onClick={() => setSelectedOrder(order)} className="text-xs text-bahri-blue hover:underline flex items-center gap-1 mt-1 hover:text-blue-800">
                                            <Eye size={12}/> Voir détails
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-bold">{order.total_amount} TND</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full 
                                            ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                              order.status === 'VALIDATED' ? 'bg-green-100 text-green-800' : 
                                              order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 
                                              'bg-red-100 text-red-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        {order.status === 'PENDING' && (
                                            <button onClick={() => requestStatusChange(order.id, 'VALIDATED')} className="p-2 rounded bg-green-50 text-green-600 hover:bg-green-100 transition" title="Valider la commande">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {order.status === 'VALIDATED' && (
                                            <button onClick={() => requestStatusChange(order.id, 'SHIPPED')} className="p-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Marquer comme Livré/Expédié">
                                                <Truck size={18} />
                                            </button>
                                        )}
                                        <button onClick={() => requestDelete(order.id)} className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition" title="Supprimer définitivement">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 4. MODALE DETAILS COMMANDE (AVEC LISTE PRODUITS) --- */}
            
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <XCircle size={24}/>
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                            Commande #{selectedOrder.id.slice(-6)}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Infos Client */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-xs font-bold text-blue-500 uppercase mb-3 flex items-center gap-2">
                                    <Users size={14}/> Client
                                </h3>
                                <p className="font-bold text-gray-800 text-lg">{selectedOrder.client_name}</p>
                                <p className="text-gray-600 text-sm mt-1">{selectedOrder.email}</p>
                                <p className="text-gray-600 text-sm">{selectedOrder.phone || "Pas de téléphone"}</p>
                            </div>

                            {/* Infos Livraison */}
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h3 className="text-xs font-bold text-yellow-600 uppercase mb-3 flex items-center gap-2">
                                    <Truck size={14}/> Livraison
                                </h3>
                                <p className="text-gray-800">{selectedOrder.address}</p>
                                <p className="text-gray-800 font-medium">{selectedOrder.city}</p>
                            </div>
                        </div>

                        {/* Liste Produits */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <ShoppingBag size={14}/> Contenu du colis ({selectedOrder.items ? selectedOrder.items.length : 0})
                            </h3>
                            
                            <div className="bg-white border rounded-lg overflow-hidden">
                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-bold">
                                            <tr>
                                                <th className="p-3">Produit</th>
                                                <th className="p-3 text-center">Prix U.</th>
                                                <th className="p-3 text-center">Qté</th>
                                                <th className="p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedOrder.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="p-3 text-gray-800 flex items-center gap-3">
                                                        {/* Image miniature */}
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
                                                        <span className="font-medium">{item.title}</span>
                                                    </td>
                                                    <td className="p-3 text-center text-gray-500">{item.price} TND</td>
                                                    <td className="p-3 text-center font-bold bg-gray-50">x{item.quantity}</td>
                                                    <td className="p-3 text-right font-bold text-bahri-blue">{item.total} TND</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                        <Package size={40} className="mb-2 text-gray-300"/>
                                        <p>Détails produits non disponibles.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total Final */}
                        <div className="flex justify-end border-t pt-4">
                            <div className="text-right">
                                <p className="text-gray-500 text-sm">Total Commande</p>
                                <p className="text-3xl font-bold text-bahri-blue">{selectedOrder.total_amount} <span className="text-lg">TND</span></p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setSelectedOrder(null)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
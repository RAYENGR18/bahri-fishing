import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Package, Users, DollarSign, ShoppingBag, 
    CheckCircle, XCircle, Truck, Eye, Trash2, Plus, List,
    UserPlus, History, Save
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- ÉTATS GLOBAUX ---
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' ou 'users'
    const [stats, setStats] = useState(null);
    const [refresh, setRefresh] = useState(0);

    // --- ÉTATS COMMANDES ---
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', isDanger: false, action: null
    });

    // --- ÉTATS UTILISATEURS (NOUVEAU) ---
    const [usersList, setUsersList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Pour le modal de gestion
    const [userHistory, setUserHistory] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    
    // Formulaire Points
    const [pointsData, setPointsData] = useState({ points: 0, reason: "" });
    // Formulaire Nouvel Utilisateur
    const [newUser, setNewUser] = useState({
        email: "", password: "", first_name: "", last_name: "", points: 0
    });

    // --- CHARGEMENT DES DONNÉES ---
    useEffect(() => {
        if (!loading) {
            if (!user || !user.is_admin) {
                navigate('/');
                return;
            }
            fetchStatsAndOrders();
            fetchUsers();
        }
    }, [user, loading, refresh]);

    const fetchStatsAndOrders = async () => {
        try {
            const statsRes = await client.get('/admin/stats/'); // Assure-toi que cette route existe
            setStats(statsRes.data);
            const ordersRes = await client.get('/admin/orders/'); // Assure-toi que cette route existe
            setOrders(ordersRes.data);
        } catch (err) {
            console.error("Erreur stats/orders", err);
        }
    };

    const fetchUsers = async () => {
        try {
            // Note: l'URL dépend de ton urls.py backend. 
            // Si c'est dans apps/users/urls.py préfixé par /users/, c'est /users/admin/users/
            const res = await client.get('/users/admin/users/');
            setUsersList(res.data);
        } catch (err) {
            console.error("Erreur users", err);
        }
    };

    // --- LOGIQUE COMMANDES ---
    const requestStatusChange = (orderId, newStatus) => {
        setConfirmModal({
            isOpen: true,
            title: "Changer le statut",
            message: `Passer la commande en "${newStatus}" ?`,
            isDanger: newStatus === 'CANCELLED',
            action: async () => {
                try {
                    await client.post(`/admin/orders/${orderId}/update/`, { status: newStatus });
                    setRefresh(prev => prev + 1);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) { console.error(err); }
            }
        });
    };

    const requestDelete = (orderId) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer la commande",
            message: "⚠️ Irréversible. Supprimer définitivement ?",
            isDanger: true,
            action: async () => {
                try {
                    await client.delete(`/admin/orders/${orderId}/delete/`);
                    setRefresh(prev => prev + 1);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) { console.error(err); }
            }
        });
    };

    // --- LOGIQUE UTILISATEURS ---
    
    // 1. Ouvrir le modal de gestion (Historique + Points)
    const handleManageUser = async (user) => {
        setSelectedUser(user);
        setPointsData({ points: user.points, reason: "" });
        try {
            const res = await client.get(`/users/admin/users/${user.id}/`);
            setUserHistory(res.data);
            setShowUserModal(true);
        } catch (error) {
            console.error("Erreur historique", error);
        }
    };

    // 2. Mettre à jour les points
    const handleUpdatePoints = async () => {
        try {
            await client.patch(`/users/admin/users/${selectedUser.id}/`, pointsData);
            alert("Points mis à jour !");
            setShowUserModal(false);
            setRefresh(prev => prev + 1); // Rafraîchir la liste
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        }
    };

    // 3. Créer un utilisateur manuellement
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await client.post('/users/admin/users/', newUser);
            alert("Utilisateur créé avec succès !");
            setShowAddUserModal(false);
            setNewUser({ email: "", password: "", first_name: "", last_name: "", points: 0 });
            setRefresh(prev => prev + 1);
        } catch (error) {
            alert(error.response?.data?.error || "Erreur création utilisateur");
        }
    };

    // 4. Supprimer un utilisateur (NOUVELLE FONCTIONNALITÉ AJOUTÉE)
    const requestDeleteUser = (userId) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer l'utilisateur",
            message: "⚠️ Attention : Cette action est irréversible. L'utilisateur et toutes ses commandes seront définitivement supprimés.",
            isDanger: true,
            action: async () => {
                try {
                    await client.delete(`/users/admin/users/${userId}/`);
                    setRefresh(prev => prev + 1); // Rafraîchir la liste
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error(err);
                    alert("Erreur lors de la suppression de l'utilisateur");
                }
            }
        });
    };


    if (!stats) return <div className="min-h-screen flex items-center justify-center text-bahri-blue font-bold">Chargement...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative min-h-screen">
            
            {/* Modal de Confirmation (Utilisé pour Commandes et Utilisateurs) */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrateur</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'orders' ? 'bg-bahri-blue text-white' : 'bg-white text-gray-600 border'}`}
                    >
                        Commandes
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'users' ? 'bg-bahri-blue text-white' : 'bg-white text-gray-600 border'}`}
                    >
                        Utilisateurs
                    </button>
                </div>
            </div>

            {/* --- STATS GLOBALES (Toujours visibles) --- */}
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

            {/* =========================================================================
                                             ONGLET COMMANDES
               ========================================================================= */}
            {activeTab === 'orders' && (
                <div className="animate-fade-in">
                    {/* Actions Rapides Produits */}
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

                    {/* Tableau Commandes */}
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
                                                <button onClick={() => setSelectedOrder(order)} className="text-xs text-bahri-blue hover:underline flex items-center gap-1 mt-1">
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
                                                {/* Boutons d'action commandes (inchangés) */}
                                                {order.status === 'PENDING' && (
                                                    <button onClick={() => requestStatusChange(order.id, 'VALIDATED')} className="p-2 rounded bg-green-50 text-green-600 hover:bg-green-100"><CheckCircle size={18} /></button>
                                                )}
                                                {order.status === 'VALIDATED' && (
                                                    <button onClick={() => requestStatusChange(order.id, 'SHIPPED')} className="p-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"><Truck size={18} /></button>
                                                )}
                                                <button onClick={() => requestDelete(order.id)} className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================================
                                             ONGLET UTILISATEURS
               ========================================================================= */}
            {activeTab === 'users' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
                        <button 
                            onClick={() => setShowAddUserModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow"
                        >
                            <UserPlus size={18} /> Ajouter un utilisateur
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-3">Utilisateur</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Date Inscription</th>
                                    <th className="px-6 py-3">Points Fidélité</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {usersList.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                                                    {u.first_name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">{u.first_name} {u.last_name}</div>
                                                    {u.is_admin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Admin</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                                                {u.points} pts
                                            </span>
                                        </td>
                                        {/* 👇 CELLULE MODIFIÉE POUR AJOUTER LE BOUTON SUPPRIMER 👇 */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button 
                                                    onClick={() => handleManageUser(u)}
                                                    className="text-bahri-blue hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                                                >
                                                    Gérer / Historique
                                                </button>
                                                <button 
                                                    onClick={() => requestDeleteUser(u.id)}
                                                    className="text-red-600 hover:text-red-800 border border-red-200 bg-red-50 hover:bg-red-100 p-1.5 rounded transition"
                                                    title="Supprimer définitivement"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =========================================================================
                                                 MODALS
               ========================================================================= */}

            {/* MODAL DETAILS COMMANDE */}
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
            {/* MODAL GESTION UTILISATEUR (NOUVEAU) */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Gérer : {selectedUser.first_name} {selectedUser.last_name}</h2>
                            <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
                        </div>

                        {/* Modification Points */}
                        <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><DollarSign size={18}/> Modifier le solde de points</h3>
                            <div className="flex flex-col md:flex-row gap-3">
                                <input 
                                    type="number" 
                                    className="border p-2 rounded w-full md:w-32 focus:ring-2 focus:ring-blue-300 outline-none"
                                    value={pointsData.points}
                                    onChange={(e) => setPointsData({...pointsData, points: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Raison (ex: Geste commercial)" 
                                    className="border p-2 rounded flex-1 focus:ring-2 focus:ring-blue-300 outline-none"
                                    value={pointsData.reason}
                                    onChange={(e) => setPointsData({...pointsData, reason: e.target.value})}
                                />
                                <button onClick={handleUpdatePoints} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition flex items-center gap-2 justify-center">
                                    <Save size={18}/> Valider
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Solde actuel : <strong>{selectedUser.points} pts</strong>. Entrez le NOUVEAU total désiré.</p>
                        </div>

                        {/* Historique */}
                        <h3 className="font-bold mb-3 flex items-center gap-2"><History size={18}/> Historique des mouvements</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Action</th>
                                        <th className="px-4 py-2">Raison</th>
                                        <th className="px-4 py-2 text-right">Mvt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {userHistory.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-6 text-gray-500">Aucun historique disponible</td></tr>
                                    ) : (
                                        userHistory.map((h, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-gray-500">{new Date(h.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 font-medium">{h.action}</td>
                                                <td className="px-4 py-2 text-gray-600 italic">{h.reason}</td>
                                                <td className={`px-4 py-2 text-right font-bold ${h.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {h.amount > 0 ? '+' : ''}{h.amount}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL AJOUT UTILISATEUR (NOUVEAU) */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                        <button onClick={() => setShowAddUserModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserPlus className="text-green-600"/> Créer un utilisateur</h2>
                        
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input type="email" required className="w-full border p-2 rounded focus:ring-2 focus:ring-green-200 outline-none"
                                    onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
                                    <input type="text" required className="w-full border p-2 rounded focus:ring-2 focus:ring-green-200 outline-none"
                                        onChange={e => setNewUser({...newUser, first_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                                    <input type="text" required className="w-full border p-2 rounded focus:ring-2 focus:ring-green-200 outline-none"
                                        onChange={e => setNewUser({...newUser, last_name: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
                                <input type="password" required className="w-full border p-2 rounded focus:ring-2 focus:ring-green-200 outline-none"
                                    onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Points de fidélité (Initial)</label>
                                <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-200 outline-none"
                                    onChange={e => setNewUser({...newUser, points: e.target.value})} />
                            </div>
                            
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition mt-2">
                                Créer le compte
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
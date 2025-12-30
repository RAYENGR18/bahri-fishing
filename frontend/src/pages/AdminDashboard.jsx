import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Package, Users, DollarSign, ShoppingBag, 
    CheckCircle, XCircle, Truck, Eye, Trash2, Plus, List,
    UserPlus, History, Save, Search, Calendar, AlertCircle, X
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- ÉTATS GLOBAUX ---
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' ou 'users'
    const [stats, setStats] = useState(null);
    const [refresh, setRefresh] = useState(0);

    // --- SYSTÈME DE NOTIFICATION (NOUVEAU) ---
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

    const showNotification = (type, message) => {
        setNotification({ type, message });
        // Cacher automatiquement après 3 secondes
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    // --- ÉTATS COMMANDES ---
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', isDanger: false, action: null
    });

    // --- FILTRES COMMANDES (NOUVEAU) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    // --- ÉTATS UTILISATEURS ---
    const [usersList, setUsersList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); 
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
            const statsRes = await client.get('/admin/stats/');
            setStats(statsRes.data);
            const ordersRes = await client.get('/admin/orders/');
            setOrders(ordersRes.data);
        } catch (err) {
            console.error("Erreur stats/orders", err);
            showNotification('error', "Impossible de charger les commandes.");
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await client.get('/users/admin/users/');
            setUsersList(res.data);
        } catch (err) {
            console.error("Erreur users", err);
        }
    };

    // --- LOGIQUE DE FILTRAGE COMMANDES (NOUVEAU) ---
    const getFilteredOrders = () => {
        return orders.filter(order => {
            // 1. Recherche Textuelle (ID, Nom, Email, Tel)
            const searchLower = searchTerm.toLowerCase();
            const matchText = 
                (order.id && order.id.toString().toLowerCase().includes(searchLower)) ||
                (order.client_name && order.client_name.toLowerCase().includes(searchLower)) ||
                (order.email && order.email.toLowerCase().includes(searchLower)) ||
                (order.phone && order.phone.includes(searchLower));

            // 2. Filtre par Date
            // On suppose que l'objet order a un champ 'created_at' ou 'date'. 
            // Adapte 'created_at' si ton backend renvoie un autre nom (ex: date_placed)
            let matchDate = true;
            if (dateStart || dateEnd) {
                const orderDate = new Date(order.created_at); 
                orderDate.setHours(0,0,0,0); // Ignorer l'heure pour la comparaison
                
                if (dateStart) {
                    const start = new Date(dateStart);
                    if (orderDate < start) matchDate = false;
                }
                if (dateEnd) {
                    const end = new Date(dateEnd);
                    if (orderDate > end) matchDate = false;
                }
            }

            return matchText && matchDate;
        });
    };

    const requestStatusChange = (orderId, newStatus) => {
        setConfirmModal({
            isOpen: true,
            title: "Changer le statut",
            message: `Voulez-vous vraiment passer cette commande en "${newStatus}" ?`,
            isDanger: newStatus === 'CANCELLED',
            action: async () => {
                try {
                    await client.post(`/admin/orders/${orderId}/update/`, { status: newStatus });
                    showNotification('success', `Commande mise à jour : ${newStatus}`);
                    setRefresh(prev => prev + 1);
                } catch (err) {
                    console.error("Erreur update", err);
                    showNotification('error', "Erreur lors de la mise à jour.");
                }
            }
        });
    };

    const requestDelete = (orderId) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer la commande",
            message: "⚠️ Action irréversible. Supprimer définitivement ?",
            isDanger: true,
            action: async () => {
                try {
                    await client.delete(`/admin/orders/${orderId}/delete/`);
                    showNotification('success', "Commande supprimée avec succès.");
                    setRefresh(prev => prev + 1);
                } catch (err) {
                    console.error("Erreur suppression", err);
                    showNotification('error', "Erreur lors de la suppression.");
                }
            }
        });
    };

    // --- LOGIQUE UTILISATEURS ---
    
    const handleManageUser = async (user) => {
        setSelectedUser(user);
        setPointsData({ points: user.points, reason: "" });
        try {
            const res = await client.get(`/users/admin/users/${user.id}/`);
            setUserHistory(res.data);
            setShowUserModal(true);
        } catch (error) {
            console.error("Erreur historique", error);
            showNotification('error', "Erreur chargement historique.");
        }
    };

    // MODIFICATION ICI : Remplacement de alert() par showNotification()
    const handleUpdatePoints = async () => {
        try {
            await client.patch(`/users/admin/users/${selectedUser.id}/`, pointsData);
            showNotification('success', "Points mis à jour avec succès !");
            setShowUserModal(false);
            setRefresh(prev => prev + 1); 
        } catch (error) {
            showNotification('error', "Erreur lors de la mise à jour des points.");
        }
    };

    // MODIFICATION ICI : Remplacement de alert() par showNotification()
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await client.post('/users/admin/users/', newUser);
            showNotification('success', "Utilisateur créé avec succès !");
            setShowAddUserModal(false);
            setNewUser({ email: "", password: "", first_name: "", last_name: "", points: 0 });
            setRefresh(prev => prev + 1);
        } catch (error) {
            showNotification('error', error.response?.data?.error || "Erreur création utilisateur");
        }
    };

    const requestDeleteUser = (userId) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer l'utilisateur",
            message: "⚠️ Attention : L'utilisateur et ses commandes seront supprimés.",
            isDanger: true,
            action: async () => {
                try {
                    await client.delete(`/users/admin/users/${userId}/`);
                    setRefresh(prev => prev + 1);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    showNotification('success', "Utilisateur supprimé.");
                } catch (err) {
                    console.error(err);
                    showNotification('error', "Erreur suppression utilisateur.");
                }
            }
        });
    };


    if (!stats) return <div className="min-h-screen flex items-center justify-center text-bahri-blue font-bold">Chargement...</div>;

    // Calcul des commandes filtrées pour l'affichage
    const filteredOrders = getFilteredOrders();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative min-h-screen">
            
            {/* --- COMPOSANT NOTIFICATION (TOAST) --- */}
            {notification && (
                <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <div>
                        <p className="font-bold">{notification.type === 'success' ? 'Succès' : 'Erreur'}</p>
                        <p className="text-sm opacity-90">{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-4 opacity-70 hover:opacity-100"><X size={18}/></button>
                </div>
            )}

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

            {/* --- STATS GLOBALES --- */}
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
                    
                    {/* --- ACTIONS & FILTRES COMMANDES (NOUVEAU BLOC) --- */}
                    <div className="bg-white p-4 rounded-xl shadow mb-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                            {/* Barre de Recherche */}
                            <div className="flex-1 w-full">
                                <label className="text-sm font-bold text-gray-600 mb-1 block">Rechercher</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                                    <input 
                                        type="text" 
                                        placeholder="Nom, ID, Email, ou Téléphone..." 
                                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Filtre Date Début */}
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">Du</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                                    <input 
                                        type="date" 
                                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={dateStart}
                                        onChange={(e) => setDateStart(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Filtre Date Fin */}
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">Au</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                                    <input 
                                        type="date" 
                                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={dateEnd}
                                        onChange={(e) => setDateEnd(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Bouton Reset */}
                            {(searchTerm || dateStart || dateEnd) && (
                                <button 
                                    onClick={() => { setSearchTerm(''); setDateStart(''); setDateEnd(''); }}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-medium"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tableau Commandes */}
                    <div className="bg-white rounded-xl shadow overflow-hidden mb-10 border border-gray-100">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-700">Liste des Commandes</h2>
                            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded border">{filteredOrders.length} résultat(s)</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Client</th>
                                        <th className="px-6 py-3">Date</th> 
                                        <th className="px-6 py-3">Total</th>
                                        <th className="px-6 py-3">Statut</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-mono text-sm text-gray-600">#{order.id.slice(0, 8)}...</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{order.client_name || "Invité"}</div>
                                                    <div className="text-xs text-gray-500">{order.email}</div>
                                                    <div className="text-xs text-gray-500">{order.phone}</div>
                                                    <button onClick={() => setSelectedOrder(order)} className="text-xs text-bahri-blue hover:underline flex items-center gap-1 mt-1">
                                                        <Eye size={12}/> Voir détails
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
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
                                                        <button onClick={() => requestStatusChange(order.id, 'VALIDATED')} className="p-2 rounded bg-green-50 text-green-600 hover:bg-green-100"><CheckCircle size={18} /></button>
                                                    )}
                                                    {order.status === 'VALIDATED' && (
                                                        <button onClick={() => requestStatusChange(order.id, 'SHIPPED')} className="p-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"><Truck size={18} /></button>
                                                    )}
                                                    <button onClick={() => requestDelete(order.id)} className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                Aucune commande trouvée pour ces critères.
                                            </td>
                                        </tr>
                                    )}
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

            {/* MODAL DETAILS COMMANDE (Identique précédent) */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <XCircle size={24}/>
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                            Commande #{selectedOrder.id.slice(0, 8)}...
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-xs font-bold text-blue-500 uppercase mb-3 flex items-center gap-2">
                                    <Users size={14}/> Client
                                </h3>
                                <p className="font-bold text-gray-800 text-lg">{selectedOrder.client_name}</p>
                                <p className="text-gray-600 text-sm mt-1">{selectedOrder.email}</p>
                                <p className="text-gray-600 text-sm">{selectedOrder.phone || "Pas de téléphone"}</p>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h3 className="text-xs font-bold text-yellow-600 uppercase mb-3 flex items-center gap-2">
                                    <Truck size={14}/> Livraison
                                </h3>
                                <p className="text-gray-800">{selectedOrder.address}</p>
                                <p className="text-gray-800 font-medium">{selectedOrder.city}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <ShoppingBag size={14}/> Contenu du colis
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
                                                        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 border">
                                                            {item.image ? (
                                                                <img src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`} alt="" className="w-full h-full object-cover"/>
                                                            ) : (<Package size={16} className="m-auto text-gray-400"/>)}
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
                                    <div className="p-4 text-center text-gray-500">Pas de détails produits</div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end border-t pt-4">
                            <div className="text-right">
                                <p className="text-gray-500 text-sm">Total Commande</p>
                                <p className="text-3xl font-bold text-bahri-blue">{selectedOrder.total_amount} <span className="text-lg">TND</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GESTION UTILISATEUR */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Gérer : {selectedUser.first_name} {selectedUser.last_name}</h2>
                            <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
                        </div>

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

                        <h3 className="font-bold mb-3 flex items-center gap-2"><History size={18}/> Historique des mouvements</h3>
                        <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 sticky top-0">
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

            {/* MODAL AJOUT UTILISATEUR */}
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
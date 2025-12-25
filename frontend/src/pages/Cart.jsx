import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, Check, MapPin } from 'lucide-react';
import client from '../api/client';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    
    // Etat pour l'adresse de livraison alternative
    const [altShipping, setAltShipping] = useState({
        address: '', city: ''
    });
    // Toggle pour afficher les champs alternatifs
    const [useAltAddress, setUseAltAddress] = useState(false);

    // Infos invité (si pas de user)
    const [guestInfo, setGuestInfo] = useState({
        full_name: '', email: '', phone: '', address: '', city: ''
    });

    const [useLoyalty, setUseLoyalty] = useState(false);
    const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, SUCCESS, ERROR

    const handleCheckout = async (e) => {
        e.preventDefault();
        setStatus('SUBMITTING');

        let finalShipping = {};

        if (user) {
            // LOGIQUE CLIENT CONNECTÉ
            finalShipping = {
                full_name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                phone: user.phone,
                // Si case cochée et remplie, on prend l'adresse alternative, sinon celle du compte
                address: (useAltAddress && altShipping.address) ? altShipping.address : user.address,
                city: (useAltAddress && altShipping.city) ? altShipping.city : user.city,
            };
        } else {
            // LOGIQUE INVITÉ
            finalShipping = { ...guestInfo };
        }

        const orderData = {
            items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
            use_loyalty: useLoyalty,
            ...finalShipping
        };

        try {
            await client.post('/orders/create/', orderData);
            setStatus('SUCCESS');
            clearCart();
        } catch (err) {
            console.error(err);
            setStatus('ERROR');
        }
    };

    // --- VUE SUCCÈS ---
    if (status === 'SUCCESS') {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center px-4 animate-fade-in-up">
                <div className="bg-white p-10 rounded-2xl shadow-xl border border-green-100 inline-block max-w-lg w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                    
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-green-600" size={40} strokeWidth={3} />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Commande Validée !</h2>
                    <p className="text-gray-500 mb-8 text-lg">Merci, nous préparons votre colis dès maintenant.</p>
                    
                    <div className="flex flex-col gap-3">
                        {user ? (
                            <Link to="/my-orders" className="bg-bahri-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-200">
                                Suivre ma commande
                            </Link>
                        ) : (
                            <Link to="/" className="bg-bahri-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-200">
                                Retour à la boutique
                            </Link>
                        )}
                        
                        <Link to="/" className="text-gray-400 font-semibold hover:text-gray-600 text-sm py-2">
                            Continuer mes achats
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // --- VUE PANIER VIDE ---
    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
                <p className="text-gray-600 mb-8">Découvrez notre matériel de pêche de qualité.</p>
                <Link to="/" className="text-bahri-blue font-semibold hover:underline text-lg">
                    Retourner à la boutique
                </Link>
            </div>
        );
    }

    // --- VUE PRINCIPALE ---
    const subTotal = parseFloat(cartTotal);
    const shipping = 7.00;
    const loyaltyDeduction = (user && useLoyalty) ? Math.min(parseFloat(user.loyalty_points), subTotal) : 0;
    const finalTotal = subTotal + shipping - loyaltyDeduction;
    // Points potentiels (5% du sous-total)
    const pointsToEarn = (subTotal * 0.05).toFixed(2);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* GAUCHE : Panier + Livraison */}
            <div>
                <h2 className="text-2xl font-bold mb-6">1. Panier</h2>
                <div className="space-y-4 mb-8">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded shadow-sm border border-gray-100">
                            <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-gray-800 line-clamp-1">{item.title}</h3>
                                <p className="text-sm text-bahri-blue font-medium">{item.price} TND x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded">
                                    <Minus size={16} />
                                </button>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-full">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))}
                </div>

                <h2 className="text-2xl font-bold mb-6">2. Informations de Livraison</h2>
                
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                    
                    {user ? (
                        // --- VUE CONNECTÉ ---
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">{user.first_name} {user.last_name}</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-sm text-gray-600">{user.phone}</p>
                                </div>
                                <Link to="/profile" className="text-xs text-bahri-blue font-semibold hover:underline">
                                    Modifier mon profil
                                </Link>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                                    <MapPin size={12}/> Adresse principale
                                </p>
                                <p className="text-gray-800 font-medium ml-4">{user.address}</p>
                                <p className="text-gray-800 ml-4">{user.city}</p>
                            </div>

                            {/* Option Adresse différente */}
                            <div className="border-t border-gray-200 pt-4">
                                <label className="flex items-center gap-2 cursor-pointer mb-3">
                                    <input 
                                        type="checkbox" 
                                        checked={useAltAddress} 
                                        onChange={e => setUseAltAddress(e.target.checked)} 
                                        className="rounded text-bahri-blue focus:ring-bahri-blue"
                                    />
                                    <span className="font-semibold text-sm text-gray-700">Livrer à une autre adresse</span>
                                </label>

                                {useAltAddress && (
                                    <div className="grid grid-cols-1 gap-3 animate-pulse-once">
                                        <input 
                                            placeholder="Adresse (Rue, numéro...)" 
                                            required={useAltAddress} 
                                            className="p-3 border rounded w-full text-sm focus:ring-2 focus:ring-bahri-blue outline-none"
                                            value={altShipping.address} 
                                            onChange={e => setAltShipping({...altShipping, address: e.target.value})} 
                                        />
                                        <input 
                                            placeholder="Ville / Gouvernorat" 
                                            required={useAltAddress} 
                                            className="p-3 border rounded w-full text-sm focus:ring-2 focus:ring-bahri-blue outline-none"
                                            value={altShipping.city} 
                                            onChange={e => setAltShipping({...altShipping, city: e.target.value})} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // --- VUE INVITÉ (Tout modifiable) ---
                        <div className="space-y-4">
                             <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4 border border-blue-100">
                                👋 Vous commandez en tant qu'invité. <Link to="/login" className="font-bold underline">Connectez-vous</Link> pour gagner <b>{pointsToEarn} points</b> !
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <input required placeholder="Nom complet" className="w-full p-3 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"
                                    value={guestInfo.full_name} onChange={e => setGuestInfo({...guestInfo, full_name: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input required type="email" placeholder="Email" className="w-full p-3 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"
                                    value={guestInfo.email} onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} />
                                <input required placeholder="Téléphone" className="w-full p-3 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"
                                    value={guestInfo.phone} onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} />
                            </div>
                            
                            <input required placeholder="Adresse complète" className="w-full p-3 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"
                                value={guestInfo.address} onChange={e => setGuestInfo({...guestInfo, address: e.target.value})} />
                            <input required placeholder="Ville" className="w-full p-3 border rounded focus:ring-2 focus:ring-bahri-blue outline-none"
                                value={guestInfo.city} onChange={e => setGuestInfo({...guestInfo, city: e.target.value})} />
                        </div>
                    )}
                </form>
            </div>

            {/* DROITE : Résumé & Paiement */}
            <div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                    <h2 className="text-xl font-bold mb-6 text-gray-900">Résumé de la commande</h2>
                    
                    <div className="space-y-3 text-gray-600 mb-6 text-sm">
                        <div className="flex justify-between">
                            <span>Sous-total</span>
                            <span>{subTotal.toFixed(2)} TND</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Livraison</span>
                            <span>{shipping.toFixed(2)} TND</span>
                        </div>
                        
                        {user && user.loyalty_points > 0 && (
                            <div className="bg-bahri-light/20 p-3 rounded mt-2 border border-bahri-light">
                                <label className="flex items-center cursor-pointer gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={useLoyalty} 
                                        onChange={e => setUseLoyalty(e.target.checked)} 
                                        className="w-4 h-4 text-bahri-blue rounded focus:ring-bahri-blue" 
                                    />
                                    <span className="text-sm font-semibold text-bahri-blue">
                                        Utiliser mes points ({parseFloat(user.loyalty_points).toFixed(2)} pts)
                                    </span>
                                </label>
                                {useLoyalty && (
                                    <div className="flex justify-between text-green-600 font-bold mt-2 text-sm pl-6">
                                        <span>Réduction fidélité</span>
                                        <span>- {loyaltyDeduction.toFixed(2)} TND</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 flex justify-between items-center mb-6">
                        <span className="text-xl font-bold text-gray-900">Total à payer</span>
                        <span className="text-2xl font-bold text-bahri-blue">{finalTotal.toFixed(2)} TND</span>
                    </div>
                    
                    {user && (
                        <div className="mb-6 text-xs text-center text-green-700 font-bold bg-green-50 p-2 rounded border border-green-100">
                            ✨ Vous gagnerez {pointsToEarn} points sur cette commande !
                        </div>
                    )}

                    <button 
                        form="checkout-form" 
                        type="submit" 
                        disabled={status === 'SUBMITTING'}
                        className="w-full bg-bahri-blue text-white py-4 rounded-lg font-bold hover:bg-opacity-90 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === 'SUBMITTING' ? 'Validation...' : 'Confirmer la commande'} <ArrowRight size={20} />
                    </button>
                    
                    <p className="text-center text-xs text-gray-400 mt-4 uppercase tracking-wider">
                        Paiement à la livraison
                    </p>
                    {status === 'ERROR' && (
                        <p className="text-center text-sm text-red-500 mt-2 font-bold">
                            Une erreur est survenue. Vérifiez vos informations.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; // <--- 1. Import nécessaire

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user, loading } = useContext(AuthContext); // <--- 2. On récupère l'utilisateur

    // Fonction pour déterminer la clé de stockage (Panier Invité ou Panier Utilisateur)
    const getCartKey = () => {
        if (user && user.id) {
            return `cart_${user.id}`; // ex: cart_654321...
        }
        return 'cart_guest';
    };

    const [cartItems, setCartItems] = useState([]);

    // 3. EFFET : Chargement du panier quand l'utilisateur change (Login/Logout)
    useEffect(() => {
        if (!loading) { // On attend que l'auth soit chargée
            const key = getCartKey();
            const storedCart = localStorage.getItem(key);
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            } else {
                setCartItems([]); // Panier vide si nouvelle clé
            }
        }
    }, [user, loading]); // Se déclenche à chaque changement de user

    // 4. EFFET : Sauvegarde automatique sur la clé ACTUELLE
    useEffect(() => {
        if (!loading) {
            const key = getCartKey();
            localStorage.setItem(key, JSON.stringify(cartItems));
        }
    }, [cartItems, user, loading]);

    // --- Fonctions inchangées ---

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Vider le panier (vide la clé actuelle)
    const clearCart = () => {
        setCartItems([]);
        const key = getCartKey();
        localStorage.removeItem(key);
    };

    // Calculs
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            cartCount, 
            cartTotal 
        }}>
            {children}
        </CartContext.Provider>
    );
};
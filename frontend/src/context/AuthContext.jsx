// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await client.post('/users/login/', { email, password });
            const { user, tokens } = response.data;
            
            setUser(user);
            localStorage.setItem('token', tokens.access); 
            localStorage.setItem('user', JSON.stringify(user));
            
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return { 
                success: false, 
                error: error.response?.data?.error || "Erreur de connexion" 
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // --- NOUVELLE FONCTION ---
    // Permet de mettre à jour les points sans se déconnecter
    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Appel à la route créée à l'étape 2 (/users/me/)
            const response = await client.get('/users/profile/');
            
            // Mise à jour du State et du LocalStorage
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            console.log("Profil utilisateur mis à jour (Points refresh)");
        } catch (error) {
            console.error("Erreur lors du rafraîchissement du profil", error);
        }
    };

    return (
        // On ajoute refreshUser ici pour pouvoir l'utiliser ailleurs
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
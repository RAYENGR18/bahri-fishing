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

    // ================= LOGIN CLASSIQUE =================
    const login = async (email, password) => {
        try {
            const response = await client.post('/users/login/', { email, password });
            const { user, tokens } = response.data;

            setUser(user);
            localStorage.setItem('token', tokens.access);
            localStorage.setItem('refresh', tokens.refresh);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Erreur de connexion"
            };
        }
    };

    // ================= LOGIN GOOGLE =================
    const loginWithGoogle = (user, tokens) => {
        setUser(user);
        localStorage.setItem('token', tokens.access);
        localStorage.setItem('refresh', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
    };

    const refreshUser = async () => {
        try {
            const response = await client.get('/users/profile/');
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error("Erreur refresh user", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                loginWithGoogle, // 🔥 IMPORTANT
                logout,
                loading,
                refreshUser
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

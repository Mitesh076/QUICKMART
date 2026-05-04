import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            // Set default axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password, isAdminLogin = false) => {
        try {
            const endpoint = isAdminLogin ? '/api/auth/admin/login' : '/api/auth/login';
            const response = await axios.post(`http://localhost:3000${endpoint}`, {
                email,
                password
            });

            const { token, user: userData } = response.data;
            
            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', userData);
            
            const { token, user: newUser } = response.data;
            
            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(newUser);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem('token');
    };

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://localhost:3000/api/auth/profile');
                const userData = response.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
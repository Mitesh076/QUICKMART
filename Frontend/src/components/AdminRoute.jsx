import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (!isAuthenticated()) {
        // Redirect to admin login with the current location
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (!isAdmin()) {
        // Redirect to home if user is not an admin
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
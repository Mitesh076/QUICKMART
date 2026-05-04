import React, { useState, useEffect } from 'react'
import Button from './Button'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import Toast from './Toast'
import useToast from '../hooks/useToast'

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { getCartItemsCount } = useCart();
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    
    const cartItemsCount = getCartItemsCount();

    // Listen for localStorage changes to update login state
    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
        };

        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically for same-tab changes
        const interval = setInterval(() => {
            const currentLoginState = localStorage.getItem('isLoggedIn') === 'true';
            if (currentLoginState !== isLoggedIn) {
                setIsLoggedIn(currentLoginState);
            }
        }, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [isLoggedIn]);
    const { toast, showToast, hideToast } = useToast();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        localStorage.setItem('isLoggedIn', 'false');
        showToast('Logged out successfully', 'success');
        setIsLoggedIn(false);
        setTimeout(() => {
            navigate('/');
        }, 1000);
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <span style={{fontSize: '24px', fontWeight: 'bold', color: '#007bff'}}>QuickMart</span>
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav m-auto">
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                                    to="/"
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${isActive('/products') ? 'active' : ''}`} 
                                    to="products"
                                >
                                    Shop
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${isActive('/about') ? 'active' : ''}`} 
                                    to="about"
                                >
                                    About
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${isActive('/contact') ? 'active' : ''}`} 
                                    to="contact"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${isActive('/cart') ? 'active' : ''}`} 
                                    to="cart"
                                >
                                    Cart 
                                    {(isLoggedIn || isAuthenticated()) && cartItemsCount > 0 && (
                                        <span className="badge bg-primary ms-1">{cartItemsCount}</span>
                                    )}
                                </Link>
                            </li>

                        </ul>

                        {!(isLoggedIn || isAuthenticated()) ? (
                            <div className="d-flex gap-2">
                                <Link to="login" className="btn btn-sm btn-outline-primary">Login</Link>
                                <Link to="signup" className="btn btn-sm btn-outline-primary">Signup</Link>
                                <Link to="/admin/login" className="btn btn-sm btn-outline-secondary">Admin</Link>
                            </div>
                        ): (
                            <div className="d-flex align-items-center">
                                {user && (
                                    <span className="me-3 text-muted">Welcome, {user.name}</span>
                                )}
                                {isAdmin() && (
                                    <Link to="/admin/dashboard" className="btn btn-sm btn-primary me-2">
                                        Admin Panel
                                    </Link>
                                )}
                                <button className="btn btn-sm btn-outline-primary" onClick={handleLogout}>Logout</button>
                            </div>
                        )}


                    </div>
                </div>
            </nav>
            
            <Toast 
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </>
    )
}

export default Header
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/categories', label: 'Categories', icon: '📂' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
        { path: '/admin/profile', label: 'Profile', icon: '👤' }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <div style={{ 
                width: '250px', 
                backgroundColor: '#343a40', 
                color: 'white',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto'
            }}>
                <div className="p-3 border-bottom">
                    <h5 className="mb-0" style={{ color: '#007bff' }}>QuickMart Admin</h5>
                    <small className="text-muted">Welcome, {user?.name}</small>
                </div>
                
                <nav className="mt-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`d-block p-3 text-decoration-none ${
                                location.pathname === item.path 
                                    ? 'bg-primary text-white' 
                                    : 'text-light hover-bg-secondary'
                            }`}
                            style={{
                                borderLeft: location.pathname === item.path ? '4px solid #007bff' : '4px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span className="me-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                
                <div className="position-absolute bottom-0 w-100 p-3">
                    <Link 
                        to="/" 
                        className="btn btn-outline-light btn-sm me-2"
                        style={{ fontSize: '12px' }}
                    >
                        View Site
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="btn btn-outline-primary btn-sm"
                        style={{ 
                            fontSize: '12px',
                            backgroundColor: 'rgba(13, 110, 253, 0.1)',
                            borderColor: '#0d6efd',
                            color: '#0d6efd'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
            
            {/* Main Content */}
            <div style={{ marginLeft: '250px', flex: 1 }}>
                {/* Top Header */}
                <div className="bg-white shadow-sm p-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-muted">
                            Admin Panel / {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h6>
                        <div className="d-flex align-items-center">
                            <span className="me-3 text-muted">{new Date().toLocaleDateString()}</span>
                            <div className="btn-group">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-primary btn-sm dropdown-toggle" 
                                    data-bs-toggle="dropdown"
                                    style={{
                                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                        borderColor: '#0d6efd',
                                        color: '#0d6efd'
                                    }}
                                >
                                    {user?.name}
                                </button>
                                <ul className="dropdown-menu" style={{
                                    boxShadow: '0 0.5rem 1rem rgba(13, 110, 253, 0.15)'
                                }}>
                                    <li><Link className="dropdown-item" to="/admin/profile">Profile</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Page Content */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
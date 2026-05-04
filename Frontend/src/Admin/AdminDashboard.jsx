import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: { total: 0, customers: 0, admins: 0 },
        products: { total: 0, active: 0 },
        categories: { total: 0 }
    });
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, productsResponse] = await Promise.all([
                axios.get('http://localhost:3000/api/users/stats'),
                axios.get('http://localhost:3000/api/products/admin')
            ]);

            setStats(statsResponse.data);
            setRecentProducts(productsResponse.data.slice(0, 5)); // Get latest 5 products
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <div className="col-md-3 mb-4">
            <div className="card h-100">
                <div className="card-body d-flex align-items-center">
                    <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{ 
                            backgroundColor: `${color}20`, 
                            color: color,
                            width: '50px',
                            height: '50px',
                            minWidth: '50px',
                            minHeight: '50px'
                        }}
                    >
                        <i className={`fas ${icon}`}></i>
                    </div>
                    <div className="flex-grow-1">
                        <h3 className="mb-1" style={{ color: color }}>{value}</h3>
                        <h6 className="text-muted mb-0">{title}</h6>
                        {subtitle && <small className="text-muted d-block">{subtitle}</small>}
                    </div>
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon, color, link }) => (
        <div className="col-md-6 mb-3">
            <Link to={link} className="text-decoration-none">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className={`rounded p-2 me-3`} style={{ backgroundColor: `${color}20`, color: color }}>
                                <i className={`fas ${icon} fa-lg`}></i>
                            </div>
                            <div>
                                <h6 className="mb-1">{title}</h6>
                                <small className="text-muted">{description}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Dashboard Overview</h4>
                    <p className="text-muted mb-0">Welcome to QuickMart Admin Panel</p>
                </div>
                <div className="text-muted">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row">
                <StatCard 
                    title="Total Users"
                    value={stats.users.total}
                    icon="fa-users"
                    color="#007bff"
                    subtitle={`${stats.users.customers} customers, ${stats.users.admins} admins`}
                />
                <StatCard 
                    title="Total Products"
                    value={stats.products.total}
                    icon="fa-box"
                    color="#28a745"
                    subtitle={`${stats.products.active} active products`}
                />
                <StatCard 
                    title="Categories"
                    value={stats.categories.total}
                    icon="fa-tags"
                    color="#ffc107"
                />
                <StatCard 
                    title="Revenue"
                    value="$0"
                    icon="fa-dollar-sign"
                    color="#dc3545"
                    subtitle="Coming soon"
                />
            </div>

            <div className="row">
                {/* Quick Actions */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">Quick Actions</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <QuickActionCard 
                                    title="Add New Product"
                                    description="Create and manage products"
                                    icon="fa-plus"
                                    color="#007bff"
                                    link="/admin/products"
                                />
                                <QuickActionCard 
                                    title="Manage Categories"
                                    description="Organize product categories"
                                    icon="fa-folder"
                                    color="#28a745"
                                    link="/admin/categories"
                                />
                                <QuickActionCard 
                                    title="User Management"
                                    description="View and manage users"
                                    icon="fa-user-cog"
                                    color="#ffc107"
                                    link="/admin/users"
                                />
                                <QuickActionCard 
                                    title="View Site"
                                    description="Check customer view"
                                    icon="fa-external-link-alt"
                                    color="#6c757d"
                                    link="/"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Recent Products</h6>
                            <Link to="/admin/products" className="btn btn-sm btn-outline-primary">
                                View All
                            </Link>
                        </div>
                        <div className="card-body">
                            {recentProducts.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {recentProducts.map((product) => (
                                        <div key={product._id} className="list-group-item px-0">
                                            <div className="d-flex align-items-center">
                                                <img 
                                                    src={`http://localhost:3000/uploads/${product.image}`}
                                                    alt={product.name}
                                                    className="rounded me-3"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{product.name}</h6>
                                                    <small className="text-muted">
                                                        ${product.price} • {product.category?.name}
                                                    </small>
                                                </div>
                                                <span className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <div className="text-muted">
                                        <i className="fas fa-box fa-2x mb-2"></i>
                                        <p>No products yet</p>
                                        <Link to="/admin/products" className="btn btn-sm btn-blue">
                                            Add Your First Product
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">System Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <small className="text-muted">Application Version</small>
                                    <p className="mb-0">QuickMart v1.0.0</p>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted">Database Status</small>
                                    <p className="mb-0 text-success">
                                        <i className="fas fa-circle me-1"></i>Connected
                                    </p>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted">Last Backup</small>
                                    <p className="mb-0">Manual backup required</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
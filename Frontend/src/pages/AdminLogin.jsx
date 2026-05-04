import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast, showToast, hideToast } = useToast();
    
    const from = location.state?.from?.pathname || '/admin/dashboard';

    const validateForm = () => {
        const newErrors = {};
        
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setErrors({});

        try {
            await login(email, password, true); // true for admin login
            showToast('Admin login successful! Redirecting...', 'success');
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            showToast(error.message || 'Invalid credentials. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className='signup-section'>
                <div className="container my-5">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-lg-4">
                            <div className="text-center mb-4">
                                <h4>Admin Login</h4>
                                <p className="text-muted">Access the admin dashboard</p>
                            </div>
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label htmlFor="adminEmail" className="form-label">Email address</label>
                                    <input 
                                        type="email" 
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                        id="adminEmail" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="Enter admin email"
                                        required 
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                                <PasswordInput
                                    label="Password"
                                    name="password"
                                    id="adminPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                    error={errors.password}
                                />
                               
                                <button type="submit" className="btn w-100 mb-3" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In as Admin'
                                    )}
                                </button>
                                
                                <Link to="/" className="btn btn-outline-secondary w-100">
                                    <i className="fas fa-arrow-left me-2"></i>Back to Site
                                </Link>
                            </form>
                            
                            <div className="text-center mt-3">
                                <small className="text-muted">
                                    Default: admin@quickmart.com / admin123
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <Toast 
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </>
    );
};

export default AdminLogin;
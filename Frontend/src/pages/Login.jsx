import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast, showToast, hideToast } = useToast();
    
    const from = location.state?.from?.pathname || '/products';

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
            await login(email, password, false); // false for regular login
            showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            showToast(error.message || 'Invalid credentials. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }




  return (
    <>
        <section className='signup-section'>
                <div className="container my-5">
                <div className="row justify-content-center align-items-center">
                    <div className="col-lg-4">
                        <h4>Login</h4>
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                                <input 
                                    type="email" 
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                    id="exampleInputEmail1" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                {!errors.email && <div className="form-text">We'll never share your email with anyone else.</div>}
                            </div>
                            <PasswordInput
                                label="Password"
                                name="password"
                                id="exampleInputPassword1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                error={errors.password}
                            />
                           
                            <button type="submit" className="btn w-100" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>
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
  )
}

export default Login
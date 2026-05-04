import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

const SignUp = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setErrors({});

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            showToast('Signup successful! Welcome to QuickMart!', 'success');
            setTimeout(() => {
                navigate('/products');
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            showToast(error.message || 'Signup failed. Please try again.', 'error');
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
                        <div className="text-center mb-4">
                            <h4>Create Your Account</h4>
                            <p className="text-muted">Join QuickMart and start shopping!</p>
                        </div>
                        <form onSubmit={handleSignup}>
                            <div className="mb-3">
                                <label htmlFor="signupName" className="form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                                    id="signupName" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter your full name"
                                    required 
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="signupEmail" className="form-label">Email address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                    id="signupEmail" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter your email"
                                    required 
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                {!errors.email && <div className="form-text">We'll never share your email with anyone else.</div>}
                            </div>
                            <PasswordInput
                                label="Password"
                                name="password"
                                id="signupPassword"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                required
                                error={errors.password}
                                minLength={6}
                            />
                            <PasswordInput
                                label="Confirm Password"
                                name="confirmPassword"
                                id="signupConfirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                required
                                error={errors.confirmPassword}
                                minLength={6}
                            />
                           
                            <button type="submit" className="btn w-100" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                        
                        <div className="text-center mt-3">
                            <small className="text-muted">
                                Already have an account? <a href="/login" className="text-decoration-none">Sign in here</a>
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
    )
}

export default SignUp
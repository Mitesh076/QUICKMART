import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const AdminProfile = () => {
    const { user, refreshUser } = useAuth();
    const { toast, showToast, hideToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [errors, setErrors] = useState({});

    // Load current user profile
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setProfileLoading(true);
            const response = await axios.get('http://localhost:3000/api/auth/profile');
            const userData = response.data;
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load profile data', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation only if user is trying to change password
        if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }
            if (!formData.newPassword) {
                newErrors.newPassword = 'New password is required';
            } else if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'New password must be at least 6 characters';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Update profile (name and email)
            await axios.put('http://localhost:3000/api/auth/profile', {
                name: formData.name,
                email: formData.email
            });

            // Change password if provided
            if (formData.currentPassword && formData.newPassword) {
                await axios.put('http://localhost:3000/api/auth/change-password', {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });
                showToast('Profile and password updated successfully!', 'success');
            } else {
                showToast('Profile updated successfully!', 'success');
            }

            setIsEditing(false);
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setErrors({});
            
            // Refresh profile data and user context
            await fetchUserProfile();
            await refreshUser();
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setErrors({});
        // Reset to original data
        fetchUserProfile();
    };

    if (profileLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading profile...</span>
                    </div>
                    <p className="mt-3">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Admin Profile</h5>
                            {!isEditing && (
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <i className="fas fa-edit me-2"></i>Edit Profile
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSaveProfile}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value="Administrator"
                                            disabled
                                        />
                                        <span className="input-group-text">
                                            <i className="fas fa-shield-alt text-danger"></i>
                                        </span>
                                    </div>
                                </div>

                                {isEditing && (
                                    <>
                                        <hr />
                                        <h6 className="mb-3">Change Password (Optional)</h6>
                                        <div className="alert alert-info" role="alert">
                                            <i className="fas fa-info-circle me-2"></i>
                                            <small>Leave password fields empty to keep your current password unchanged.</small>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <PasswordInput
                                                    label="Current Password"
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter current password"
                                                    error={errors.currentPassword}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <PasswordInput
                                                    label="New Password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter new password"
                                                    error={errors.newPassword}
                                                    minLength={6}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <PasswordInput
                                                    label="Confirm New Password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Confirm new password"
                                                    error={errors.confirmPassword}
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isEditing && (
                                    <div className="d-flex gap-2">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>Save Changes
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary"
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-arrow-left me-2"></i>Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">Account Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h6 className="mb-0">{user?.name}</h6>
                                    <small className="text-muted">System Administrator</small>
                                </div>
                            </div>
                            
                            <hr />
                            
                            <div className="row text-center">
                                <div className="col-6">
                                    <div className="p-2">
                                        <i className="fas fa-calendar-alt fa-2x text-primary mb-2"></i>
                                        <p className="mb-0"><small>Joined</small></p>
                                        <strong>System Admin</strong>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2">
                                        <i className="fas fa-shield-alt fa-2x text-danger mb-2"></i>
                                        <p className="mb-0"><small>Access Level</small></p>
                                        <strong>Full Access</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <hr />
                            
                            <div className="list-group list-group-flush">
                                <div className="list-group-item d-flex justify-content-between px-0">
                                    <span>Account Status</span>
                                    <span className="badge bg-success">Active</span>
                                </div>
                                <div className="list-group-item d-flex justify-content-between px-0">
                                    <span>Two-Factor Auth</span>
                                    <span className="badge bg-secondary">Disabled</span>
                                </div>
                                <div className="list-group-item d-flex justify-content-between px-0">
                                    <span>Last Login</span>
                                    <span className="text-muted">Today</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-4">
                        <div className="card-header">
                            <h6 className="mb-0">Security Settings</h6>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-info" role="alert">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>Security Notice:</strong> As a system administrator, your account has elevated privileges. Regular password changes are recommended.
                            </div>
                            
                            <div className="d-grid gap-2">
                                <button className="btn btn-outline-primary btn-sm" disabled>
                                    <i className="fas fa-key me-2"></i>Enable 2FA
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" disabled>
                                    <i className="fas fa-history me-2"></i>Login History
                                </button>
                            </div>
                            
                            <small className="text-muted d-block mt-2">
                                These features will be available in future updates.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <Toast 
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
};

export default AdminProfile;
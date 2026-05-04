import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const { user: currentUser } = useAuth();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/users');
            setUsers(response.data);
        } catch (error) {
            showToast('Failed to fetch users', 'error');
        }
    };

    const handleRoleChange = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowModal(true);
    };

    const updateUserRole = async () => {
        if (!selectedUser || newRole === selectedUser.role) {
            setShowModal(false);
            return;
        }

        setLoading(true);
        try {
            await axios.put(`http://localhost:3000/api/users/${selectedUser._id}/role`, {
                role: newRole
            });
            showToast(`User role updated to ${newRole} successfully!`, 'success');
            fetchUsers();
            setShowModal(false);
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Failed to update user role',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = (userId, userName) => {
        if (pendingDelete === userId) {
            // Second click - confirm delete
            deleteUserConfirm(userId, userName);
        } else {
            // First click - show confirmation
            setPendingDelete(userId);
            showToast(`Click delete again to confirm removing "${userName}"`, 'warning', true);
            // Confirmation button will stay until clicked
        }
    };

    const deleteUserConfirm = async (userId, userName) => {
        try {
            await axios.delete(`http://localhost:3000/api/users/${userId}`);
            hideToast(); // Hide persistent confirmation toast
            showToast('User deleted successfully!', 'success');
            setPendingDelete(null);
            fetchUsers();
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Failed to delete user',
                'error'
            );
            setPendingDelete(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleBadgeClass = (role) => {
        return role === 'admin' ? 'bg-danger' : 'bg-primary';
    };

    const isProtectedUser = (user) => {
        // Protect the main admin account and current logged-in user
        return user.email === 'admin@quickmart.com' || user._id === currentUser?.id;
    };

    const canModifyUser = (user) => {
        return !isProtectedUser(user);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4>User Management</h4>
                    <p className="text-muted mb-0">Manage registered users and their roles</p>
                </div>
                <div className="text-muted">
                    Total Users: {users.length}
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div 
                                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                    style={{ 
                                                        width: '40px', 
                                                        height: '40px', 
                                                        backgroundColor: '#f8f9fa',
                                                        color: '#6c757d',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong>{user.name}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {formatDate(user.createdAt)}
                                            </small>
                                        </td>
                                        <td>
                                            {canModifyUser(user) ? (
                                                <div className="btn-group" role="group">
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => handleRoleChange(user)}
                                                        title="Change Role"
                                                        style={{ boxShadow: 'none' }}
                                                    >
                                                        <i className="fas fa-user-cog me-1"></i>Change Role
                                                    </button>
                                                    <button 
                                                        className={`btn btn-sm ${
                                                            pendingDelete === user._id 
                                                                ? 'btn-warning' 
                                                                : 'btn-outline-danger'
                                                        }`}
                                                        onClick={() => handleDeleteRequest(user._id, user.name)}
                                                        title="Delete User"
                                                        style={{ boxShadow: 'none' }}
                                                    >
                                                        <i className="fas fa-trash me-1"></i>
                                                        {pendingDelete === user._id ? 'Confirm?' : 'Delete'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-warning text-dark">
                                                        <i className="fas fa-shield-alt me-1"></i>
                                                        {isProtectedUser(user) && user._id === currentUser?.id ? 'Current User' : 'Protected'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="text-center py-4">
                                <div className="text-muted">
                                    <i className="fas fa-users fa-3x mb-3"></i>
                                    <p>No users found</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Statistics */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">User Statistics</h6>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-6">
                                    <h4 className="text-primary">
                                        {users.filter(u => u.role === 'customer').length}
                                    </h4>
                                    <small className="text-muted">Customers</small>
                                </div>
                                <div className="col-6">
                                    <h4 className="text-danger">
                                        {users.filter(u => u.role === 'admin').length}
                                    </h4>
                                    <small className="text-muted">Admins</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">Recent Activity</h6>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">
                                <i className="fas fa-info-circle me-2"></i>
                                User activity tracking will be implemented in future updates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Change Modal */}
            {showModal && selectedUser && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Change User Role</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <p><strong>User:</strong> {selectedUser.name} ({selectedUser.email})</p>
                                    <p><strong>Current Role:</strong> 
                                        <span className={`badge ms-2 ${getRoleBadgeClass(selectedUser.role)}`}>
                                            {selectedUser.role.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">New Role:</label>
                                    <select 
                                        className="form-control"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                {newRole === 'admin' && (
                                    <div className="alert alert-warning" role="alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        <strong>Warning:</strong> Admin users have full access to the system.
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary" 
                                    onClick={() => setShowModal(false)}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={updateUserRole}
                                    disabled={loading || newRole === selectedUser.role}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Role'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toast 
                show={toast.show}
                message={toast.message}
                type={toast.type}
                persistent={toast.persistent}
                onClose={hideToast}
            />
        </div>
    );
};

export default AdminUsers;
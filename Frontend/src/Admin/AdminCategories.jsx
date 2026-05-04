import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const { toast, showToast, hideToast } = useToast();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });
    const [pendingDelete, setPendingDelete] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const [categoriesResponse, productsResponse] = await Promise.all([
                axios.get('http://localhost:3000/api/categories/admin'),
                axios.get('http://localhost:3000/api/products/admin')
            ]);
            
            const categories = categoriesResponse.data;
            const products = productsResponse.data;
            
            // Count products for each category
            const categoriesWithCount = categories.map(category => {
                const productCount = products.filter(product => 
                    product.category && (product.category._id === category._id || product.category === category._id)
                ).length;
                
                return {
                    ...category,
                    productCount
                };
            });
            
            setCategories(categoriesWithCount);
        } catch (error) {
            showToast('Failed to fetch categories', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            isActive: true
        });
        setEditingCategory(null);
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                isActive: category.isActive
            });
            setEditingCategory(category);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;
            if (editingCategory) {
                response = await axios.put(`http://localhost:3000/api/categories/${editingCategory._id}`, formData);
                showToast('Category updated successfully!', 'success');
            } else {
                response = await axios.post('http://localhost:3000/api/categories', formData);
                showToast('Category created successfully!', 'success');
            }

            fetchCategories();
            handleCloseModal();
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Failed to save category',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = (categoryId, categoryName) => {
        if (pendingDelete === categoryId) {
            // Second click - confirm delete
            handleDeleteConfirm(categoryId, categoryName);
        } else {
            // First click - show confirmation
            setPendingDelete(categoryId);
            showToast(`Click delete again to confirm removing "${categoryName}"`, 'warning', true);
            // Confirmation button will stay until clicked
        }
    };

    const handleDeleteConfirm = async (categoryId, categoryName) => {
        try {
            await axios.delete(`http://localhost:3000/api/categories/${categoryId}`);
            hideToast(); // Hide persistent confirmation toast
            showToast('Category deleted successfully!', 'success');
            setPendingDelete(null);
            fetchCategories();
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Failed to delete category',
                'error'
            );
            setPendingDelete(null);
        }
    };

    const toggleCategoryStatus = async (category) => {
        try {
            await axios.put(`http://localhost:3000/api/categories/${category._id}`, {
                isActive: !category.isActive
            });
            showToast(
                `Category ${!category.isActive ? 'activated' : 'deactivated'} successfully!`,
                'success'
            );
            fetchCategories();
        } catch (error) {
            showToast('Failed to update category status', 'error');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Category Management</h4>
                <button 
                    className="btn btn-primary" 
                    onClick={() => handleOpenModal()}
                >
                    <i className="fas fa-plus me-2"></i>Add New Category
                </button>
            </div>

            {/* Categories Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Products Count</th>
                                    <th>Created Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category._id}>
                                        <td>
                                            <strong>{category.name}</strong>
                                        </td>
                                        <td>
                                            {category.description ? (
                                                <span>{category.description.substring(0, 100)}</span>
                                            ) : (
                                                <span className="text-muted">No description</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${category.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-info">{category.productCount || 0}</span>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {formatDate(category.createdAt)}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="btn-group" role="group">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => handleOpenModal(category)}
                                                    title="Edit"
                                                    style={{ boxShadow: 'none' }}
                                                >
                                                    <i className="fas fa-edit me-1"></i>Edit
                                                </button>
                                                <button 
                                                    className="btn btn-sm me-1 btn-outline-primary"
                                                    onClick={() => toggleCategoryStatus(category)}
                                                    title={category.isActive ? 'Deactivate' : 'Activate'}
                                                    style={{ boxShadow: 'none' }}
                                                >
                                                    <i className={`fas ${category.isActive ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                                                    {category.isActive ? 'Inactive' : 'Active'}
                                                </button>
                                                <button 
                                                    className={`btn btn-sm ${
                                                        pendingDelete === category._id 
                                                            ? 'btn-warning' 
                                                            : 'btn-outline-danger'
                                                    }`}
                                                    onClick={() => handleDeleteRequest(category._id, category.name)}
                                                    title="Delete"
                                                    style={{ boxShadow: 'none' }}
                                                >
                                                    <i className="fas fa-trash me-1"></i>
                                                    {pendingDelete === category._id ? 'Confirm?' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {categories.length === 0 && (
                            <div className="text-center py-4">
                                <p className="text-muted">No categories found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Category Name *</label>
                                        <input 
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                            placeholder="Enter category name"
                                        />
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea 
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Enter category description (optional)"
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input 
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            />
                                            <label className="form-check-label">
                                                Active Category
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary" 
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </button>
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
                                            editingCategory ? 'Update Category' : 'Create Category'
                                        )}
                                    </button>
                                </div>
                            </form>
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

export default AdminCategories;
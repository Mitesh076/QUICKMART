import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const { toast, showToast, hideToast } = useToast();
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        isActive: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Function to sync new product to localStorage with sequential ID
    const syncNewProductToLocalStorage = async (newProduct) => {
        try {
            // Get existing admin products
            const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            
            // Check if product already exists
            const existingIndex = adminProducts.findIndex(p => p.mongoId === newProduct._id);
            if (existingIndex >= 0) return; // Already exists
            
            // Get dummy products to calculate next ID
            const dummyResponse = await fetch('https://dummyjson.com/products?limit=20');
            let dummyProducts = [];
            if (dummyResponse.ok) {
                const dummyData = await dummyResponse.json();
                dummyProducts = dummyData.products;
            }
            
            // Calculate next sequential ID
            const dummyMaxId = Math.max(...dummyProducts.map(p => p.id), 0);
            const adminMaxId = Math.max(...adminProducts.map(p => p.id), 0);
            const nextId = Math.max(dummyMaxId, adminMaxId) + 1;
            
            // Create normalized product for localStorage
            const normalizedProduct = {
                id: nextId,
                title: newProduct.name,
                price: newProduct.price,
                brand: 'QuickMart',
                category: typeof newProduct.category === 'object' ? newProduct.category?.name : newProduct.category || 'General',
                images: [`http://localhost:3000/uploads/${newProduct.image}`],
                isBackendProduct: true,
                mongoId: newProduct._id,
                thumbnail: `http://localhost:3000/uploads/${newProduct.image}`,
                description: newProduct.description || '',
                stock: newProduct.stock || 0,
                isActive: newProduct.isActive
            };
            
            // Add to localStorage
            adminProducts.push(normalizedProduct);
            localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
            
        } catch (error) {
            console.error('Error syncing product to localStorage:', error);
        }
    };

    // Function to update product in localStorage
    const updateProductInLocalStorage = (updatedProduct) => {
        try {
            const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            const index = adminProducts.findIndex(p => p.mongoId === updatedProduct._id);
            
            if (index >= 0) {
                // Update existing product while preserving sequential ID
                adminProducts[index] = {
                    ...adminProducts[index], // Keep existing ID and other fields
                    title: updatedProduct.name,
                    price: updatedProduct.price,
                    category: typeof updatedProduct.category === 'object' ? updatedProduct.category?.name : updatedProduct.category || 'General',
                    images: [`http://localhost:3000/uploads/${updatedProduct.image}`],
                    thumbnail: `http://localhost:3000/uploads/${updatedProduct.image}`,
                    description: updatedProduct.description || '',
                    stock: updatedProduct.stock || 0,
                    isActive: updatedProduct.isActive
                };
                
                localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
            }
        } catch (error) {
            console.error('Error updating product in localStorage:', error);
        }
    };

    // Function to remove product from localStorage
    const removeProductFromLocalStorage = (mongoId) => {
        try {
            const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            const filteredProducts = adminProducts.filter(p => p.mongoId !== mongoId);
            
            localStorage.setItem('adminProducts', JSON.stringify(filteredProducts));
        } catch (error) {
            console.error('Error removing product from localStorage:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products/admin');
            setProducts(response.data);
        } catch (error) {
            showToast('Failed to fetch products', 'error');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/categories');
            setCategories(response.data);
        } catch (error) {
            showToast('Failed to fetch categories', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            category: '',
            stock: '',
            isActive: true
        });
        setImageFile(null);
        setPreviewImage('');
        setEditingProduct(null);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                description: product.description,
                category: product.category._id,
                stock: product.stock,
                isActive: product.isActive
            });
            setPreviewImage(`http://localhost:3000/uploads/${product.image}`);
            setEditingProduct(product);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('price', formData.price);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('stock', formData.stock);
            submitData.append('isActive', formData.isActive);

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            let response;
            if (editingProduct) {
                response = await axios.put(`http://localhost:3000/api/products/${editingProduct._id}`, submitData);
                showToast('Product updated successfully!', 'success');
                
                // Trigger localStorage sync for updated product
                if (response.data.product) {
                    updateProductInLocalStorage(response.data.product);
                }
            } else {
                response = await axios.post('http://localhost:3000/api/products', submitData);
                showToast('Product created successfully!', 'success');
                
                // Trigger localStorage sync for new product
                if (response.data.product) {
                    syncNewProductToLocalStorage(response.data.product);
                }
            }

            fetchProducts();
            handleCloseModal();
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Failed to save product',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = (productId, productName) => {
        if (pendingDelete === productId) {
            // Second click - confirm delete
            handleDeleteConfirm(productId, productName);
        } else {
            // First click - show confirmation
            setPendingDelete(productId);
            showToast(`Click delete again to confirm removing "${productName}"`, 'warning', true);
            // Confirmation button will stay until clicked
        }
    };

    const handleDeleteConfirm = async (productId, productName) => {
        try {
            await axios.delete(`http://localhost:3000/api/products/${productId}`);
            
            // Remove from localStorage as well
            removeProductFromLocalStorage(productId);
            
            hideToast(); // Hide persistent confirmation toast
            showToast('Product deleted successfully!', 'success');
            setPendingDelete(null);
            fetchProducts();
        } catch (error) {
            showToast('Failed to delete product', 'error');
            setPendingDelete(null);
        }
    };

    const toggleProductStatus = async (product) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/products/${product._id}`, {
                isActive: !product.isActive
            });
            
            // Update status in localStorage as well
            if (response.data.product) {
                updateProductInLocalStorage(response.data.product);
            }
            
            showToast(
                `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully!`,
                'success'
            );
            fetchProducts();
        } catch (error) {
            showToast('Failed to update product status', 'error');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Product Management</h4>
                <button 
                    className="btn btn-primary" 
                    onClick={() => handleOpenModal()}
                >
                    <i className="fas fa-plus me-2"></i>Add New Product
                </button>
            </div>

            {/* Products Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <img 
                                                src={`http://localhost:3000/uploads/${product.image}`} 
                                                alt={product.name}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                className="rounded"
                                            />
                                        </td>
                                        <td>
                                            <strong>{product.name}</strong>
                                            <br />
                                            <small className="text-muted">{product.description?.substring(0, 50)}...</small>
                                        </td>
                                        <td>{product.category?.name}</td>
                                        <td>${product.price}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <span className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group" role="group">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => handleOpenModal(product)}
                                                    title="Edit"
                                                    style={{ boxShadow: 'none' }}
                                                >
                                                    <i className="fas fa-edit me-1"></i>Edit
                                                </button>
                                                <button 
                                                    className="btn btn-sm me-1 btn-outline-primary"
                                                    onClick={() => toggleProductStatus(product)}
                                                    title={product.isActive ? 'Deactivate' : 'Activate'}
                                                    style={{ boxShadow: 'none' }}
                                                >
                                                    <i className={`fas ${product.isActive ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                                                    {product.isActive ? 'Inactive' : 'Active'}
                                                </button>
                                                <button 
                                                    className={`btn btn-sm ${
                                                        pendingDelete === product._id 
                                                            ? 'btn-warning' 
                                                            : 'btn-outline-danger'
                                                    }`}
                                                    onClick={() => handleDeleteRequest(product._id, product.name)}
                                                    title="Delete"
                                                    style={{ boxShadow: 'none' }}
                                                >
                                                    <i className="fas fa-trash me-1"></i>
                                                    {pendingDelete === product._id ? 'Confirm?' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="text-center py-4">
                                <p className="text-muted">No products found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Product Name *</label>
                                                <input 
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Price *</label>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Category *</label>
                                                <select 
                                                    className="form-control"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                    required
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(category => (
                                                        <option key={category._id} value={category._id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Stock</label>
                                                <input 
                                                    type="number"
                                                    className="form-control"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Product Image</label>
                                                <input 
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                                {previewImage && (
                                                    <div className="mt-2">
                                                        <img 
                                                            src={previewImage}
                                                            alt="Preview"
                                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                            className="rounded"
                                                        />
                                                    </div>
                                                )}
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
                                                        Active Product
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description *</label>
                                        <textarea 
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary" 
                                        onClick={handleCloseModal}
                                    >
                                        <i className="fas fa-arrow-left me-2"></i>Cancel
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
                                            editingProduct ? 'Update Product' : 'Create Product'
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

export default AdminProducts;
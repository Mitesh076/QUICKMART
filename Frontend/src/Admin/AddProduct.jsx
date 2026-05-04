import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to new admin products page
        navigate('/admin/products');
    }, [navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Redirecting...</span>
                </div>
                <p className="mt-3">Redirecting to new admin interface...</p>
            </div>
        </div>
    )
}

export default AddProduct

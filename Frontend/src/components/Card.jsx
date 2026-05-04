import React, { useState } from 'react'
import { FaEye, FaStar } from 'react-icons/fa6'
import Button from './Button'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import Toast from './Toast'
import useToast from '../hooks/useToast'

const Card = ({id, imgUrl, title, price, brand, category, stock}) => {
    // Ensure category is always a string
    const categoryName = typeof category === 'object' && category?.name ? category.name : (category || 'General');
    const { addToCart, isInCart, getItemQuantity, initialized } = useCart();
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleAddToCart = async () => {
        try {
            setLoading(true);
            const product = {
                id,
                title,
                price,
                brand,
                category,
                images: imgUrl
            };
            
            await addToCart(product);
            showToast(`${title} added to cart!`, 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast(error.message || 'Failed to add to cart', 'error');
        } finally {
            setLoading(false);
        }
    };

    const itemQuantity = getItemQuantity(id);
    const inCart = isInCart(id);
    
    return (
        <>
            <div className="col-lg-3">
                <div className="product-card position-relative">
                    <div className="category">
                        <span>{categoryName}</span>
                    </div>
                    <div className="viewicon">
                        <Link to={`/products/${id}`}>
                            <FaEye />
                        </Link>
                    </div>
                    <div className="product-image">
                        <img src={Array.isArray(imgUrl) ? imgUrl[0] : imgUrl} alt={title} className='img-fluid' />
                    </div>
                    <div className="product-info">

                        <h3 className="product-title"><a href="product-details.html">{brand}</a></h3>
                        <h3 className="product-title"><a href="product-details.html">{title}</a></h3>
                        <div className="product-price">
                            <span className="current-price">${price}</span>
                        </div>
                        {stock !== undefined && stock !== null && (
                            <div className="product-stock">
                                <small className="text-muted">In Stock: <span style={{color: "green", fontWeight: "bold"}}>{stock}</span> Items</small>
                            </div>
                        )}
                        <div className="product-rating">
                            <FaStar className='star' />
                            <FaStar className='star' />
                            <FaStar className='star' />
                            <FaStar className='star' />
                        </div>
                        
                        <div className="d-flex gap-2">
                            {initialized && inCart ? (
                                <Link to="/cart" className="btn btn-success w-50">
                                    Go to Cart ({getItemQuantity(id)})
                                </Link>
                            ) : (
                                <button 
                                    className="btn w-50"
                                    onClick={handleAddToCart}
                                    disabled={loading || !initialized}
                                    style={{ backgroundColor: 'var(--blue-color)', color: 'white' }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                            Adding...
                                        </>
                                    ) : !initialized ? (
                                        'Loading...'
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                            )}
                            <button 
                                className="btn w-50"
                                disabled={false}
                                style={{ backgroundColor: 'var(--blue-color)', color: 'white' }}
                            >
                                Buy Now
                            </button>
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
        </>
    )
}

export default Card
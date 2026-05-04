import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaRegTrashCan, FaMinus, FaPlus } from 'react-icons/fa6'
import { useCart } from '../contexts/CartContext'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleQuantityChange = (productId, action, currentQuantity) => {
        if (action === 'increase') {
            updateQuantity(productId, currentQuantity + 1);
        } else if (action === 'decrease' && currentQuantity > 1) {
            updateQuantity(productId, currentQuantity - 1);
        }
    };

    const handleRemoveItem = (productId, productName) => {
        removeFromCart(productId);
        showToast(`${productName} removed from cart`, 'success');
    };

    const [showClearConfirmation, setShowClearConfirmation] = useState(false);

    const handleClearCartRequest = () => {
        if (showClearConfirmation) {
            // Second click - confirm clear
            clearCart();
            setShowClearConfirmation(false);
            hideToast(); // Hide persistent confirmation toast
            showToast('Cart cleared successfully!', 'success');
        } else {
            // First click - show confirmation
            setShowClearConfirmation(true);
            showToast('Click Clear Cart again to confirm', 'warning', true);
            // Confirmation button will stay until clicked
        }
    };

    const tax = 27.00;
    const shipping = cartItems.length > 0 ? 4.99 : 0;
    const subtotal = getCartTotal();
    const total = subtotal + tax + (subtotal > 300 ? 0 : shipping);

    if (cartItems.length === 0) {
        return (
            <section className='cart-section' style={{ margin: "100px 0" }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 text-center">
                            <div className="empty-cart py-5">
                                <i className="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
                                <h3>Your Cart is Empty</h3>
                                <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
                                <Link to="/products" className="btn btn-lg btn-blue">
                                    <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className='cart-section' style={{ margin: "100px 0" }}>
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-lg-8">
                            <h3>Shopping Cart ({cartItems.length} items)</h3>
                        </div>
                        <div className="col-lg-4 text-end">
                            <button 
                                className={`btn btn-sm d-inline-flex align-items-center ${
                                    showClearConfirmation ? 'btn-warning' : 'btn-primary'
                                }`}
                                onClick={handleClearCartRequest}
                                disabled={loading}
                            >
                                <FaRegTrashCan className="me-1" style={{ fontSize: '12px' }} /> 
                                {showClearConfirmation ? 'Confirm Clear?' : 'Clear Cart'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-lg-7">
                            <div className="cart-items">
                                <div className="cart-header mb-3">
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <h5>Product</h5>
                                        </div>
                                        <div className="col-lg-2">
                                            <h5>Price</h5>
                                        </div>
                                        <div className="col-lg-2">
                                            <h5>Quantity</h5>
                                        </div>
                                        <div className="col-lg-2">
                                            <h5>Total</h5>
                                        </div>
                                    </div>
                                </div>

                                {cartItems.map((item) => (
                                    <div key={item.id} className="cart-item mb-3">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="product-info d-flex align-items-center">
                                                    <div className="product-image me-3">
                                                        <img 
                                                            src={Array.isArray(item.images) ? item.images[0] : item.images} 
                                                            className='img-fluid' 
                                                            alt={item.title}
                                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div className="product-detail flex-grow-1">
                                                        <h6 className="product-title mb-2">{item.title}</h6>
                                                        <div className="product-meta mb-2">
                                                            <span className="product-brand">Brand: {item.brand}</span>
                                                            <span className="product-category">Category: {item.category}</span>
                                                        </div>
                                                        <div className="remove-product">
                                                            <a 
                                                                href="#"
                                                                className="text-danger d-flex align-items-center"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleRemoveItem(item.id, item.title);
                                                                }}
                                                                style={{ 
                                                                    textDecoration: 'none', 
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <FaRegTrashCan className="me-1" style={{ fontSize: '12px' }} /> Remove
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-2">
                                                <div className="price-tag">
                                                    <span className="current-price">${parseFloat(item.price).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="col-lg-2">
                                                <div className="quantity-controls">
                                                    <div className="d-flex align-items-center" style={{maxWidth: '120px'}}>
                                                        <button 
                                                            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.id, 'decrease', item.quantity)}
                                                            disabled={item.quantity <= 1}
                                                            style={{width: '32px', height: '32px', padding: '0'}}
                                                        >
                                                            <FaMinus size={12} />
                                                        </button>
                                                        <input 
                                                            type="text" 
                                                            className="form-control text-center mx-1" 
                                                            value={item.quantity}
                                                            readOnly
                                                            style={{width: '50px', height: '32px', padding: '0'}}
                                                        />
                                                        <button 
                                                            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.id, 'increase', item.quantity)}
                                                            style={{width: '32px', height: '32px', padding: '0'}}
                                                        >
                                                            <FaPlus size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-2">
                                                <div className="item-total">
                                                    <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="col-lg-1"></div>
                        
                        <div className="col-lg-4">
                            <div className="cart-summary">
                                <h4 className="summary-title">Order Summary</h4>
                                <div className="summary-item d-flex justify-content-between">
                                    <span className="summary-label">Subtotal ({cartItems.length} items)</span>
                                    <span className="summary-value">${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="summary-item shipping-item">
                                    <span className="summary-label">Shipping</span>
                                    <div className="shipping-options">
                                        {subtotal > 300 ? (
                                            <div className="text-success">
                                                <i className="fas fa-check me-2"></i>
                                                Free Shipping (Orders over $300)
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="shipping" id="standard" defaultChecked />
                                                    <label className="form-check-label" htmlFor="standard">
                                                        Standard Delivery - $4.99
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="shipping" id="express" />
                                                    <label className="form-check-label" htmlFor="express">
                                                        Express Delivery - $12.99
                                                    </label>
                                                </div>
                                                <small className="text-muted">
                                                    Add ${(300 - subtotal).toFixed(2)} more for free shipping
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="summary-item">
                                    <span className="summary-label">Tax</span>
                                    <span className="summary-value">${tax.toFixed(2)}</span>
                                </div>

                                <div className="summary-item disc">
                                    <span className="summary-label">Discount</span>
                                    <span className="summary-value">-$0.00</span>
                                </div>

                                <div className="summary-total">
                                    <span className="summary-label">Total</span>
                                    <span className="summary-value">${total.toFixed(2)}</span>
                                </div>
                                
                                <div className="mt-4">
                                    <button 
                                        className="btn btn-primary w-100 mb-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            'Proceed to Checkout'
                                        )}
                                    </button>
                                    <Link to="/products" className="btn btn-outline-success w-100">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <Toast 
                show={toast.show}
                message={toast.message}
                type={toast.type}
                persistent={toast.persistent}
                onClose={hideToast}
            />
        </>
    )
}

export default Cart
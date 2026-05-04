import React, { useState } from 'react'
import { FaRegTrashCan, FaMinus, FaPlus } from 'react-icons/fa6'

const CartDesign = () => {
    const [quantity, setQuantity] = useState(1);
    const itemPrice = 89.99;
    const tax = 27.00;
    const shipping = 4.99;

    const handleQuantityChange = (action) => {
        if (action === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (action === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const subtotal = itemPrice * quantity;
    const total = subtotal + tax + shipping;

    return (
        <>
            <section className='cart-section' style={{ margin: "100px 0" }}>
                <div className="container">
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

                                <div className="cart-item">
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="product-info d-flex align-items-center justify-content-between ">
                                                <div className="product-image">
                                                    <img src="https://bootstrapmade.com/content/demo/eStore/assets/img/product/product-2.webp" className='img-fluid' alt="" />
                                                </div>
                                                <div className="product-detail">
                                                    <h6 className="product-title">Ergonomic Office Chair</h6>
                                                    <div className="product-meta">
                                                        <span className="product-color">Color: Black</span>
                                                        <span className="product-size">Size: M</span>
                                                    </div>
                                                    <div className="remove-product">
                                                        <a href='#'><FaRegTrashCan /> Remove</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2">
                                            <div className="price-tag">
                                                <span className="current-price">$89.99</span>
                                            </div>
                                        </div>
                                        <div className="col-lg-2">
                                            <div className="quantity-controls">
                                                <div className="d-flex align-items-center" style={{maxWidth: '120px'}}>
                                                    <button 
                                                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                                        type="button"
                                                        onClick={() => handleQuantityChange('decrease')}
                                                        disabled={quantity <= 1}
                                                        style={{width: '32px', height: '32px', padding: '0', boxShadow: 'none', outline: 'none'}}
                                                        onFocus={(e) => e.target.style.boxShadow = 'none'}
                                                    >
                                                        <FaMinus size={12} />
                                                    </button>
                                                    <input 
                                                        type="text" 
                                                        className="form-control text-center mx-1" 
                                                        value={quantity}
                                                        readOnly
                                                        style={{width: '50px', height: '32px', padding: '0', boxShadow: 'none', outline: 'none'}}
                                                        onFocus={(e) => e.target.style.boxShadow = 'none'}
                                                    />
                                                    <button 
                                                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                                        type="button"
                                                        onClick={() => handleQuantityChange('increase')}
                                                        style={{width: '32px', height: '32px', padding: '0', boxShadow: 'none', outline: 'none'}}
                                                        onFocus={(e) => e.target.style.boxShadow = 'none'}
                                                    >
                                                        <FaPlus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2">
                                            <div className="item-total">
                                                <span>${(89.99 * quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="col-lg-1"></div>
                        <div className="col-lg-3">
                            <div className="cart-summary">
                                <h4 className="summary-title">Order Summary</h4>
                                <div className="summary-item d-flex justify-content-between">
                                    <span className="summary-label">Subtotal</span>
                                    <span className="summary-value">${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="summary-item shipping-item">
                                    <span className="summary-label">Shipping</span>
                                    <div className="shipping-options">
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
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="shipping" id="free" />
                                            <label className="form-check-label" htmlFor="free">
                                                Free Shipping (Orders over $300)
                                            </label>
                                        </div>
                                    </div>


                                </div>

                                <div className="summary-item">
                                    <span className="summary-label">Tax</span>
                                    <span className="summary-value">$27.00</span>
                                </div>

                                <div className="summary-item disc ">
                                    <span className="summary-label">Discount</span>
                                    <span className="summary-value">-$0.00</span>
                                </div>

                                <div className="summary-total">
                                    <span className="summary-label">Total</span>
                                    <span className="summary-value">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default CartDesign
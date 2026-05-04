import React, { useState } from 'react'
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { useCart } from '../contexts/CartContext'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

const ProductDetail = () => {

    const {id} = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [addingToCart, setAddingToCart] = useState(false)
    const { addToCart, isInCart, getItemQuantity } = useCart()
    const { toast, showToast, hideToast } = useToast()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productId = parseInt(id)
                
                // First, check if this is an admin product (stored in localStorage)
                const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
                const adminProduct = adminProducts.find(p => p.id === productId && p.isActive !== false)
                
                if (adminProduct) {
                    // Found in admin products localStorage (and it's active)
                    setProduct(adminProduct)
                    setLoading(false)
                    return
                }
                
                // If not found in admin products, try DummyJSON API first (for IDs 1-20)
                try {
                    const dummyResponse = await fetch(`https://dummyjson.com/products/${id}`)
                    if (dummyResponse.ok) {
                        const data = await dummyResponse.json()
                        const normalizedProduct = {
                            ...data,
                            title: data.title,
                            images: data.images,
                            description: data.description || 'No description available',
                            brand: data.brand || 'QuickMart',
                            stock: data.stock || 0,
                            id: data.id
                        }
                        setProduct(normalizedProduct)
                        setLoading(false)
                        return
                    }
                } catch (dummyError) {
                }
                
                // If not found in DummyJSON, try backend API (fallback)
                try {
                    const backendResponse = await fetch(`http://localhost:3000/api/products/${id}`)
                    if (backendResponse.ok) {
                        const data = await backendResponse.json()
                        const normalizedProduct = {
                            ...data,
                            title: data.title || data.name,
                            images: data.images || (data.image ? [`http://localhost:3000/uploads/${data.image}`] : []),
                            description: data.description || 'No description available',
                            brand: data.brand || 'QuickMart',
                            stock: data.stock || data.quantity || 0,
                            id: data.id || data._id
                        }
                        setProduct(normalizedProduct)
                        setLoading(false)
                        return
                    }
                } catch (backendError) {
                }
                
                // If not found anywhere, show error
                throw new Error('Product not found')
                
            } catch (error) {
                setError(error.message)
                setLoading(false)
            }
        }
        
        fetchProduct()
    },[id])

    const handleAddToCart = async () => {
        try {
            setAddingToCart(true)
            const productData = {
                id: product.id,
                title: product.title,
                price: product.price,
                brand: product.brand,
                category: typeof product.category === 'object' ? product.category?.name : product.category,
                images: product.images
            }
            
            await addToCart(productData)
            showToast(`${product.title} added to cart!`, 'success')
        } catch (error) {
            console.error('Error adding to cart:', error)
            showToast(error.message || 'Failed to add to cart', 'error')
        } finally {
            setAddingToCart(false)
        }
    }

    if (loading) {
        return <LoadingSpinner text="Loading product details..." />
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="text-center">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Error!</h4>
                        <p>{error}</p>
                        <hr />
                        <p className="mb-0">Please try going back or contact support if the problem persists.</p>
                    </div>
                </div>
            </div>
        )
    }

  return (
    <>
        <div className="container">
            <div className="row my-5">
            <div className="col-lg-6">
                <div className="product-img">
                    <img 
                        src={Array.isArray(product.images) ? product.images[0] : product.images} 
                        alt={product.title} 
                        className='img-fluid' 
                    />
                </div>
            </div>
            <div className="col-lg-6">
                <div className="product-content">
                    <h6 className='text-uppercase'>{typeof product.category === 'object' && product.category?.name ? product.category.name : (product.category || 'General')}</h6>
                    <h2>{product.title}</h2>
                    <div className="product-price">
                        <span className="current-price">${product.price}</span>
                    </div>
                    <p>{product.description}</p>
                    <p>In Stock <span style={{color: "green", fontWeight: "bold"}}>{product.stock}</span> Items</p>

                    <div className="d-flex">
                        {isInCart(product.id) ? (
                            <>
                                <Link to="/cart" className="btn btn-success w-50 me-2">
                                    Go to Cart
                                </Link>
                                <Button title={"Buy Now"} className={"w-50"} />
                            </>
                        ) : (
                            <>
                                <button 
                                    className="btn w-50 me-2"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    style={{ backgroundColor: 'var(--blue-color)', color: 'white' }}
                                >
                                    {addingToCart ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                                <Button title={"Buy Now"} className={"w-50"} />
                            </>
                        )}
                    </div>
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

export default ProductDetail
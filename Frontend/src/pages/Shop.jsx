import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'

const Shop = () => {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendProductCount, setBackendProductCount] = useState(0)

  // Helper function to get next sequential ID for admin products
  const getNextProductId = (dummyProducts) => {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    const dummyMaxId = Math.max(...dummyProducts.map(p => p.id), 0)
    const adminMaxId = Math.max(...adminProducts.map(p => p.id), 0)
    return Math.max(dummyMaxId, adminMaxId) + 1
  }

  // Helper function to store admin product in localStorage
  const storeAdminProduct = (product, sequentialId) => {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    const normalizedProduct = {
      id: sequentialId,
      title: product.name,
      price: product.price,
      brand: 'QuickMart',
      category: typeof product.category === 'object' ? product.category?.name : product.category || 'General',
      images: [`http://localhost:3000/uploads/${product.image}`],
      isBackendProduct: true,
      mongoId: product._id, // Keep reference to MongoDB ID
      thumbnail: `http://localhost:3000/uploads/${product.image}`,
      description: product.description || '',
      stock: product.stock || 0
    }
    
    // Check if already exists (by mongoId)
    const existingIndex = adminProducts.findIndex(p => p.mongoId === product._id)
    if (existingIndex >= 0) {
      adminProducts[existingIndex] = normalizedProduct
    } else {
      adminProducts.push(normalizedProduct)
    }
    
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts))
    return normalizedProduct
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let allProducts = []
      let dummyProducts = []
      
      // First, always load admin products from localStorage (they take priority)
      const existingAdminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
      
      // Fetch dummy products
      try {
        const dummyResponse = await fetch('https://dummyjson.com/products?limit=20')
        if (dummyResponse.ok) {
          const dummyData = await dummyResponse.json()
          dummyProducts = dummyData.products.map(product => ({
            ...product,
            isBackendProduct: false
          }))
          allProducts = [...dummyProducts]
        }
      } catch (error) {
        console.error('Error fetching dummy products:', error)
      }
      
      // Only fetch from backend if we don't have admin products stored locally
      // OR if we need to sync new products (this should be rare)
      let shouldFetchFromBackend = existingAdminProducts.length === 0
      
      if (shouldFetchFromBackend) {
        try {
          const backendResponse = await axios.get('http://localhost:3000/api/products')
          const backendProducts = backendResponse.data
          let nextId = getNextProductId(dummyProducts)
          
          // Process and store each backend product with sequential ID
          backendProducts.forEach(product => {
            // Check if this MongoDB product is already stored
            const existingIndex = existingAdminProducts.findIndex(p => p.mongoId === product._id)
            if (existingIndex === -1) {
              storeAdminProduct(product, nextId)
              nextId++
            }
          })
          
          setBackendProductCount(backendProducts.length)
        } catch (error) {
          console.error('Error fetching backend products:', error)
          setBackendProductCount(0)
        }
      } else {
        // We have existing admin products, just set the count
        setBackendProductCount(existingAdminProducts.length)
      }
      
      // Load final admin products from localStorage (only active ones)
      const finalAdminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
        .filter(product => product.isActive !== false) // Show products that are active or don't have isActive field
      allProducts = [...allProducts, ...finalAdminProducts]
      
      setProducts(allProducts)
      setLoading(false)
      
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProducts()
  }, [])


  // Listen for storage events to refresh when admin adds new products
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'adminProducts') {
        fetchProducts()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (loading) {
    return <LoadingSpinner text="Loading products..." />
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
        <div className="container my-3">
          <div className="row ">
            <div className="text-center mb-4">
              <h2>Best Sellers</h2>
              <p>Discover our most popular products from electronics to home goods - find everything you need in one place</p>
              
              {/* Product Statistics */}
              <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 mb-3">
                <div className="badge bg-primary">
                  Total Products: {products.length}
                </div>
                <button 
                  className="badge bg-outline-primary btn btn-outline-primary" 
                  onClick={fetchProducts}
                  disabled={loading}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: 'auto' }}
                >
                  {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
            </div>
            
            {
              products.map((product) => {
                return (
                  <Card 
                    key={product.id} 
                    id={product.id} 
                    imgUrl={product.images} 
                    title={product.title} 
                    price={product.price} 
                    brand={product.brand} 
                    category={product.category}
                    stock={product.stock}
                  />
                )
              })
            }
            
            {products.length === 0 && !loading && (
              <div className="col-12 text-center py-5">
                <h4>No products available</h4>
                <p className="text-muted">Products added through the admin panel will appear here.</p>
              </div>
            )}

          </div>
        </div>
    </>
  )
}

export default Shop
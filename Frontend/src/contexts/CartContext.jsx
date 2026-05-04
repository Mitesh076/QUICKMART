import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(null);
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    // Load cart from localStorage only (now handles all products)
    const fetchCart = async () => {
        setLoading(true);
        setError(null);
        try {
            // Load cart items from localStorage
            const userId = user?._id || user?.id;
            const cartKey = userId && isAuthenticated() ? `cart_${userId}` : 'cart_guest';
            const localCart = localStorage.getItem(cartKey);
            let cartItems = [];
            
            if (localCart) {
                const items = JSON.parse(localCart);
                cartItems = Array.isArray(items) ? items : [];
            }

            setCartItems(cartItems);
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            setError('Failed to load cart');
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };


    // Initialize cart when auth is ready
    useEffect(() => {
        if (!authLoading && !initialized) {
            // Clean up localStorage first to remove any corrupted data
            cleanupLocalStorageCart();
            
            // Load cart from localStorage (works for all users and all products)
            fetchCart().finally(() => setInitialized(true));
        }
    }, [authLoading, initialized]);
    
    // Also reinitialize when user changes (login/logout)
    useEffect(() => {
        if (!authLoading && initialized) {
            fetchCart();
        }
    }, [user?.id, user?._id]);

    const addToCart = async (product, quantity = 1) => {
        // Now ALL products (dummy + admin) are handled via localStorage
        // since admin products are stored with sequential IDs like dummy products
        return new Promise((resolve) => {
            addToLocalStorage(product, quantity);
            // Use setTimeout to ensure state update has been processed
            setTimeout(() => {
                resolve({ success: true, message: 'Item added to cart' });
            }, 50);
        });
    };

    const addToLocalStorage = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const productId = String(product.id || '').trim();
            const existingItem = prevItems.find(item => {
                const itemId = String(item.id || '').trim();
                return itemId === productId;
            });
            let newItems;
            
            if (existingItem) {
                newItems = prevItems.map(item => {
                    const itemId = String(item.id || '').trim();
                    return itemId === productId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item;
                });
            } else {
                // Normalize product data for consistent structure
                const normalizedProduct = {
                    id: product.id,
                    title: product.name || product.title,
                    name: product.name || product.title,
                    price: product.price,
                    images: product.images || product.image || [product.thumbnail] || [],
                    brand: product.brand || 'QuickMart',
                    category: typeof product.category === 'object' ? product.category?.name : product.category || 'General',
                    quantity,
                    addedAt: new Date().toISOString()
                };
                
                newItems = [...prevItems, normalizedProduct];
            }
            
            // Save to localStorage 
            const userId = user?._id || user?.id;
            const cartKey = userId && isAuthenticated() ? `cart_${userId}` : 'cart_guest';
            localStorage.setItem(cartKey, JSON.stringify(newItems));
            return newItems;
        });
    };

    const removeFromCart = async (productId) => {
        // Now ALL products are handled via localStorage only
        removeFromLocalStorage(productId);
    };

    const removeFromLocalStorage = (productId) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => {
                const itemId = String(item.id || '').trim();
                const targetId = String(productId).trim();
                return itemId !== targetId;
            });
            const userId = user?._id || user?.id;
            const cartKey = userId && isAuthenticated() ? `cart_${userId}` : 'cart_guest';
            localStorage.setItem(cartKey, JSON.stringify(newItems));
            return newItems;
        });
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        // Now ALL products are handled via localStorage only
        updateQuantityInLocalStorage(productId, quantity);
    };

    const updateQuantityInLocalStorage = (productId, quantity) => {
        setCartItems(prevItems => {
            const newItems = prevItems.map(item => {
                const itemId = String(item.id || '').trim();
                const targetId = String(productId).trim();
                return itemId === targetId
                    ? { ...item, quantity: parseInt(quantity) }
                    : item;
            });
            const userId = user?._id || user?.id;
            const cartKey = userId && isAuthenticated() ? `cart_${userId}` : 'cart_guest';
            localStorage.setItem(cartKey, JSON.stringify(newItems));
            return newItems;
        });
    };

    const clearCart = async () => {
        // Now ALL products are handled via localStorage only
        clearLocalStorageCart();
    };

    // Fallback function for guest users
    const clearLocalStorageCart = () => {
        setCartItems([]);
        const getCartKey = () => {
            // Check multiple possible user ID fields for compatibility
            const userId = user?._id || user?.id;
            if (isAuthenticated() && userId) {
                return `cart_${userId}`;
            }
            return 'cart_guest';
        };
        localStorage.removeItem(getCartKey());
        localStorage.removeItem('cart_guest'); // Clear guest cart as well
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const isInCart = (productId) => {
        // Now all products have numeric IDs, so simple comparison
        const normalizedProductId = productId ? String(productId).trim() : '';
        if (!normalizedProductId) return false;
        
        return cartItems.some(item => {
            const itemId = String(item.id || '').trim();
            return itemId === normalizedProductId;
        });
    };

    const getItemQuantity = (productId) => {
        const normalizedProductId = productId ? String(productId).trim() : '';
        if (!normalizedProductId) return 0;
        
        const item = cartItems.find(item => {
            const itemId = String(item.id || '').trim();
            return itemId === normalizedProductId;
        });
        return item ? item.quantity : 0;
    };

    const refreshCart = async () => {
        if (!authLoading) {
            await fetchCart();
        }
    };

    // Utility function to clean up localStorage cart data
    const cleanupLocalStorageCart = () => {
        const userId = user?._id || user?.id;
        const cartKey = userId && isAuthenticated() ? `cart_${userId}` : 'cart_guest';
        const localCart = localStorage.getItem(cartKey);
        
        if (localCart) {
            try {
                const items = JSON.parse(localCart);
                if (Array.isArray(items)) {
                    // Ensure all items have valid numeric IDs
                    const validItems = items.filter(item => {
                        const itemId = String(item.id || '');
                        return /^\d+$/.test(itemId); // Keep only numeric IDs
                    });
                    
                    if (validItems.length !== items.length) {
                        localStorage.setItem(cartKey, JSON.stringify(validItems));
                    }
                }
            } catch (error) {
                console.error('Error cleaning up localStorage cart:', error);
                localStorage.removeItem(cartKey);
            }
        }
    };

    const value = {
        cartItems,
        loading,
        error,
        initialized,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        isInCart,
        getItemQuantity,
        refreshCart,
        clearError: () => setError(null)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
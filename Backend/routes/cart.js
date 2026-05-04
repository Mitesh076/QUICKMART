const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        
        if (!cart) {
            // Create empty cart if doesn't exist
            cart = new Cart({
                user: req.user.id,
                items: []
            });
            await cart.save();
        }

        // Verify products still exist and update prices if needed
        const updatedItems = [];
        let hasChanges = false;

        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (product && product.isActive) {
                // Update product snapshot if price changed
                if (item.productSnapshot.price !== product.price) {
                    item.productSnapshot.price = product.price;
                    item.productSnapshot.name = product.name;
                    item.productSnapshot.title = product.name;
                    item.productSnapshot.images = `http://localhost:3000/uploads/${product.image}`;
                    item.productSnapshot.image = `http://localhost:3000/uploads/${product.image}`;
                    item.productSnapshot.brand = product.brand || 'QuickMart';
                    item.productSnapshot.category = product.category?.name || 'General';
                    hasChanges = true;
                }
                updatedItems.push(item);
            } else {
                hasChanges = true; // Product removed or inactive
            }
        }

        if (hasChanges) {
            cart.items = updatedItems;
            await cart.save();
        }

        // Normalize cart items to ensure consistent ID format for frontend
        const normalizedItems = cart.items.map(item => ({
            ...item.toObject(),
            product: String(item.product), // Ensure string format
            productSnapshot: {
                ...item.productSnapshot,
                // Ensure title is always available
                title: item.productSnapshot.name || item.productSnapshot.title,
                name: item.productSnapshot.name || item.productSnapshot.title
            }
        }));

        res.json({
            success: true,
            cart: {
                items: normalizedItems,
                totalAmount: cart.totalAmount,
                totalItems: cart.totalItems,
                lastModified: cart.lastModified
            }
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching cart',
            error: error.message 
        });
    }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product exists and is active
        const product = await Product.findById(productId).populate('category');
        if (!product || !product.isActive) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found or inactive' 
            });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Only ${product.stock} items available in stock` 
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity of existing item
            const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
            
            // Check stock for new quantity
            if (product.stock < newQuantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot add ${quantity} more. Only ${product.stock - cart.items[existingItemIndex].quantity} more items available` 
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].addedAt = Date.now();
        } else {
            // Add new item to cart
            const cartItem = {
                product: productId,
                productSnapshot: {
                    name: product.name,
                    title: product.name, // Add title for frontend compatibility
                    price: product.price,
                    images: `http://localhost:3000/uploads/${product.image}`, // Full image URL
                    image: `http://localhost:3000/uploads/${product.image}`, // Backup field name
                    brand: product.brand || 'QuickMart', // Default brand since model doesn't have it
                    category: product.category?.name || 'General'
                },
                quantity: parseInt(quantity)
            };
            cart.items.push(cartItem);
        }

        await cart.save();

        // Normalize cart items for frontend consistency
        const normalizedItems = cart.items.map(item => ({
            ...item.toObject(),
            product: String(item.product),
            productSnapshot: {
                ...item.productSnapshot,
                title: item.productSnapshot.name || item.productSnapshot.title,
                name: item.productSnapshot.name || item.productSnapshot.title
            }
        }));

        res.json({
            success: true,
            message: 'Item added to cart successfully',
            cart: {
                items: normalizedItems,
                totalAmount: cart.totalAmount,
                totalItems: cart.totalItems
            }
        });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding item to cart',
            error: error.message 
        });
    }
});

// Update item quantity in cart
router.put('/update', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity cannot be negative' 
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in cart' 
            });
        }

        if (quantity === 0) {
            // Remove item if quantity is 0
            cart.items.splice(itemIndex, 1);
        } else {
            // Validate stock
            const product = await Product.findById(productId);
            if (!product || product.stock < quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Only ${product?.stock || 0} items available in stock` 
                });
            }

            cart.items[itemIndex].quantity = parseInt(quantity);
            cart.items[itemIndex].addedAt = Date.now();
        }

        await cart.save();

        // Normalize cart items for frontend consistency
        const normalizedItems = cart.items.map(item => ({
            ...item.toObject(),
            product: String(item.product),
            productSnapshot: {
                ...item.productSnapshot,
                title: item.productSnapshot.name || item.productSnapshot.title,
                name: item.productSnapshot.name || item.productSnapshot.title
            }
        }));

        res.json({
            success: true,
            message: 'Cart updated successfully',
            cart: {
                items: normalizedItems,
                totalAmount: cart.totalAmount,
                totalItems: cart.totalItems
            }
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating cart',
            error: error.message 
        });
    }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in cart' 
            });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        // Normalize cart items for frontend consistency
        const normalizedItems = cart.items.map(item => ({
            ...item.toObject(),
            product: String(item.product),
            productSnapshot: {
                ...item.productSnapshot,
                title: item.productSnapshot.name || item.productSnapshot.title,
                name: item.productSnapshot.name || item.productSnapshot.title
            }
        }));

        res.json({
            success: true,
            message: 'Item removed from cart successfully',
            cart: {
                items: normalizedItems,
                totalAmount: cart.totalAmount,
                totalItems: cart.totalItems
            }
        });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error removing item from cart',
            error: error.message 
        });
    }
});

// Clear entire cart
router.delete('/clear', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared successfully',
            cart: {
                items: [],
                totalAmount: 0,
                totalItems: 0
            }
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing cart',
            error: error.message 
        });
    }
});

// Migrate localStorage cart to database (for initial migration)
router.post('/migrate', auth, async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.json({
                success: true,
                message: 'No items to migrate'
            });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Process each item from localStorage
        for (const localItem of items) {
            const product = await Product.findById(localItem.id || localItem._id).populate('category');
            if (product && product.isActive) {
                // Check if item already exists in cart
                const existingIndex = cart.items.findIndex(
                    item => item.product.toString() === product._id.toString()
                );

                if (existingIndex > -1) {
                    // Update quantity if item exists
                    cart.items[existingIndex].quantity = Math.max(
                        cart.items[existingIndex].quantity,
                        parseInt(localItem.quantity) || 1
                    );
                } else {
                    // Add new item
                    cart.items.push({
                        product: product._id,
                        productSnapshot: {
                            name: product.name,
                            title: product.name,
                            price: product.price,
                            images: `http://localhost:3000/uploads/${product.image}`,
                            image: `http://localhost:3000/uploads/${product.image}`,
                            brand: product.brand || 'QuickMart',
                            category: product.category?.name || 'General'
                        },
                        quantity: parseInt(localItem.quantity) || 1
                    });
                }
            }
        }

        await cart.save();

        // Normalize cart items for frontend consistency
        const normalizedItems = cart.items.map(item => ({
            ...item.toObject(),
            product: String(item.product),
            productSnapshot: {
                ...item.productSnapshot,
                title: item.productSnapshot.name || item.productSnapshot.title,
                name: item.productSnapshot.name || item.productSnapshot.title
            }
        }));

        res.json({
            success: true,
            message: 'Cart migrated successfully',
            cart: {
                items: normalizedItems,
                totalAmount: cart.totalAmount,
                totalItems: cart.totalItems
            }
        });
    } catch (error) {
        console.error('Error migrating cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error migrating cart',
            error: error.message 
        });
    }
});

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        // Simply accept all image files - let browser/OS handle the detection
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        
        // Also check by file extension as fallback
        const allowedExts = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.avif'];
        
        if (allowedExts.includes(fileExt)) {
            return cb(null, true);
        }
        
        cb(new Error(`Unsupported file type. Please upload: JPEG, PNG, GIF, WebP, or AVIF images. Detected: ${file.mimetype} (${fileExt})`));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all products (admin - includes inactive)
router.get('/admin', adminAuth, async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create product (admin only)
router.post('/', adminAuth, upload.single("image"), [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('stock').optional().isNumeric().withMessage('Stock must be a number')
], async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Product image is required' });
        }

        const { name, price, description, category, stock, brand } = req.body;

        // Verify category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const product = new Product({
            name,
            price: parseFloat(price),
            description,
            category,
            brand: brand || 'QuickMart',
            stock: stock ? parseInt(stock) : 0,
            image: req.file.filename
        });

        await product.save();
        await product.populate('category', 'name');

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update product (admin only)
router.put('/:id', adminAuth, upload.single("image"), [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('stock').optional().isNumeric().withMessage('Stock must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, price, description, category, stock, isActive } = req.body;

        // Verify category if provided
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            product.category = category;
        }

        // Update fields
        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = parseFloat(price);
        if (description !== undefined) product.description = description;
        if (stock !== undefined) product.stock = parseInt(stock);
        if (isActive !== undefined) product.isActive = isActive;
        if (req.file) product.image = req.file.filename;

        await product.save();
        await product.populate('category', 'name');

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
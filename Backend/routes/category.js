const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all categories (admin - includes inactive)
router.get('/admin', adminAuth, async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create category (admin only)
router.post('/', adminAuth, [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({ name, description });
        await category.save();
        
        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update category (admin only)
router.put('/:id', adminAuth, [
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
    body('description').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { name, description, isActive } = req.body;

        // Check if new name already exists (excluding current category)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp('^' + name + '$', 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category name already exists' });
            }
            category.name = name;
        }

        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();
        
        res.json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if category has associated products
        const Product = require('../models/Product');
        const productsCount = await Product.countDocuments({ category: req.params.id });
        if (productsCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete category. It has ${productsCount} associated products.` 
            });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
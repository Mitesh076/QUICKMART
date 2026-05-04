const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // Store product details for faster access and historical data
    productSnapshot: {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        images: { type: String, required: true },
        brand: String,
        category: String
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Each user has only one cart
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    // For guest carts (temporary solution)
    sessionId: {
        type: String,
        sparse: true, // Allows null values but ensures uniqueness when present
        unique: true
    },
    isGuest: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.items.reduce((total, item) => total + (item.productSnapshot.price * item.quantity), 0);
    this.lastModified = Date.now();
    next();
});

// Index for better performance (user and sessionId already have unique indexes)
cartSchema.index({ lastModified: -1 });

// Clean up old guest carts (older than 30 days)
cartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { isGuest: true } });

module.exports = mongoose.model('Cart', cartSchema);
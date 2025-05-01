const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,  // The price in the smallest unit (e.g., cents or euros)
  currency: { type: String, default: 'eur' },
  stripe_product_id: String,  // The ID from Stripe for the product
  stripe_price_id: String,    // The ID from Stripe for the price
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  coinAmount: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('Product', productSchema);

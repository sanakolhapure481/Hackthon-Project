import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true }, // kg, liter, etc.
  category: { 
    type: String, 
    enum: ['vegetables', 'grains', 'spices', 'oils', 'dairy', 'meat', 'others'],
    required: true 
  },
  stock: { type: Number, required: true },
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  description: { type: String },
  images: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
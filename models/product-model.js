const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
    id: {type: Number, unique: true, required: true},
    imageUrl: {type: String, required: true},
    title: {type: String, required: true},
    types: {type: [Number], required: true},
    sizes: {type: [Number], required: true},
    price: {type: Number, required: true},
    category: {type: Number, required: true},
    rating: {type: Number, default: 0},
});

module.exports = model('Product', ProductSchema);

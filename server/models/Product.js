import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    originalPrice: {
        type: Number,
        default: 0,
    },
    discount: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        required: true,
    },
    subCategory: {
        type: String,
        default: '',
    },
    sizes: {
        type: [String],
        default: [],
    },
    colors: {
        type: [String],
        default: [],
    },
    material: {
        type: String,
        default: '',
    },
    dimensions: {
        type: String,
        default: '',
    },
    components: {
        type: String,
        default: '',
    },
    ecoFeatures: {
        type: String,
        default: '',
    },
    countryOfOrigin: {
        type: String,
        default: 'India',
    },
    artisanImage: {
        type: String,
        default: '',
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;

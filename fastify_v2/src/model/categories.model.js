const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    category_name: {type: String, required: true, unique: true},
    slug: {type: String, required: true},
    sort_order: {type: Number, required: true},
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    // parent: {type: Number, required: true},
    status: {type: Number, required: true},
    created_at: {type: Date, default: Date.now},
});

//create a virtual property `id` that aliases `_id`
categorySchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
categorySchema.set('toJSON', {
    virtuals: true,
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
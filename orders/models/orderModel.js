const mongoose = require('mongoose');

const orderModelSchema = new mongoose.Schema(
    {
        distance: Number,
        status: String,
        origin: Array,
        destination: Array,
        createdAt: {type: Date},
        updatedAt: {type: Date, default: Date.now}
    },
    {
        collection: 'orders'
    }
);

module.exports = mongoose.model('orderModel', orderModelSchema);
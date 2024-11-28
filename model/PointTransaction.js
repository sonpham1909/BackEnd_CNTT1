const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    solAmount: {
        type: Number,
        required: true,
    },
    transactionSignature: {
        type: String,
        unique: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    }
},{timestamps:true} );

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);

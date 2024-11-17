const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
      
    },
    point: {
        type: Number,
        default: 0
    },
    songHeard: {
        type: Number,
        default: 0
    },
    songsToday: {
        type: Number,
        default: 0
    },
    lastCheckInDate: {
        type: Date,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    publicKey: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const TokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60 // Automatically delete after 7 days (token expiry time)
    }
});

module.exports = mongoose.model('BlacklistedToken', TokenBlacklistSchema);

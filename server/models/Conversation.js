
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'New Conversation'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Conversation', ConversationSchema);

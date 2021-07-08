const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    content: { type: String, required: true },
    gameId: { type: Number, required: true },
    date: { type: Date, required: true }
}, { collection: 'users'} );

module.exports = mongoose.model('CommentSchema', CommentSchema);
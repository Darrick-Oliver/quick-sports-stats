const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true },
    gameId: { type: Number, required: true },
    parentId: { type: String, required: true },
    parentUser: { type: String, required: true },
    date: { type: Date, required: true }
}, { collection: 'comments'} );

module.exports = mongoose.model('CommentSchema', CommentSchema);
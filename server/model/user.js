const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true },
    favNBA: { type: String, required: true },
    favMLS: { type: String, required: true }
}, { collection: 'users'} );

module.exports = mongoose.model('UserSchema', UserSchema);
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true
    },
    favNBA: {
        type: String,
        required: true
    },
    favMLS: {
        type: String,
        required: true
    }
}, { collection: 'users'} );

UserSchema.plugin(uniqueValidator, {
    message: 'Error, {PATH} must be unique.'
})

module.exports = mongoose.model('UserSchema', UserSchema);
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    usage: { type: String, required: true },
    count: { type: Number, required: true }
}, { collection: 'counters'} );

module.exports = mongoose.model('CounterSchema', CounterSchema);
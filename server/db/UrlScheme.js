const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    url:  String,
    enabled: {type: Boolean, default: true},
    order: {type: Number, default: 0},
    code: String
});

module.exports = urlSchema;
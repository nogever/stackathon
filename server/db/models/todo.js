var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String
});

mongoose.model('Todo', schema);

















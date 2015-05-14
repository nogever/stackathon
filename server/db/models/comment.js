var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    content: {
        type: String
    }
});

mongoose.model('Comment', schema);

















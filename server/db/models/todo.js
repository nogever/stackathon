var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	note: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Note'
    },
    name: String
});

mongoose.model('Todo', schema);

















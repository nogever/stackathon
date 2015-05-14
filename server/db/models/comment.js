var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	note: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Note'
    },
    content: {
        type: String
    }
});

mongoose.model('Comment', schema);

















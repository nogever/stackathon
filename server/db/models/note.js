var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    board: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Board'
    },
    url: {
        type: String
    },
    position: { 
        x: Number, 
        y: Number 
    },
    title: String,
    body: String,
    // todos: [{type: mongoose.Schema.Types.ObjectId, ref: 'Todo'}],
    label: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },
    color: {type: String, default: 'yellow'},
    upvote: Number,
    downvote: Number,
    images: [String],
    video: [String],
    Audio: [String]
    // comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

schema.methods.getComments = function() {
    return mongoose.model('Comment').find({ note: this._id }).exec();
};

schema.methods.getToDos = function() {
    return mongoose.model('Todo').find({ note: this._id }).exec();
};

mongoose.model('Note', schema);

















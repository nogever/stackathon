var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    url: {
        type: String
    },
    title: String,
    body: String,
    todos: [{type: mongoose.Schema.Types.ObjectId, ref: 'Todo'}],
    label: String,
    upvote: Number,
    downvote: Number,
    image: [String],
    video: [String],
    Audio: [String],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

mongoose.model('Note', schema);

















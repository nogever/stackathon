var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String
    // ,
    // notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
});

schema.virtual('boardUrl').get(function() {
  return '/b/' + this._id;
});

schema.methods.getNotes = function() {
    return mongoose.model('Note').find({ board: this._id }).exec();
};

mongoose.model('Board', schema);

















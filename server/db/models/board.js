var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
});

schema.virtual('boardUrl').get(function() {
  return '/b/' + this._id;
});

mongoose.model('Board', schema);

















'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');

module.exports = router;

router.get('/:noteId', function (req, res, next) {
	Comment.find({note: req.params.noteId}, function(err, comments) {
		if(err) return next(err);
		res.json(comments);
	});
});

router.post('/', function (req, res, next) {
	Comment.create(req.body, function(err, comment) {
		console.log('req.body comment ', req.body);
		if(err) return next(err);
		res.json(comment);
		console.log('new comment ', comment);
	});
});
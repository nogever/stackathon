'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');

module.exports = router;

router.get('/:id', function (req, res, next) {
	Comment.findById(req.params.id, function(err, comment) {
		if(err) return next(err);
		res.json(comment);
	});
});

router.post('/', function(req, res, next) {
	Comment.create(req.body, function(err, comment) {
		if(err) return next(err);
		res.json(comment);
	});
});
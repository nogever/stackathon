'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');

module.exports = router;

router.get('/', function (req, res, next) {
	Board.find({}, function(err, boards) {
    res.json(boards);
	});
});

router.get('/b/:id', function (req, res, next) {
	Board.findById(req.params.id, function(err, board) {
		if(err) return next(err);
		res.json(board);
	});
});

router.put('/:id', function (req, res, next) {
	Board.findByIdAndUpdate(req.params.id, { $set: req.body }, function(err, board) {
		if (err) return next(err);
		res.json(board);
	});
});

router.post('/', function(req, res, next) {
	Board.create(req.body, function(err, board) {
		res.json(board);
	});
});
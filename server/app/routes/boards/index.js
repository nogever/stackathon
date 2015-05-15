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
	console.log('hi');
	Board.findById(req.params.id, function(err, board) {
		console.log(board);
		if(err) return next(err);
		res.json(board);
	});
});

router.post('/', function(req, res, next) {
	Board.create(req.body, function(err, board) {
		res.json(board);
	});
});
'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Note = mongoose.model('Note');
var Board = mongoose.model('Board');

module.exports = router;

router.get('/b/:boardId', function (req, res, next) {
	Board.findById(req.params.boardId)
		.exec()
		.then(function(board){
			var notes = board.getNotes();
			res.status(201).json(notes);
		}, function(err) {
			console.log('Notes GET Error Handler: ', err);
			res.status(501).next(err);
		}).then(function(success) {
			console.log('get reviews successfully');
		}, function(err) {
			console.log('errrrrrr ', err);
		});
});

router.get('/:id', function (req, res, next) {
	Note.findById(req.params.id, function(err, note) {
		if(err) return next(err);
		res.json(note);
	});
});

router.post('/', function(req, res, next) {
	Note.create(req.body, function(err, note) {
		if(err) return next(err);
		res.json(note);
	});
});
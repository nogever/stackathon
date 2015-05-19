'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var Note = mongoose.model('Note');
module.exports = router;

router.get('/board/:boardId', function (req, res, next) {
	Note.find({board: req.params.boardId}, function(err, notes) {
		res.json(notes);
	});
});

router.get('/:id', function (req, res, next) {
	Note.findById(req.params.id, function(err, note) {
		if(err) return next(err);
		res.json(note);
	});
});

router.get('/:id/comments', function(req, res, next) {
	Note.findById(req.params.id, function(err, note) {
		if(err) return next(err);
		note.getComments().then(function(comments) {
			res.send(comments);
		}).catch(function(err) {
			console.log(err);
		});
	});
});

router.post('/', function (req, res, next) {
	Note.create(req.body, function(err, note) {
		res.json(note);
	});
});

router.put('/:id', function (req, res, next) {
	Note.findByIdAndUpdate(req.params.id, { $set: req.body }, function(err, note) {
		if (err) return next(err);
		res.json(note);
	});
});

router.put('/upvote/:id', function (req, res, next) {
	Note.findByIdAndUpdate(req.params.id, { $inc: { upvote: 1 }}, function(err, note) {
		if (err) return next(err);
		res.json(note);
	});
});

router.put('/downvote/:id', function (req, res, next) {
	Note.findByIdAndUpdate(req.params.id, { $inc: { downvote: 1 }}, function(err, note) {
		if (err) return next(err);
		res.json(note);
	});
});

router.put('/images/:id', function (req, res, next) {
	var imgUrl = req.body.image;
	Note.findByIdAndUpdate(req.params.id, { $push: { images: imgUrl }}, function(err, note) {
		if (err) return next(err);
		res.json(note);
	});
});

router.delete('/:noteId', function (req, res, next) {
	Note.findByIdAndRemove(req.params.noteId, function(err, doc) {
		if(err) return next(err);
		res.status(200).end();
	});
});


















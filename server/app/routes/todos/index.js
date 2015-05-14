'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');

module.exports = router;

router.get('/:id', function (req, res, next) {
	Todo.findById(req.params.id, function(err, todo) {
		if(err) return next(err);
		res.json(todo);
	});
});

router.post('/', function(req, res, next) {
	Todo.create(req.body, function(err, todo) {
		if(err) return next(err);
		res.json(todo);
	});
});
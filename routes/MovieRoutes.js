var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Movie = mongoose.model('Movie');
var jwt = require("express-jwt");

var auth = jwt({
	secret: "_secret_sauce",
	userProperty: "payload"
})

router.param('id', function(req, res, next, id) {
	Movie.findOne({_id:id})
		.populate("comments")
		.exec(function(err, movie) {
			movie.populate({
				path:"comments.user",
				model: "User",
				select: "username email image"
			}, function(err, populateMovie) {
				req.movie = movie;
				next();
		})
	});
});

router.get('/', function(req, res) {
	Movie.find({})
	.exec(function(err, movies) {
		if(err) return res.status(500).send({err: "error getting all movies"});
		if(!movies) return res.status(500).send({err: "movies do not exist"});
		res.send(movies);
	});
});

router.get('/:id', function(req, res) {
	res.send(req.movie);
});

router.post('/', auth, function(req, res) {
	var movie = new Movie(req.body);
	movie.save(function(err, result) {
		if(err) return res.status(500).send({err: "The server is having issues."});
		if(!result) return res.status(400).send({err: "Could not create that movie."});
		res.send({_id: result._id});
	});
});

router.put('/:id', function(req, res) {
	Movie.update({_id: req.params.id}, req.body, function(err, result) {
		if(err) return res.status(500).send({err: "error"});
		if(!result) return res.status(400).send({err: "could not update movie"});
		res.send();
	});
});

router.delete('/:id', function(req, res) {
	Movie.remove({_id: req.params.id}, function(err, result) {

	});
});



module.exports = router;

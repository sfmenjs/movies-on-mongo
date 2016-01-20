var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var MovieComment = mongoose.model('MovieComment');
var Movie = mongoose.model('Movie');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({
  'userProperty': 'payload',
  'secret': '_secret_sauce'
});

router.post('/', auth, function(req, res) {
  var comment = new MovieComment(req.body);
  comment.created = new Date();
  comment.user = req.payload.id;
  comment.save(function(err, result) {
    if (err) return res.status(500).send({
      err: "There is a problem"
    });
    if (!result) return res.status(400).send({
      err: "Could not create comment"
    });
    Movie.update({ _id: comment.movie}, {$push: {
      comments: {
        _id: result._id
      }
    }}, function(err, movie) {
      if(err) return res.status(500).send({err: "there was an error"});
      if(!movie) return res.status(400).send({err: "this error should never happen"});
      User.update({_id: comment.user}, {$push: { comments: { _id: result._id}}}, function(err, movie) {
        res.send(result);
      });
    })
  });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongo = require("mongodb");
var http = require("http");
var mongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost/staticData";
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/staticData");
var db = mongoose.connection;

var bcrypt = require('bcryptjs');
var User = require('../models/user');
// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register user
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var role = req.body.role;
	var password = req.body.password;
	//var password2 = req.body.password2;
	
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	//req.checkBody('role', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	//req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        
    });
	});
	
	var errors = req.validationErrors();
	if(errors){
		res.render("register", {
			errors:errors
		})
	}else{
		bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
		
		mongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("userData").insert({
			name:name,
			email:email,
			role:role,
			password:hash
		}, function(err, result) {
		if (err) throw err;
		
		db.close();
		});
		});
		req.flash("success_msg", "You are now registered");
		res.redirect("/users/login");
		
		});
		});
		
	}
});

passport.use(new LocalStrategy(
  function(email, password, done) {
   User.getUserByEmail(email, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown Email'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

router.get('/settings', function(req, res){
	//res.render('settings');
	res.send(req.user.role);
	
});

module.exports = router;


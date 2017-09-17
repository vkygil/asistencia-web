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
mongoClient.connect(url, function(err, db) {
		if (err) throw err;
		});


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
	if(req.user){
		switch(req.user.role){
		case "t":
			db.collection("classes").findOne({"name":"classes"}, function(err, result) {
			if (err) throw err;
			res.render("tsettings", {allClasses: result.classes, tClasses: req.user.classes});
			});
			break;
		case "a":
			db.collection("classes").findOne({"name":"classes"}, function(err, result) {
			if (err) throw err;
				mongoClient.connect(url, function(err, db) {
				if (err) throw err;
				db.collection("userData").find({}, {'_id': 0,name:true,email:true,role:true	}).toArray(function(err, userData){
				if (err) throw err;
				res.render("asettings", {userData:userData,json:JSON.stringify(userData), allClasses: result.classes});
				db.close();
				})
				});
			});
			break;
		default:
			res.send("your role is not specified in the db");
			break;
	};
	}else{
		req.flash("error_msg", "You r not loggged in");
		res.redirect("/users/login");
	}
	
});

router.get('/settings/:className', function(req, res){
	mongoClient.connect("mongodb://localhost/staticData", function(err, db) {
    if (err) throw err;
    db.collection("classes").findOne({"className":req.params.className}, function(err, result) {
    if (err) throw err;
    res.send(result);
    db.close();
    });
	});
});

router.post("/settings", function(req, res){
	mongoClient.connect("mongodb://localhost/staticData", function(err, db) {
    if (err) throw err;
    db.collection("classes").update(
			{ className: req.body.className},
			{ $set:
				{
				students:req.body.studentNames
				}
			},{ upsert: true }
		, function(err, result) {
		if (err) throw err;
		res.send("done")
		});
	});
	
});

router.post('/tsettings', function(req, res){
	//res.send(req.body.time);
	
	if (req.user){
		var time2= JSON.parse(req.body.time)
		db.collection("userData").update(
			{ email: req.user.email},
			{ $set:
				{
				time:time2
				}
			}
		, function(err, result) {
		if (err) throw err;
		});
		req.flash("success_msg", "You have successfuly saved yout time table");
		res.redirect("/");
	}else{
		req.flash("error_msg", "You r not loggged in");
		res.redirect("/");
	}
		
});
router.post('/asettings', function(req, res){
	//res.send(req.body.time);
	if (req.user && req.user.role =="a"){
		var classes2= JSON.parse(req.body.classes)
		db.collection("classes").update(
			{ name: "classes"},
			{ $set:{
				classes: classes2
				   }},
			{ upsert: true }
		, function(err, result) {
		if (err) throw err;
		});
		req.flash("success_msg", "You have successfuly saved classes");
		res.redirect("/");
	}else{
		req.flash("error_msg", "You r not loggged in or not admin");
		res.redirect("/");
	}
		
});

router.post('/tsettingsClasses', function(req, res){
	//res.send(req.body.time);
	
	if (req.user && req.user.role=="t"){
		var classes2= JSON.parse(req.body.classes)
		db.collection("userData").update(
			{ email: req.user.email},
			{ $set:
				{
				classes:classes2
				}
			}
		, function(err, result) {
		if (err) throw err;
		});
		req.flash("success_msg", "You have successfuly saved yout time table");
		res.redirect("/");
	}else{
		req.flash("error_msg", "You r not loggged in");
		res.redirect("/");
	}
		
});

router.post('/deleteUser', function(req, res){
	
	if (req.user){
		db.collection("userData").findOneAndDelete( { email:req.body.email}, function(err, result) {
		if (err) throw err;
		res.send(result);
		
	});
	}else{
	}
		
});


router.post('/attendence', function(req, res){
	if(req.isAuthenticated()){
		res.send(req.user.time[req.body.day].time)
	}else{
		res.send("Usted no se ha identificado");
	}
});


router.get('/test', function(req, res){
	res.render("attendence");
});





module.exports = router;




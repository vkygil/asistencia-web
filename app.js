var express = require("express");
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//connect to mongooseee
mongoose.connect("mongodb://localhost/staticData");
var db = mongoose.connection;
//connect to mongodb modules
var mongo = require("mongodb");
var http = require("http");
var mongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost/staticData";

var routes = require("./routes/index");
var users = require("./routes/users");

//Viewengine
//const pug = require('pug');
//app.set('view engine', 'pug');
app.set("views", "./views");
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set("view engine", "handlebars");
//Bodyparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//set static foldrt
app.use(express.static("./public"));
//express  Session
app.use(session({
	secret: "sectret",
	saveUninitialized: true,
	resave: true
}));

//passport init
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash());
// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


app.use("/", routes);
app.use("/users", users);

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
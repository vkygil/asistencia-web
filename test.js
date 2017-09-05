var moment = require('moment');
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

const nodemailer = require('nodemailer');

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

app.get('/', function(req, res){
	res.render('register');
});
//nodemailer


app.get("/admin", function(req, res){
	mongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("userData").find({}).toArray(function(err, docs) {
		if (err) throw err;
			
			if (JSON.stringify(docs[0])){
				res.send("si hay docs");
			}else{
				res.send("no hay docs");
			};
		
		});
		
	});
		

});

app.post('/users/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var role = req.body.role;
	var password = req.body.password;
	
	let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "4sistencia@gmail.com", // generated ethereal user
            pass: "4sistenciaweb"  // generated ethereal password
        }
    });
	var mailOptions = {
    from: name, // sender address
    to: email, // list of receivers
    subject: "Hello", // Subject line
    text: "Hello world ", // plaintext body
    html: password // html body
	}
	transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
	});
	
	//if(req.body.role){
	//	var temp01 = req.body;
	//	res.send(401);
		//res.send(Object.keys(temp01)[1]);
		
		//var temp2= bject.keys(temp01).length;
	//}else{
	//	res.send("you are getting late")
	//}
	
	
});

app.get("/moment", function(req, res) {
	//res.send(moment.duration('23:59'));
	res.send(moment().format("H"));
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
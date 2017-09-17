var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var http = require("http");
var mongoClient = require("mongodb").MongoClient;

// Get Homepage
router.get('/', function(req, res){
	if(req.user){
		switch(req.user.role){
		case "t":
			var d = new Date().getDay(), h = new Date().getHours(), m = new Date().getMinutes();
			
			//d=[6,0,1,2,3,4,5][d];//monday
			d=0
			h=8;
			m=12;
			var cTime= parseInt(h+""+m);	
			var tTable = req.user.time[d].time;
			//res.send(tTable+"")
			var i = 0;
			while(i<tTable.length){
				if(tTable[i][0]<cTime && cTime<tTable[i][1]){
					var cName = tTable[i][2];
					
					mongoClient.connect("mongodb://localhost/staticData", function(err, db) {
					if (err) throw err;
					db.collection("classes").findOne({"className":cName.replace(/_/g," ")}, function(err, result) {
					if (err) throw err;	
						res.render("attendence", {classData:result, day:d});
					db.close();
					});
					});
					i=tTable.length;
					
				}
			}
			
			
			break;
		case "a":
			req.flash("success_msg", "admin dashboard not available");
			res.redirect("/users/settings");
			break;
		default:
			res.send("your role is not specified in the db");
			break;
	};
	}else{
		res.render("login");
	}
	
	
});



module.exports = router;
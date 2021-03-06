"use strict";
/*jslint node: true */
var host = "0.0.0.0";
var port = 8000;
var shell = require("shelljs");
var express = require("express");

var app = express();
// app.use(app.router); //use both root and other routes below
app.use(express.static(__dirname + "/public")); //use static files in ROOT/public folder

app.get("/run", function(request, response){ //root dir
	var start = request.query.startBuild;
	var end = request.query.endBuild;
	var url = request.query.url;
	var commandString = "jenkinsinfo -j --start "+start+" --end "+end+" --url \""+url+"\" --nocolor";
	console.log('RUNNING: ', commandString);
	var result = shell.exec(commandString);
	response.set("Content-Type", "text/html");
    response.send("<pre>"+result.output+"</pre> ");
});

app.get("/", function (req, res) {
	res.redirect("/getbuilds.html");
});

app.listen(port, host);
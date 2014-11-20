"use strict";
/*jslint node: true */
var host = "127.0.0.1";
var port = 8000;
var shell = require("shelljs");
var express = require("express");

var app = express();
// app.use(app.router); //use both root and other routes below
app.use(express.static(__dirname + "/public")); //use static files in ROOT/public folder

app.get("/", function(request, response){ //root dir
	var result = shell.exec("ls -la");
	var output = result.output.replace("\\n", "<br />", "g");
	response.set("Content-Type", "text/html");
    response.send("Hello!!  Here is the result from a command that was executed on the command line! :<pre> " + output + "</pre>");
});

app.listen(port, host);
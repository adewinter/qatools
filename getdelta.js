#!/usr/bin/env node
'use strict';

var http = require('http');
var readline = require('readline');
var extend = require('node.extend');
var prettyjson = require('prettyjson');
var parseargs = require('minimist');


var info = [];
var jobStart = 0;
var jobEnd = 0;
var baseUrl = 'http://jenkins.mindtap.corp.web:8080/view/Deploy-Jobs/job/QAF%20-%20Deploy/';
var apiStuff=  '/api/json?pretty=true&tree=actions[*[*]]';

var USE_STANDARD_JSON = false;
var DEBUG_MODE = false;
var IS_INTERACTIVE = true;
var NO_COLOR = false;


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



function start() {
	var argsOpts = {
		'boolean': ['d', 'j'],
		'default': {
			'd': false,
			'j': false,
			'url': 'http://jenkins.mindtap.corp.web:8080/view/Deploy-Jobs/job/QAF%20-%20Deploy/',
			'start': 100,
			'end': 110,
			'i': false,
			'h': false,
			'help': false,
			'nocolor': false
		}
	};
	var args = parseargs(process.argv.slice(2), argsOpts);
	if (args.h || args.help) {
		console.log('=================================================\n' +
			'jenkinsinfo [-j|-d|--url <BASE_URL>|--start <JOB_NUM>|--end <JOB_NUM>|--nocolor|-h|--help]\n\n' +
			'-j : Output JSON String instead of Prettified JSON (useful when using with other tools).\n' +
			'-d : Debug Mode.\n' + 
			'-i : Force interactive mode (instead of just using command line args and defaults.\n' + 
			'--url <BASE_URL> : Specify the URL to get information from (e.g: \n' +
				'\t jenkinsinfo --url "http://jenkins.mindtap.corp.web:8080/view/Deploy-Jobs/job/QAF%20-%20Deploy/"\n' +
				'\t)\n\n' +
			'--start <NUM> : Start job to begin analysis from.\n' + 
			'--end <NUM> : End job for analysis.\n' + 
			'--nocolor : DISABLES color output. \n' +
			'-h : This screen.\n' +
			'--help : This screen.\n');
		rl.close();
		return;
	}
	baseUrl = args.url;
	jobStart = parseInt(args.start,10);
	jobEnd = parseInt(args.end,10);
	USE_STANDARD_JSON = args.j;
	DEBUG_MODE = args.d;
	IS_INTERACTIVE = process.argv.slice(2).length === 0 || args.i;
	NO_COLOR = args.nocolor;
	if (DEBUG_MODE) {
		console.log('Parsed Command Line Args (incl. defaults):', args);
		console.log('============');
		console.log('jobStart, jobEnd, baseUrl, USE_STANDARD_JSON, DEBUG_MODE, IS_INTERACTIVE::', 
					jobStart, jobEnd, baseUrl, USE_STANDARD_JSON, DEBUG_MODE, IS_INTERACTIVE);
		console.log('============');
	}
	askBaseUrl();

}

function askBaseUrl() {
	if (IS_INTERACTIVE) {
		rl.question('Enter base URL (e.g http://jenkins.mindtap.corp.web:8080/view/Deploy-Jobs/job/QAF%20-%20Deploy/ ) :', function(answer) {
		  // TODO: Log the answer in a database
		  console.log('Thank you.');
		  if (!answer || answer === '') {
		  	answer = 'http://jenkins.mindtap.corp.web:8080/view/Deploy-Jobs/job/QAF%20-%20Deploy/';
		  }
		  baseUrl = answer;

		  askJobRange();
		});
	} else {
		askJobRange();
	}
}

function askJobRange() {
	if (IS_INTERACTIVE) {
		rl.question('Enter start job to analyze (e.g. 183):', function(answer) {
		  if (!answer || answer === '') {
		  	answer = '180';
		  }
		  console.log('Will start analysis on job:', answer);
		  jobStart = parseInt(answer,10);
		  rl.question('Enter job to end on (e.g 185):', function(ans) {
		  	if (!ans || ans === '') {
		  		ans = '183';
		  	}
		  	console.log('Analysis will end on job ', ans, ' (inclusive)');
		  	jobEnd = parseInt(ans,10);
		  	rl.close();
		  	startAnalysis();
		  });
		});
	} else {
		rl.close();
		startAnalysis();
	}
}

function getData(jobNum, isFinal) {
	var url = baseUrl + jobNum + apiStuff;
	console.log('Getting for ', jobNum, isFinal ? ' Last Job.' : '');
	if (DEBUG_MODE) {
		console.log('Hitting URL:', url);
	}
	http.get(url, function(res){
	    var data = '';

	    res.on('data', function (chunk){
	        data += chunk;
	    });

	    res.on('end',function(){
	        var obj = JSON.parse(data);
	        var _data;
	        var actions = obj.actions;
	        for (var i = 0; i<actions.length; i++) {
	        	if (actions[i] && actions[i].parameters) {
	        		_data = actions[i].parameters;
	        		if (DEBUG_MODE) {
		        		console.log('FOUND PARAMS');
		        	}
	        	}
	        }
	        console.log('Done.');
	        info.push(_data);

	        if (isFinal) {
	        	//do the actual analysis;
	        	analyze();
	        } else {
	        	var newJobNum = jobNum + 1;
	        	getData(newJobNum, jobEnd === newJobNum);
	        }
	    });

	});
}

function startAnalysis() {
	getData(jobStart, false);
}

function analyze() {
	var output = {};
	console.log('========================================\n\n\n\n');
	if (DEBUG_MODE) {
		console.log('FINAL DATASET:', JSON.stringify(info));
	}
	for (var i=0; i<info.length; i++ ){ 
		var datum = {};
		for (var k=0; k<info[i].length; k++){
			var name = info[i][k].name;
			var value = info[i][k].value;
			datum[name] = value;
			if (output !== {} && value === '-- NONE --') { //only use -- NONE -- for the base dict, delete entries after that.
				delete datum[name];						
			}
		}
		info[i] = datum;

		output = extend(output, info[i]);
	}


	console.log('DONE! ::\n\n');
	if (USE_STANDARD_JSON) {
		console.log(JSON.stringify(output));
	} else {
		console.log(prettyjson.render(output, {noColor: NO_COLOR}));
	}
}


start();

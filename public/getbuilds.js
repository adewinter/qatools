'use strict'; //Stuff for JSLinting
/* global $ */




//Reference : http://code.tutsplus.com/tutorials/submit-a-form-without-page-refresh-using-jquery--net-59
//Note you should never really have console.log statements in your production code, but I 
//left it in so you could get an easier idea of what was going on!
$(document).ready(function () {
	$('#getBuildForm').submit(function (event) {
		event.preventDefault();  //stops the form from submitting the normal way.
		console.log('Event!', event);

		var start = $('#startBuild').val();
		var end = $('#endBuild').val();
		var url = $('#url').val();

		var dataString = 'url=' + url + '&startBuild=' + start + '&endBuild=' + end;

	 	console.log('DATASTRING IS:', dataString);


	 	function processReturnData(data) {
	 		console.log('GOT A RESPONSE!', data);
	 		$('#responseArea').html(data);
	 	}

	 	$.get('run/', dataString, processReturnData);
	});

});

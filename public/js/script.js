	var xx;

$(document).ready(function () {

	$("#topic1").hide();
	$("#topic2").hide();


	$("#btn2").click(function(){
		$("#topic1").fadeToggle();
		$("#topic2").fadeToggle();
	});
	
	// $("#searchButton").on('click', function(){
	// 	var value = $("#textBox").val();
	// 	console.log(value);
	// 	$.ajax({
	// 	    url: '/api/searchTwitter', 
	// 	    type: 'POST', 
	// 	    contentType: 'application/json', 
	// 	    data: JSON.stringify({number:1})}
	// 	);

	// 	$("#textBox").val(''); // reseting it to empty
	// });

	$.ajax({
		url: '/api/trends',
		type: 'GET'

	}).done(function(resp){
		console.log(resp);
	});

	$.ajax({
		url: '/api/allTweets',
		type: 'GET'

	}).done(function(resp){
		xx = resp;
		console.log("Test");
		console.log(resp);
	});

	$.ajax({
		url: '/api/date',
		type: 'POST',
		contentType: 'application/json', 
		data: JSON.stringify({"text":"Trump"})
	}).done(function(resp){
		console.log(resp);
	});

	$("#searchButton").click(function(){
		var value = $("#textBox").val();
		console.log(value);
		$.ajax({
		    url: '/api/searchTweets', 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify({"text":value})},
		).done(function(resp){
			console.log(resp);
		});
	});
 });
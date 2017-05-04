var search = "#starwarsday"
$(document).ready(function () {
	$("#topic1").hide();
	$("#topic2").hide();
	$("#allPlots").hide();

	$("#trending").click(function(){
		$("#topic1").fadeToggle();
		$("#topic2").fadeToggle();
	});

	//Load Top 10 Trending Topics from Server
	$.ajax({
		url: '/api/trends',
		type: 'GET'

	}).done(function(resp){
		addTrending(resp);
	});

	//Click Function for Search Buton
	$("#searchButton").click(function(){
		var value = $("#textBox").val();
		fetchNewTweets(value);
	});
 });

//Function to add trending topics to the webpage
function addTrending(trends){
	var i = 0;
	var n = 10;
	if(trends.length < n)
		n = trends.length
	for(;i<n;i++){
		if(i<5){
			$("#topicList1").append('<button type="button" class="btn btn-success trendButton">'+trends[i]+'</button>');
		}else{
			$("#topicList2").append('<button type="button" class="btn btn-success trendButton">'+trends[i]+'</button>');
		}
	}
	$("button.trendButton").click(function(){
		//fetchNewTweets($(this).text());
		if(search == "#starwarsday")
			search = "hello";
		else
			search = "#starwarsday";
		requestAllData(search);
	});
}

//Function to send notification to server to fetch tweets
function fetchNewTweets(word){
	$("#textBox").val(word);
	$.ajax({
	    url: '/api/searchTweets', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		console.log(resp);
	});
}

function requestAllData(word){
	$.ajax({
	    url: '/api/popularWords', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		createPopularWords(resp);
	});

	$.ajax({
	    url: '/api/devices', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		createDevices(resp.count, resp.source);
	});

	$.ajax({
	    url: '/api/location', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		createLocation(resp.count, resp.loc);
		createLocationMap(resp.plot);
	});

	$.ajax({
	    url: '/api/lang', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		createLanguage(resp.count, resp.lang);
	});

	$.ajax({
	    url: '/api/date', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		createDate(resp.count, resp.date);
	});

	$.ajax({
	    url: '/api/sentiment', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		createSentiment(resp.sentiment, resp.color);
	});
}
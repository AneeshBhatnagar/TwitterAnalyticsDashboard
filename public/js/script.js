var search = "#starwarsday"
var timeoutManager, firstFetch = true;
$(document).ready(function () {
	$("#topic1").hide();
	$("#topic2").hide();
	$("#allPlots").css('opacity','0');
	$("#loader").fadeOut();

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
		var value = $("#textBox").val().toLowerCase();
		fetchNewTweets(value);
	});

	$("#plotOptions input").click(function(){
		div = $(this).attr("data-div");
		if(this.checked){
			$("#"+div).fadeIn("slow");
		}else{
			$("#"+div).fadeOut("slow");
		}
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
		fetchNewTweets($(this).text().toLowerCase());
	});
}

//Function to send notification to server to fetch tweets
function fetchNewTweets(word){
	clearTimeout(timeoutManager);
	firstFetch = true;
	$("#loader").fadeIn();
	$("#textBox").val(word);
	$("#topic1").fadeOut();
	$("#topic2").fadeOut();
	$.ajax({
	    url: '/api/searchTweets', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		timeoutManager = setTimeout(requestAllData.bind(null,word),4500);		
	});
}

function requestAllData(word){
	$("#searchTermHeading").text(word);
	if($("#popularWordsDiv").is(":visible") || firstFetch == true){
		$.ajax({
		    url: '/api/popularWords', 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify({"text":word})},
		).done(function(resp){
			createPopularWords(resp);
		});
	}
	if($("#devicesDiv").is(":visible") || firstFetch == true){
		$.ajax({
		    url: '/api/devices', 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify({"text":word})},
		).done(function(resp){
			createDevices(resp.count, resp.source);
		});
	}
	if($("#locationMapDiv").is(":visible") || $("#locationDiv").is(":visible") || firstFetch == true){
		$.ajax({
		    url: '/api/location', 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify({"text":word})},
		).done(function(resp){
			if($("#locationDiv").is(":visible") || firstFetch == true)
				createLocation(resp.count, resp.loc);
			if($("#locationMapDiv").is(":visible") || firstFetch == true)
				createLocationMap(resp.plot);
		});
	}

	if($("#languageDiv").is(":visible") || firstFetch == true){
		$.ajax({
		    url: '/api/lang', 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify({"text":word})},
		).done(function(resp){
			createLanguage(resp.count, resp.lang);
		});
	}

	if($("#sentimentDiv").is(":visible") || firstFetch == true){
		$.ajax({
		    url: '/api/sentiment', 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify({"text":word})},
		).done(function(resp){
			createSentiment(resp.sentiment);
		});
	}

	$("#loader").fadeOut();
	$('#allPlots').animate({opacity: 1},'slow');
	if(firstFetch == true){
		setTimeout(function(){
			$('html,body').animate({
		        scrollTop: $("#allPlots").offset().top},'slow');
		},600);
	}
	firstFetch = false;
	timeoutManager = setTimeout(requestAllData.bind(null,word),9000);	
}

function setWidthForPlots(){
	var numberPattern = /\d+/g;
	var w = $(".customTwitterChart").css("width");
	w = w.match(numberPattern)[0];
	$(".customTwitterChart").css("min-height",w/2);
/*	$("#locationMap").css("width",w - 20);*/
	$("#locationMap").css("height",w/2 + 90);
}

function fixDiv(){
	var val = $("#allPlots").offset().top - $(window).scrollTop();
	if(val < 50){
		$("#plotStop").addClass("fixed-scroll");
	}else{
		$("#plotStop").removeClass("fixed-scroll");
	}
}
$(window).scroll(fixDiv);
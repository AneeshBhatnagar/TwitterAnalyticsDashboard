var search = "#starwarsday";
var globalSearchTerm, verifiedFilter;
var timeoutManager, firstFetch = true, fetchedTweets;
var filterStatus = false, filterType = "language", filterValue = "es";
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
		if($(this).attr("id") == "onlyVerified"){
			verifiedFilter = this.checked;
		}
		else{
			div = $(this).attr("data-div");
			if(this.checked){
				$("#"+div).fadeIn("slow");
			}else{
				$("#"+div).fadeOut("slow");
			}
		}
		parseD3Data(globalSearchTerm);
	});

	$("#conditionButton").click(function(){
		filterStatus = false;
		parseD3Data(globalSearchTerm);
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
		timeoutManager = setTimeout(requestD3Data.bind(null,word),4500);		
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
	if(firstFetch == true){
		$('#allPlots').animate({opacity: 1},'slow');
		setTimeout(function(){
			$('html,body').animate({
		        scrollTop: $("#allPlots").offset().top},'slow');
		},600);
	}
	firstFetch = false;
	timeoutManager = setTimeout(requestAllData.bind(null,word),9000);	
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


function requestD3Data(word){
	$.ajax({
	    url: '/api/allTweets', 
	    type: 'POST', 
	    contentType: 'application/json', 
	    data: JSON.stringify({"text":word})},
	).done(function(resp){
		fetchedTweets = resp;
		parseD3Data(word);
		timeoutManager = setTimeout(requestD3Data.bind(null,word),9000);		
	});
}

function parseD3Data(searchTerm){
	globalSearchTerm = searchTerm;
	var val = fetchedTweets;
	if(verifiedFilter){
		val = val.filter(function(d){return d.verified == true});
	}
	if(filterStatus){
		$("#conditionDisplay").show();
		var conditionText = "Filtered where \""+ filterType + "\" is \"" + filterValue + "\".";
		$("#conditionText").text(conditionText);
		if(filterType == "language"){
			val = val.filter(function(d){return d.lang == filterValue});
		} else if(filterType == "location"){
			val = val.filter(function(d){return d.location == filterValue});
		} else if(filterType == "device"){
			val = val.filter(function(d){return d.source.toLowerCase() == filterValue});
		} else if(filterType == "sentiment"){
			val = val.filter(function(d){return d.sentiment.toLowerCase() == filterValue});
		}

	}else{
		$("#conditionDisplay").hide();
	}
	var lang = d3.nest()
		.key(function(d) { return d.lang; })
		.rollup(function(leaves) { return leaves.length; })
		.entries(val);
	var source = d3.nest()
		.key(function(d) { return d.source; })
		.rollup(function(leaves) { return leaves.length; })
		.entries(val);
	var sentiment = d3.nest()
		.key(function(d) { return d.sentiment; })
		.rollup(function(leaves) { return leaves.length; })
		.entries(val);
	var location = d3.nest()
		.key(function(d) { return d.location; })
		.rollup(function(leaves) { return leaves.length; })
		.entries(val);
	var popularWords = {};
	var n = val.length;
	for(i=0; i<n; i++){
		var temp = val[i].hashtags_mentions;
		var n2 = temp.length;
		for(j = 0; j< n2; j++){
			if(!popularWords[temp[j]]){
				popularWords[temp[j]] = 0;
			}
			popularWords[temp[j]]++;
		}
	}
	//Sorting All Data
	lang.sort(function(x,y){
		return d3.descending(x.values, y.values);
	})

	location.sort(function(x,y){
		return d3.descending(x.values, y.values);
	})

	source.sort(function(x,y){
		return d3.descending(x.values, y.values);
	})

	//Generating Required Data for plotting
	n = 10;
	if(n > lang.length)
		n = lang.length
	var lang_l = [];
	var lang_c = [];
	for(i=0; i<n; i++){
		if(!(lang[i].key =="und" || lang[i].key =="undefined")){
			lang_l.push(lang[i].key);
			lang_c.push(lang[i].values);
		}
	}

	n = 10;
	if(n > source.length)
		n = source.length
	var devices_l = [];
	for(i=0; i<n; i++){
		if(!(source[i].key =="und" || source[i].key =="undefined")){
			var d_t = [source[i].key, source[i].values]
			devices_l.push(d_t);
		}
	}

	n = location.length;
	var loc_l = [];
	var loc_c = [];
	var loc_plot = {};
	for(i=0; i<n; i++){
		if(!(location[i].key =="und" || location[i].key =="undefined")){
			if(i<10){
				loc_l.push(location[i].key);
				loc_c.push(location[i].values);
			}
			loc_plot[location[i].key] = location[i].values;
		}
	}

	n = sentiment.length;
	var sentiment_l = [];
	for(i=0; i<n; i++){
		if(!(sentiment[i].key =="und" || sentiment[i].key =="undefined")){
			var sentiment_temp = [sentiment[i].key, sentiment[i].values];
			sentiment_l.push(sentiment_temp);
		}
	}

	var words = [];
	for(word in popularWords){
		words.push({"text":word, "weight":popularWords[word]});
	}

	//Plotting Graphs and WordCloud

	if($("#popularWordsDiv").is(":visible") || firstFetch == true){
		createPopularWords(words);
	}
	if($("#devicesDiv").is(":visible") || firstFetch == true){
		createDevices(devices_l);
	}
	if($("#locationMapDiv").is(":visible") || firstFetch == true){
		createLocationMap(loc_plot);
	}
	if($("#languageDiv").is(":visible") || firstFetch == true){
		createLanguage(lang_c, lang_l);
	}
	if($("#locationDiv").is(":visible") || firstFetch == true){
		createLocation(loc_c, loc_l);
	}
	if($("#sentimentDiv").is(":visible") || firstFetch == true){
		createSentiment(sentiment_l);
	}	
	if(firstFetch == true){
		$('#allPlots').animate({opacity: 1},'slow');
		$("body").css("overflow-y","auto");
		$('html,body').animate({scrollTop: $("#allPlots").offset().top},'slow');
	}
	$("#searchTermHeading").text(searchTerm + ", based on " + val.length + " tweets");
	$("#loader").fadeOut();
	firstFetch = false;
	findAndSetSameHeight();
}

function findAndSetSameHeight(){
	var max = 0;
	$(".customTwitterChart").each(function(e){
		if($(this).height() > max)
			max = $(this).height();
	});
	$(".customTwitterChart").css("height",max);
}
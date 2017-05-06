var devicesChart, languageChart, dateChart
	,locationChart, sentimentChart;
var cloudActive = false;

function createPopularWords(words){
	if(cloudActive){
		$('#popularWords').jQCloud('destroy');
	}
	$('#popularWords').jQCloud(words);
	cloudActive = true;
}

function createDevices(devices){
	devicesChart =c3.generate({
		bindto: '#devices',
    	data: {
	        columns: devices ,
	        type : 'pie',
	        onclick: function (d, i) {
	        	filterStatus = true;
				filterType = "device";
				filterValue = d.id.toLowerCase();
				parseD3Data(globalSearchTerm);
	        },	
	    }
	});
}

function createLocationMap(locations){
	$("#locationMap").html("");
	$('#locationMap').vectorMap({
		map: 'world_mill',
		series: {
			regions: [{
			values: locations,
			scale: ['#C8EEFF', '#0071A4'],
			normalizeFunction: 'polynomial'
			}]
		},
		onRegionTipShow: function(e, el, code){
			el.html(el.html()+' (Tweets - '+locations[code]+')');
		},
		onRegionClick: function(e, code){
			if(locations[code] != undefined){
				filterStatus = true;
				filterType = "location";
				filterValue = code;
				parseD3Data(globalSearchTerm);
			}
			else
				console.log("Invalid");
		}
	});
}

function createLanguage(language, label){
	var l = ["Language"];
	var data = l.concat(language);
	languageChart = c3.generate({
	    bindto: '#language',
	    data: {
	      columns: [data],
	      onclick: function (d, i) {
	        	filterStatus = true;
				filterType = "language";
				filterValue = label[d.index];
				parseD3Data(globalSearchTerm);
	        },	
	    },
	    axis: {
	        x: {
	            type: 'category',
	            categories: label
	        }
	    }
	});
}

function createLocation(location, label){
	var l = ["Location"];
	var data = l.concat(location);
	locationChart = c3.generate({
		bindto : "#location",
	    data: {
	        columns: [data],
	        type: 'bar',
	        onclick: function (d, i) {
	        	filterStatus = true;
				filterType = "location";
				filterValue = label[d.index];
				parseD3Data(globalSearchTerm);
	        },	        
	    },
	    bar: {
	        width: {
	            ratio: 0.5
	        }
	    },
	    axis: {
	        x: {
	            type: 'category',
	            categories: label
	        }
	    }
	});
}

function createSentiment(sentiment){
	sentimentChart = c3.generate({
    	bindto: '#sentiment',
    	data: {
	        columns: sentiment,
	        type : 'donut',
	        //onclick: function (d, i) { console.log("onclick", d, i); },
	        colors: {'Very Happy':'#FFD700',
	        	'Happy':'green',
	        	'Neutral':'black',
	        	'Sad':'red',
	        	'Very Sad':'maroon'
	        },
	        onclick: function (d, i) {
	        	filterStatus = true;
				filterType = "sentiment";
				filterValue = d.id.toLowerCase();
				parseD3Data(globalSearchTerm);
	        },	
	    },
	    donut: {
	        title: "Sentiment"
	    }
	});
}
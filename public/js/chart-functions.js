var devicesChart, languageChart, dateChart
	,locationChart, sentimentChart;

function createPopularWords(words){
	$('#popularWords').jQCloud('destroy');
	$('#popularWords').jQCloud(words);
}

function createDevices(devices, label){
	var n = 10;
	var use = []
	if(devices.length < n)
		n = devices.length;
	for(i=0; i<n; i++){
		var arr = [label[i],devices[i]];
		use.push(arr);
	}
	devicesChart =c3.generate({
		bindto: '#devices',
    	data: {
	        columns: use ,
	        type : 'pie'
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
		}
	});
}

function createLanguage(language, label){
	var l = ["Language"];
	var data = l.concat(language);
	languageChart = c3.generate({
	    bindto: '#language',
	    data: {
	      columns: [data]
	    },
	    axis: {
	        x: {
	            type: 'category',
	            categories: label
	        }
	    }
	});
}

function createDate(date, label){
	var l = ["Date"];
	var l2 = ["label"];
	var labels = l2.concat(label);
	var data = l.concat(date)
	dateChart = c3.generate({
		bindto: '#date',
		data: {
			x: 'label',
			columns: [labels,data]
		},
		axis: {
			x: {
				type: 'timeseries',
				tick: {
					format: '%Y-%m-%d'
				}
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
	        type: 'bar'
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

function createSentiment(sentiment, color){
	sentimentChart = c3.generate({
    	bindto: '#sentiment',
    	data: {
	        columns: sentiment,
	        type : 'donut',
	        //onclick: function (d, i) { console.log("onclick", d, i); },
	        /*onmouseover: function (d, i) { console.log("onmouseover", d, i); },
	        onmouseout: function (d, i) { console.log("onmouseout", d, i); },*/
	        colors: {'Very Happy':'#FFD700',
	        	'Happy':'green',
	        	'Neutral':'black',
	        	'Sad':'red',
	        	'Very Sad':'maroon'
	        }
	    },
	    donut: {
	        title: "Sentiment"
	    }
	});
}
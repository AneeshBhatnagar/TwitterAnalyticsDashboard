var lineChart, splineChart;

$(window).load(function(){
	var numberPattern = /\d+/g;
	var w = $(".customTwitterChart").css("width");
	w = w.match(numberPattern)[0];
	$(".customTwitterChart").css("min-height",w/2);
	$("#map").css("width",w);
	$("#map").css("height",w/2 + 90);
	console.log(w)
	generateCharts();
	generateMap();
});

var data = ['data1',30, 200, 100, 400, 150, 250];
function generateCharts(){
	lineChart = c3.generate({
	    bindto: '#lineChart',
	    data: {
	      columns: [
	        data,
	        ['data2', 50, 20, 10, 40, 15, 25]
	      ]
	    }
	});

	splineChart = c3.generate({
	    bindto: '#splineChart',
	    data: {
	      columns: [
	        ['data1', 30, 200, 100, 400, 150, 250],
	        ['data2', 50, 20, 10, 40, 15, 25]
	      ],
	      type: 'spline'
	    }

	}); 
	xyChart = c3.generate({
	    bindto: '#xyChart',
	    data: {
	      	columns: [
		        ['Number Of Tweets', 30, 200, 100, 400, 150, 250],
		      ],
		      type: 'area'
	    },
	    axis: {
	        x: {
	            type: 'category',
	            categories: ['en', 'es', 'fr', 'de', 'hi', 'pl']
	        }
	    }
	}); 

	donutChart = c3.generate({
    	bindto: '#donutChart',
    	data: {
	        columns: [
	            ['Very Happy', 30],
	            ['Happy', 120],
	            ['Neutral', 120],
	            ['Sad', 120],
	            ['Very Sad', 120],
	        ],
	        type : 'donut',
	        onclick: function (d, i) { console.log("onclick", d, i); },
	        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
	        onmouseout: function (d, i) { console.log("onmouseout", d, i); },
	        colors: {
	        	'Very Happy':'#FFD700',
	        	'Happy':'green',
	        	'Neutral':'gray',
	        	'Sad':'red',
	        	'Very Sad':'maroon',
	        }
	    },
	    donut: {
	        title: "Sentiment"
	    }
	});
	
	var words = [
		{text: "Lorem", weight: 13},
		{text: "Ipsum", weight: 10.5},
		{text: "Dolor", weight: 9.4},
		{text: "Sit", weight: 8},
		{text: "Amet", weight: 6.2},
		{text: "Consectetur", weight: 5},
		{text: "Adipiscing", weight: 5}
	];

	$('#wordCloud').jQCloud(words);
}

$("#changeButton").click(function(){
	console.log("called");
	splineChart.unload({
        ids: 'data2'
    });
});

$("#addButton").click(function(){
	console.log("called");
	splineChart.load({
        columns: [
            ['data3', 80, 150, 100, 180, 80, 150]
        ]
    });
    data = ['data1',30, 600, 100, 400, 150, 250];
    lineChart.load({
    	columns: [
    		data
    	],
    	unload:'data1'
    });
});
	
$("#plotOptions input").click(function(){
	div = $(this).attr("data-div");
	if(this.checked){
		$("#"+div).fadeIn("slow");
	}else{
		$("#"+div).fadeOut("slow");
	}
});

function generateMap(){
	$('#map').vectorMap({
    map: 'world_mill',
    series: {
      regions: [{
        values: gdpData,
        scale: ['#C8EEFF', '#0071A4'],
        normalizeFunction: 'polynomial'
      }]
    },
    onRegionTipShow: function(e, el, code){
		el.html(el.html()+' (GDP - '+gdpData[code]+')');
	}
	});
}

function fixDiv(){
	if($(window).scrollTop() > 100){
		$("#plotStop").addClass("fixed-scroll");
	}else{
		$("#plotStop").removeClass("fixed-scroll");
	}
}
$(window).scroll(fixDiv);
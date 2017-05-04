var express  = require('express'),
    app      = express(),        
    mongoose = require('mongoose'),
    morgan = require('morgan'),        
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    Twitter = require('twitter'),
    sentiment = require('sentiment'),
    NodeGeocoder = require('node-geocoder'),
    moment = require('moment');

// configuration =================

mongoose.connect('mongodb://localhost:27017/tweets');     // connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

var client = new Twitter({
  consumer_key: 'yiYmkK3D1Lkce9KH37Q8RQXdz',
  consumer_secret: 'VLNYdjRXNQ3Tp6Mo5k7YEA9x8NPHdtADIRRM8DhM6Xv8Sx8quz',
  access_token_key: '1605909084-OcgJIf5nid4Axf6QZSbPGKIhQMyWwm9v73DjxXC',
  access_token_secret: 'OK1I2aSsjvbjP1erIAw4a3hB9B6el9YdKoA5XYZ6zXXya'
});

var geoOptions = {
  provider: 'teleport',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyB4WEcCji4jcgRYIBl-82HHmvqOJaiuBJA', // for Mapquest, OpenCage, Google Premier
  formatter: 'string',
  formatterPattern: '%p'         // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(geoOptions);

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");
//startStream("WhatsApp");

/*
//Formatting Date to just year - month- day
var tweetDate = 'Mon Dec 02 23:45:49 +0000 2013';
var x = moment(tweetDate, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'en');
console.log(x.format("YYYY-MM-DD"));*/

var Tweet = mongoose.model('Tweet',{
    tweet_id: String,
    source: String,
    lang: String,
    hashtags_mentions: [String],
    location: String,
    verified: Boolean,
    date: Date,
    sentiment: String,
    searchTerm: String
});

//Find min ID
/*Tweet.find({searchTerm:"Trump"}).sort({tweet_id:1}).limit(1).exec(function(err, res){
    console.log(res);
});*/

//Count by country, where search term is Trump
/*Tweet.aggregate([
        {"$match": {searchTerm:"Trump"}},
        {"$group" : {_id:"$location", count:{$sum:1}}},
        {"$sort" : {"count":-1}}
    ],function(err, res){
        console.log(res);
    }
);*/     

//Function to process the tweets and save in the mongodb.

function startStream(word){
    var stream = client.stream('statuses/filter', {track: word});
    console.log("Stream started");
    stream.on('data', function(event) {
      var temp = new Tweet;
      preProcess(event,temp,word);
    });
    stream.on('error', function(error) {
      console.log(error);
    });
    setTimeout(function(){stream.destroy();
        console.log()},30000);
}

function preProcess(xTweet, t, word){
    t.tweet_id = xTweet.id;
    var s = xTweet.source.match(">([^<]*)<")[0];
    s = s.substring(1,s.length -1);
    t.source = s;
    t.lang = xTweet.lang;
    var hashtags = xTweet.entities.hashtags;
    var mentions = xTweet.entities.user_mentions;
    var h_m = [];
    hashtags.forEach(function(ht){
        h_m.push("#"+ht.text.toLowerCase());
    });
    mentions.forEach(function(m){
        h_m.push("@"+m.screen_name.toLowerCase());
    });
    t.hashtags_mentions = h_m;
    t.verified = xTweet.user.verified;
    var tempDate = moment(xTweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'en');
    t.date = tempDate.format("YYYY-MM-DD");
    var sen = sentiment(xTweet.text).score;
    if(sen>0){
        if(sen > 2){
            t.sentiment = "Very Happy";
        }else{
            t.sentiment = "Happy";
        }
    }else if(sen<0){
        if(sen<-2){
            t.sentiment = "Very Sad";
        }else{
            t.sentiment = "Sad";
        }
    }else{
        t.sentiment = "Neutral";
    }
    t.searchTerm = word;
    if(xTweet.user.location){
        geocoder.geocode(xTweet.user.location).then(function(res){
            t.location = res[0];
            t.save();
        }).catch(function(err){
            t.location = "NA";
            t.save();
        });
    }
}

function fetchMoreTweets(count,word){
    Tweet.find({searchTerm:word}).sort({tweet_id:1}).limit(1).exec(function(err, res){
        console.log(res);
        var params = {q: word,count: "100", max_id: res.tweet_id};
        client.get('search/tweets', params, function(error, tweets, response) {
          if (!error) {
            tweet = tweets.statuses[0];
            console.log("Fetched", tweets.statuses.length, "tweets for", params.q);
            for(i=0; i<tweets.statuses.length; i++){
                var temp = new Tweet;
                preProcess(tweets.statuses[i],temp, word);
            }
          }else{
            console.log(error);
          }
        });
    });
    if(count<4000)
        setTimeout(fetchMoreTweets.bind(null,count+100,word),10000);
    else
        startStream(word);
}

//Defining Routes for the API and application
app.post('/api/searchTweets', function(req,res){
    var word = req.body.text.toLowerCase();
    var params = {q: word,count: "100"};
    client.get('search/tweets', params, function(error, tweets, response) {
      if (!error) {
        tweet = tweets.statuses[0];
        console.log("Fetched", tweets.statuses.length, "tweets for", params.q);
        for(i=0; i<tweets.statuses.length; i++){
            var temp = new Tweet;
            preProcess(tweets.statuses[i],temp, word);
        }
      }else{
        console.log(error);
      }
    });
    var resp = {"success":"True"};
    setTimeout(fetchMoreTweets.bind(null,0,word),10000);
    res.json(resp);
});

app.get('/api/trends', function(req, res){
    var p = {"id":1};
    client.get("trends/place", p, function(error,trends,response){
        if(!error){
            var places = trends[0].trends;
            var names = []
            var n = 10;
            if(places.length < n){
                n = places.length;
            }
            for(i=0; i<n; i++){
                names.push(places[i].name);
            }
            res.json(names);
        }else{
            res.send(error);
        }
    });
});

app.post('/api/wordCount', function(req, res){
    var word = req.body.text;
    Tweet.aggregate([
        {"$match": {searchTerm:word}},
        {"$unwind": "$hashtags_mentions"},
        {"$group" : {_id:"$hashtags_mentions", count:{$sum:1}}},
        {"$sort" : {"count":-1}}
    ],function(err, resp){
        var op = [];
        for(i=0; i<resp.length; i++){
            if(resp[i]._id !=null){
                op.push({"text":resp[i]._id, "weight":resp[i].count});
            }
        }
        //var op = {"word":w, "count":c};
        res.json(op);
    });
});

app.post('/api/lang', function(req, res){
    var word = req.body.text;
    Tweet.aggregate([
        {"$match": {searchTerm:word}},
        {"$group" : {_id:"$lang", count:{$sum:1}}},
        {"$sort" : {"count":-1}}
    ],function(err, resp){
        var l = [];
        var c = [];
        for(i=0; i<resp.length; i++){
            if(resp[i]._id !=null){
                l.push(resp[i]._id);
                c.push(resp[i].count);
            }
        }
        var op = {"lang":l, "count":c};
        res.json(op);
    });
});

app.post('/api/location', function(req, res){
    var word = req.body.text;
    Tweet.aggregate([
        {"$match": {searchTerm:word}},
        {"$group" : {_id:"$location", count:{$sum:1}}},
        {"$sort" : {"count":-1}}
    ],function(err, resp){
        var l = [];
        var c = [];
        var plot = {};
        for(i=0; i<resp.length; i++){
            if(resp[i]._id !=null){
                l.push(resp[i]._id);
                c.push(resp[i].count);
                plot[resp[i]._id] = resp[i].count;
            }
        }
        var op = {"loc":l, "count":c, "plot":plot};
        res.json(op);
    });
});

app.post('/api/devices', function(req, res){
    var word = req.body.text;
    Tweet.aggregate([
        {"$match": {searchTerm:word}},
        {"$group" : {_id:"$source", count:{$sum:1}}},
        {"$sort" : {"count":-1}}
    ],function(err, resp){
        var s = [];
        var c = [];
        for(i=0; i<resp.length; i++){
            if(resp[i]._id !=null){
                s.push(resp[i]._id);
                c.push(resp[i].count);
            }
        }
        var op = {"source":s, "count":c};
        res.json(op);
    });
});

app.post('/api/date', function(req, res){
    var word = req.body.text;
    Tweet.aggregate([
        {"$match": {searchTerm:word}},
        {"$group" : {_id:"$date", count:{$sum:1}}},
        {"$sort" : {"count":-1}}
    ],function(err, resp){
        var d = [];
        var c = [];
        for(i=0; i<resp.length; i++){
            if(resp[i]._id !=null){
                d.push(resp[i]._id);
                c.push(resp[i].count);
            }
        }
        var op = {"date":d, "count":c};
        res.json(op);
    });
});

app.post('/api/sentiment', function(req, res){
    var word = req.body.text;
    Tweet.aggregate([
        {"$match": {searchTerm:word}},
        {"$group" : {_id:"$sentiment", count:{$sum:1}}},
        {"$sort" : {"count":-1}}
    ],function(err, resp){
        var s = [];
        var c = [];
        for(i=0; i<resp.length; i++){
            if(resp[i]._id !=null){
                s.push(resp[i]._id);
                c.push(resp[i].count);
            }
        }
        var op = {"sentiment":s, "count":c};
        res.json(op);
    });
});

app.get('/api/allTweets', function(req, res){
    Tweet.find(function(err, tweets){
        if(err){
            res.send(err);
        }
        res.send(tweets);
    });
});

app.get("*", function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});
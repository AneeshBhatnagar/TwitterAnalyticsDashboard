var express  = require('express'),
    app      = express(),        
    mongoose = require('mongoose'),
    morgan = require('morgan'),        
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    Twitter = require('twitter'),
    sentiment = require('sentiment'),
    NodeGeocoder = require('node-geocoder'); 

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
//var geocoder = NodeGeocoder.get('google');
//Search twitter feed

//var params = {q: 'Galaxy S8',count: 100, since_id: null};
//var params = {q: 'Trump',count: "100"};
function getSearch(params){
    client.get('search/tweets', params, function(error, tweets, response) {
      if (!error) {
        //console.log(tweets.statuses[0]);
        //process.exit()
        tweet = tweets.statuses[0];
        console.log("Fetched", tweets.statuses.length, "tweets for", params.q);
        for(i=0; i<tweets.statuses.length; i++){
            var temp = new Tweet;
            preProcess(tweets.statuses[i],temp);
        }
        /*//console.log(tweet);
        //console.log("User", tweet.user);
        //console.log("Location", tweet.user.location);
        //process.exit();
        count = 0;
        for(x in tweets.statuses){
            count++;
        }
        console.log("count: ", count);
        console.log(tweet.lang);
        var loc = tweet.user.location;
        if(loc)
        {
            geocoder.geocode(loc).then(function(res){
                console.log(loc);
                console.log(res[0]);
            }).catch(function(err){
                console.log(err);
            });
        }

        //console.log();
        console.log(tweet.text)
        console.log(tweet.id)
        var s = tweet.source.match(">([^<]*)<")[0];
        console.log(s.substring(1,s.length -1))
        console.log(tweet.user.screen_name)
        var hashtags = tweet.entities.hashtags
        var h = [];
        hashtags.forEach(function(ht){
            h.push("#"+ht.text.toLowerCase());
        });
        console.log(h);
        var mentions = tweet.entities.user_mentions
        var o = [];
        mentions.forEach(function(m){
            o.push("@"+m.screen_name.toLowerCase())
        });
        console.log(o)
        console.log(tweet.user.verified)
        console.log(tweet.created_at)
        console.log("Sentiment Score: " + sentiment(tweet.text).score)*/
      }else{
        console.log("error");
      }
    });
}

function getStream(word){
    var stream = client.stream('statuses/filter', {track: word});
    stream.on('data', function(event) {
      console.log("Event: " + event);
      console.log(JSON.stringify(event));
      //console.log("Event JSON: " + json(event));
      //console.log("Event Text: " + event.text);
    });
     
    stream.on('error', function(error) {
      throw error;
    });
}
//getSearch(params);
//getStream("Trump");

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");

var globalSearch;
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


function preProcess(xTweet, t){
    //console.log("In preProcess");
    t.tweet_id = xTweet.id;
    //console.log("ID:",xTweet.id);
    //console.log(xTweet.source);
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
    t.date = xTweet.created_at;
    t.sentiment = sentiment(xTweet.text).score;
    t.searchTerm = globalSearch;
    if(xTweet.user.location){
        geocoder.geocode(xTweet.user.location).then(function(res){
            t.location = res[0];
            //console.log(t);
            t.save();
            //console.log(t);
        }).catch(function(err){
            //console.log("NA");
            t.location = "NA";
            t.save();
        });
    }

    
}

var params = {q: '',count: "100"};

app.post('/api/searchTweets', function(req,res){
    globalSearch = req.body.text;
    params.q = globalSearch;
    console.log(params);
    client.get('search/tweets', params, function(error, tweets, response) {
      if (!error) {
        tweet = tweets.statuses[0];
        console.log("Fetched", tweets.statuses.length, "tweets for", params.q);
        for(i=0; i<tweets.statuses.length; i++){
            var temp = new Tweet;
            preProcess(tweets.statuses[i],temp);
        }
      }else{
        console.log(error);
      }
    });
    var resp = {"success":"True"};
    res.json(resp);
});

app.get('/api/tweets', function(req, res){
    //Returns all tweets from the database
});

app.get("*", function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

//Usage for Sentiment
console.log(sentiment("cats are stupid").score);
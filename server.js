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

var params = {screen_name: 'POTUS'};
function getSearch(params){
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        //console.log(tweets[0]);
        tweet = tweets[0];
        console.log(tweet.lang);
        var loc = tweet.user.location;
        if(loc)
        {
            geocoder.geocode(loc, function(err, res) {
              console.log(res[0]);
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
            h.push(ht.text);
        });
        console.log(h);
        var mentions = tweet.entities.user_mentions
        var o = [];
        mentions.forEach(function(m){
            o.push(m.screen_name)
        });
        console.log(o)
        console.log(tweet.user.verified)
        console.log(tweet.created_at)
        console.log("Sentiment Score: " + sentiment(tweet.text).score)
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
getStream("Trump");

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");

//Usage for Sentiment
console.log(sentiment("cats are stupid").score);
console.log(sentiment("cats are awesome").score);
var express = require('express');
var app = express();
var Twit = require('twit');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var search, cnt, count, date;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var T = new Twit({
    consumer_key:         'naaCnhwB20vwfwERi7zzQLEqh' // Your Consumer Key
  , consumer_secret:      'odENsSXHYYI2HlNGkkd1IQIvkJbywzo3LjMrFrMZfhtqePk4pl' // Your Consumer Secret
  , access_token:         '717749865497821184-riF9GaMRNI1L0V6zsfk5zp77O9A8Qdn' // Your Access Token
  , access_token_secret:  '7W7aPU3NZwtjQ7NpESibOEYyITx6o9ItYiIK0pTOAzR60' // Your Access Token Secret
});

search = "Ryerson";

server.listen(8081);



app.use(express.static(__dirname + '/public'));



app.get('/', function(req,res) {
        res.sendFile(__dirname + '/index.html');
});



app.post('/process_post', urlencodedParser, function (req, res) {

   // Prepare output in JSON format
   response = {
       keyword:req.body.keyword,
       counts:req.body.counts
   };
   console.log(response);

   search = JSON.stringify(response.keyword);
   cnt =  JSON.parse(response.counts);
   
   res.redirect('http://127.0.0.1:8081');
   
   console.log(count);
   //res.end(JSON.stringify(response));
});


io.sockets.on('connection', function (socket) {
  console.log('Connected');
  
  
    T.get('search/tweets', { q: search, count: cnt }, function(err, data, response) {
    // Do something with the JSON data returned.
    // (Consult Twitter's documentation on the format: 
    // https://dev.twitter.com/rest/reference/get/search/tweets)
       //console.log(data); 

    
        for (var i = 0; i < cnt; i++){
            
            io.sockets.emit('created',JSON.stringify(data.statuses[i].created_at));
            io.sockets.emit('text',JSON.stringify(data.statuses[i].text));
            io.sockets.emit('user',JSON.stringify(data.statuses[i].user.screen_name));
        
        }
    
        

    });
 });

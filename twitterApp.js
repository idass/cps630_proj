var express = require('express');
var app = express();
var Twit = require('twit');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'sql5.freemysqlhosting.net',
    user: 'sql5115151',
    password: 'iZauazDTDG',
    database: 'sql5115151'
});

connection.connect();



var search, cnt, count, date, post, text;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var T = new Twit({
    consumer_key:         'naaCnhwB20vwfwERi7zzQLEqh' // Your Consumer Key
  , consumer_secret:      'odENsSXHYYI2HlNGkkd1IQIvkJbywzo3LjMrFrMZfhtqePk4pl' // Your Consumer Secret
  , access_token:         '717749865497821184-riF9GaMRNI1L0V6zsfk5zp77O9A8Qdn' // Your Access Token
  , access_token_secret:  '7W7aPU3NZwtjQ7NpESibOEYyITx6o9ItYiIK0pTOAzR60' // Your Access Token Secret
});



server.listen(8081);



app.use(express.static('./stylesheet'));



app.get('/', function(req,res) {
        res.sendFile(__dirname + '/index.html');
});





//var buttonValue = req.body.go;



io.sockets.on('connection', function (socket) {
  console.log('Connected');
  
  
  
  //if (buttonValue == "Submit") {
    app.post('/process_post', urlencodedParser, function (req, res) {
        
        var buttonValue = req.body.go;
        console.log(buttonValue);

    if (buttonValue == "Submit") {
            
        
         // Prepare output in JSON format
        response = {
            keyword:req.body.keyword,
            counts:req.body.counts
        };
        //console.log(response);

        if ( response.keyword == "" ) {
             console.log("enter search keyword");
        
         }else if (response.counts == "") {
             console.log("enter number of tweets to return");
         }else{
             search = JSON.stringify(response.keyword);
             cnt =  JSON.parse(response.counts);
         }
   
        res.redirect('http://127.0.0.1:8081');
   
        //console.log(count);
        //res.end(JSON.stringify(response));
     
        T.get('search/tweets', { q: search, count: cnt }, function(err, data, response) {
            for (var i = 0; i < cnt; i++){
                if (data.statuses[i] == undefined) {
                
                console.log("undefined tweet error");
            
                }else{
                
                    io.sockets.emit('created',JSON.stringify(data.statuses[i].created_at));
                    io.sockets.emit('text',JSON.stringify(data.statuses[i].text));
                    io.sockets.emit('user',JSON.stringify(data.statuses[i].user.screen_name));
                
                    var tweet = {
                        search: search,
                        user: JSON.stringify(data.statuses[i].user.screen_name),
                        text: JSON.stringify(data.statuses[i].text),
                        date: JSON.stringify(data.statuses[i].created_at)
                    };
                
                    var query = connection.query('insert into sql5115151.twitApp set ?',tweet,function(err,result){
                        if (err) {
                            console.error(err);
                        }
                        console.error(result);
                    });

                }
            } 

        });
    }else if (buttonValue == "Post") {
        
        response = {
            postTweet:req.body.postTweet
        };

        post = JSON.stringify(response.postTweet);
        console.log(post);

        res.redirect('http://127.0.0.1:8081');
   
   
        T.post('statuses/update', { status: post }, function(err, data, response) {
            console.log(data);
            io.sockets.emit('you',JSON.stringify(data.user.screen_name));
            io.sockets.emit('posted',JSON.stringify(data.text));
        });
    
    }
    
    
    });
    
    
  /*}else if (buttonValue == "Post") {
     
    app.post('/process_post2', urlencodedParser, function (req, res) {

   // Prepare output in JSON format
        response = {
            postTweet:req.body.postTweet
        };

        post = JSON.stringify(response.postTweet);
        console.log(post);

        res.redirect('http://127.0.0.1:8081');
   
   //res.end(JSON.stringify(response));
   
        T.post('statuses/update', { status: post }, function(err, data, response) {
            console.log(data);
        });
    });
  }*/
    
    
});

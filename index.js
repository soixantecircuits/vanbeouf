'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var ytdl = require('ytdl-core');
var port = 1337;
var videoLengthLimit = 15; // in minutes



server.listen(process.env.PORT || port, '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

var routes = [
  '/',
  '/JCVD',
  '/JCVD/*',
  '/JCVD/*/',
  '/SLB',
  '/SLB/*',
  '/SLB/*/',
];

var handler = function (req, res){
  res.sendFile(__dirname + '/public/index.html');
}

routes.forEach(function (route) {
  app.get(route, handler);
});


io.on('connection', function (socket) {
  socket.on('send-URL', function (url) {
    ytdl.getInfo(url, function (err, info){
      if(err){
        console.error(err);
        return false;
      } else if(info.length_seconds > videoLengthLimit * 60) {
        socket.emit('video-too-long');
        return false;
      } else {
        var id = url.replace(/(http(s|):\/\/www\.youtube\.com\/watch\?v=)/gi, '');
        fs.readdir(__dirname + '/public/backgrounds/', function (err, files){
          if(err){
            console.error(err);
            return;
          }
          for (var i = 0; i < files.length; i++) {
            if(files[i] === id + '.flv'){
              console.log('file ' + id + ' already exists');
              socket.emit('download-ended', id);
              return;
            }
          }
          var download = ytdl(url)
          download.on('end', function(){
            socket.emit('download-ended', id);
          });
          download.pipe(fs.createWriteStream(__dirname + '/public/backgrounds/' + id + '.flv'));
        });
      }
    });
  });
});

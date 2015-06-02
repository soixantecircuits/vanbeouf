'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var ytdl = require('ytdl-core');
var port = 1337;

server.listen(port);

// app.get('/', function (req, res) {
//   res.sendfile(__dirname + '/index.html');
// });
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  socket.on('send-URL', function (url) {
    var id = url.replace(/http(s|):\/\/www\.youtube\.com\/watch\?v=/gi, '');
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
  });
});

console.log('Running on http://localhost:' + port);
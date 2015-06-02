'use strict';

var socket = io.connect('http://localhost:1337');

var btn = document.querySelector('#send');
var input = document.querySelector('#yt-url');

btn.onclick = function(){
  if(input.value.length){
    socket.emit('send-URL', input.value);
  }
}

socket.on('download-ended', function (id){
  var videoElement = document.createElement('video');
  videoElement.src = 'backgrounds/' + id + '.flv';
  videoElement.controls = true;
  document.body.appendChild(videoElement);
});
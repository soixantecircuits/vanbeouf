'use strict';

var socket = io.connect('http://192.168.1.21:1337');

var btn = document.querySelector('#send');
var input = document.querySelector('#yt-url');

var seriously, video, target, chroma, blend, prop, canvas, key;
var character = 'JCVD';
var currentProp, currentID;

btn.onclick = function(){
  if(input.value.length){
    socket.emit('send-URL', input.value);
  }
}

var list = document.querySelector('#props-list');
list.style.display = 'none';

for (var i = 0; i < 3; i++) {
  var li = document.createElement('li');
  var index = i + 1;

  var liImg = document.createElement('img');
  liImg.src = '/props/' + character + '/poster0' + index + '.png';
  liImg.width = liImg.height = 50;
  liImg.dataset.index = index;
  liImg.onclick = function (event){
    currentProp = event.target.dataset.index;
    initCanvas();
  }

  li.appendChild(liImg);
  list.appendChild(li);
}

socket.on('download-ended', function (id){
  currentID = id;
  list.style.display = 'block';
});

function initCanvas(){
  var videoElement = document.createElement('video');
  videoElement.src = 'backgrounds/' + currentID + '.flv';
  videoElement.id = "video"
  videoElement.controls = true;
  videoElement.autoplay = true;
  videoElement.style.display = 'none';
  document.body.appendChild(videoElement);

  var propsElement = document.createElement('video');
  propsElement.src = '/props/' + character + '/0' + currentProp + '.ogg';
  propsElement.id = "props";
  propsElement.controls = true;
  propsElement.autoplay = true;
  propsElement.loop = true;
  propsElement.style.display = 'none';
  document.body.appendChild(propsElement);

  seriously = new Seriously();

  key = seriously.source('#props');
  video = seriously.source('#video');
  target = seriously.target('#canvas');
  chroma = seriously.effect('chroma');
  blend = seriously.effect('blend');

  chroma.screen[0] = 0.07;
  chroma.screen[1] = 0.42;
  chroma.screen[2] = 0.13;

  chroma.source = key;
  blend.top = chroma;
  blend.bottom = video;
  target.source = blend;

  target.width = window.innerWidth;
  target.height = window.innerHeight;

  seriously.go();
}
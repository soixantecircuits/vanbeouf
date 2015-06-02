'use strict';

var socket = io.connect('http://192.168.1.21:1337');

var btn = document.querySelector('#send');
var input = document.querySelector('#yt-url');

var seriously, video, target, chroma, blend, prop, canvas, key, reformat;
var character = 'JCVD';
var currentProp, currentID;

var capturer = new CCapture({
  format: 'gif',
  workersPath: 'js/vendor/',
  framerate: 30,
  quality: 50,
  verbose: true
});
var record = document.querySelector('#record');
var isRecording = false;

var first = document.querySelector('.first-row');
var second = document.querySelector('.second-row');
var third = document.querySelector('.third-row');

btn.onclick = function(){
  if(input.value.length){
    socket.emit('send-URL', input.value);
    $(first).removeClass('fadeInUp').addClass('fadeOutDown');
    $(second).removeClass('fadeOutDown').addClass('fadeInUp');
    setTimeout(function() {
      input.value = '';
    }, 1000);
  }
}

var list = document.querySelector('#props-list');
list.style.display = 'none';

for (var i = 0; i < 11; i++) {
  var li = document.createElement('li');
  var index = i + 1;

  var liImg = document.createElement('img');
  liImg.src = '/props/' + character + '/poster' + index + '.PNG';
  liImg.dataset.index = index;
  liImg.onclick = function (event){
    currentProp = event.target.dataset.index;
    $(second).removeClass('fadeInUp').addClass('fadeOutDown');
    $(third).removeClass('fadeOutDown').addClass('fadeInUp');
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
  propsElement.src = '/props/' + character + '/' + currentProp + '.mp4';
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
  reformat = seriously.transform('reformat');

  chroma.screen[0] = 0.07;
  chroma.screen[1] = 0.42;
  chroma.screen[2] = 0.13;

  target.width = window.innerWidth;
  target.height = window.innerHeight;

  reformat.width = reformat.height = target.width;
  reformat.mode = 'height';
  reformat.source = key;

  chroma.source = reformat;
  blend.top = chroma;
  blend.bottom = video;
  target.source = blend;

  seriously.go();
}

record.onclick = function(){
  if(isRecording){
    capturer.stop();
    capturer.save(function (blob){
      // window.location = blob;
    });
    record.textContent = 'Record';
  } else {
    capturer.start();
    capturer.capture(document.querySelector('#canvas'));
    record.textContent = 'Stop';
  }
  isRecording = !isRecording;
}
'use strict';

var socket = io.connect('http://192.168.1.21:1337');

var send = document.querySelector('#send');
var input = document.querySelector('#yt-url');

var states = (location.pathname.length > 1) ? location.pathname.split('/') : [];
var currentState = states.length - 1;

var seriously, video, target, chroma, blend, prop, canvas, key, reformat;
var character = '' || states[1];
var currentProp = '' || states[2];
var currentID = '' || states[3];

// var capturer = new CCapture({
//   format: 'gif',
//   workersPath: 'js/vendor/',
//   framerate: 30,
//   quality: 100,
//   verbose: true
// });
// var record = document.querySelector('#record');
// var isRecording = false;

var first = document.querySelector('.first-row');
var second = document.querySelector('.second-row');
var third = document.querySelector('.third-row');
var list = document.querySelector('#props-list');

if(currentState === 1) {
  $(second).hide();
  $(third).hide();
  $(first).addClass('fadeInUp');

  generateProps();
} else if(currentState === 2){
  $(first).hide();
  $(third).hide();
  $(second).addClass('fadeInUp');
} else if(currentState === 3){
  $(first).hide();
  $(second).hide();
  $(third).addClass('fadeInUp');
  initCanvas();
} else {
  $(first).addClass('fadeInUp');
  $(second).hide();
  $(third).hide();

  $('.img-character').each(function(){
    $(this).one('click', function (event){
      character = event.target.dataset.character;
      history.pushState(character, '', character);
      generateProps();
    });
  });
}


function generateProps(){
  var other = character === 'JCVD' ? 'slb' : 'jcvd';
  $('#' + other).addClass('fadeOutLeft').width(0);
  for (var i = 0; i < 11; i++) {
    var li = document.createElement('li');
    var index = i + 1;

    var liImg = document.createElement('img');
    liImg.src = '/props/' + character + '/poster' + index + '.PNG';
    liImg.dataset.index = index;
    liImg.onclick = function (event){
      currentProp = event.target.dataset.index;
      history.pushState(currentProp, '', history.state + '/' + currentProp);
      $(first).removeClass('fadeInUp').addClass('fadeOutDown');
      $(second).show().removeClass('fadeOutDown').addClass('fadeInUp');
    }

    li.appendChild(liImg);
    list.appendChild(li);
  }
  $(list).removeClass('fadeOutDown').addClass('fadeInUp');
}

send.onclick = function(){
  if(input.value.length){
    socket.emit('send-URL', input.value);
    setTimeout(function() {
      input.value = '';
    }, 1000);
  }
}

socket.on('download-ended', function (id){
  currentID = id;
  history.pushState(id, '', history.state + '/' + id);
  initCanvas();
  $(second).removeClass('fadeInUp').addClass('fadeOutDown');
  $(third).show().removeClass('fadeOutDown').addClass('fadeInUp');
});

function initCanvas(){
  var videoElement = document.createElement('video');
  videoElement.src = '/backgrounds/' + currentID + '.flv';
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

  if(character === 'JCVD'){
    chroma.screen[0] = 0.07;
    chroma.screen[1] = 0.42;
    chroma.screen[2] = 0.13;
  } else {
    chroma.screen[0] = 0.21;
    chroma.screen[1] = 0.41;
    chroma.screen[2] = 0.27;
  }

  target.width = window.innerWidth;
  target.height = window.innerHeight;

  reformat.width = reformat.height = target.width;
  reformat.mode = 'width';
  reformat.source = key;

  chroma.source = reformat;
  blend.top = chroma;
  blend.bottom = video;
  target.source = blend;

  seriously.go(function(){
    key.update();
  });
}

// record.onclick = function(){
//   if(isRecording){
//     capturer.stop();
//     capturer.save(function (blob){
//       window.location = blob;
//     });
//     record.textContent = 'Record';
//   } else {
//     capturer.start();
//     capturer.capture(document.querySelector('#canvas'));
//     record.textContent = 'Stop';
//   }
//   isRecording = !isRecording;
// }
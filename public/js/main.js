'use strict';

var socket = io.connect('http://192.168.1.21:1337');

var send = document.querySelector('#send');
var input = document.querySelector('#yt-url');

var states = (location.pathname.length > 1) ? location.pathname.split('/') : [];
states = cleanEmptyArray(states);
var currentState = states.length;

var seriously, video, target, chroma, blend, prop, canvas, key, formatKey, formatVideo;
var character = '' || states[0];
var currentProp = '' || states[1];
var currentID = '' || states[2];

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
var list = document.querySelector('#props-list');
var form = document.querySelector('.form');

function cleanEmptyArray(array){
  for (var i = 0; i < array.length; i++) {
    if(array[i] == ''){
      array.splice(i, 1);
      i--;
    }
  }
  return array;
}

if(currentState === 1) {
  $(second).hide();
  $(form).hide();
  $(first).addClass('fadeInUp');
  $('.pick').hide();
  $('.character').addClass('active smaller');
  generateProps();
} else if(currentState === 2){
  $(second).hide();
  $(first).addClass('fadeInUp');
  $('.pick').hide();
  $('.character').addClass('active smaller');
  generateProps();
} else if(currentState === 3){
  $(first).hide();
  $(second).addClass('fadeInUp');
  initCanvas();
} else {
  $(first).addClass('fadeIn');
  $(second).hide();
  $(form).hide();
  setTimeout(function() {
    $('.separator').addClass('active');
    $('.character').addClass('active');
  }, 500);

  $('.img-character').each(function(){
    $(this).one('click', function (event){
      $('.separator').removeClass('active');
      $('.character').addClass('smaller');
      $('.pick').addClass('animated fadeOutUp');
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
      history.pushState(currentProp, '', character + '/' + currentProp);
      $(form).show().addClass('animated fadeInUp');
    }

    li.appendChild(liImg);
    list.appendChild(li);
  }
  $(list).removeClass('fadeOutDown').addClass('fadeInUp');
}

send.onclick = function(){
  if(!input.value.length){
    return;
  } else if(!input.value.match(/(http(s|):\/\/www\.youtube\.com\/watch\?v=)/gi)){
    var errorElem = document.createElement('div');
    errorElem.className = 'error animated';
    errorElem.textContent = 'Oops... It\'s seems like your video is not hosted on YouTube!';
    errorElem.style.display = 'none';
    document.querySelector('.second-row').appendChild(errorElem);
    $(errorElem).show().addClass('fadeIn');
    setTimeout(function() {
      removeGracefully(errorElem, 'fadeIn', 'fadeOut');
    }, 5000);
    return;
  }
  socket.emit('send-URL', input.value);
  input.value = '';

  var loaderElem = document.createElement('div');
  loaderElem.className = 'load animated';
  loaderElem.textContent = 'Loading...';
  document.querySelector('.first-row').appendChild(loaderElem);
  $(loaderElem).show().addClass('fadeIn');
}

socket.on('video-too-long', function(){
  removeGracefully('.load', 'fadeIn', 'fadeOut');
  var errorElem = document.createElement('div');
  errorElem.className = 'error animated';
  errorElem.textContent = 'Oops... Your video is too long! Please take a shorter one.';
  errorElem.style.display = 'none';
  document.querySelector('.first-row').appendChild(errorElem);
  $(errorElem).show().addClass('fadeIn');
  setTimeout(function() {
    removeGracefully(errorElem, 'fadeIn', 'fadeOut');
  }, 5000);
});

function removeGracefully(elem, effectToRemove, effectToAdd){
  $(elem).removeClass(effectToRemove).addClass(effectToAdd);
  setTimeout(function() {
    $(elem).remove();
  }, 1000);
}

socket.on('download-ended', function (id){
  removeGracefully('.load', 'fadeIn', 'fadeOut');
  currentID = id;
  history.pushState(id, '', history.state + '/' + id);
  initCanvas();
  $(first).removeClass('fadeInUp').addClass('fadeOutDown');
  $(second).show().removeClass('fadeOutDown').addClass('fadeInUp');
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
  formatKey = seriously.transform('reformat');
  formatVideo = seriously.transform('reformat');

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

  formatKey.width = formatKey.height = target.original.width;
  formatKey.mode = 'width';
  formatKey.source = key;
  chroma.source = formatKey;
  blend.top = chroma;

  formatVideo.width = formatVideo.height = target.original.width;
  formatVideo.mode = 'width';
  formatVideo.source = video;
  blend.bottom = formatVideo;

  target.source = blend;

  seriously.go(function(){
    key.update();
  });

  document.querySelector('.rrssb-email > a').href="mailto:?subject=VanBeouf&body= " + location.href;
  document.querySelector('.rrssb-facebook > a').href="https://www.facebook.com/sharer/sharer.php?u=" + location.href;
  document.querySelector('.rrssb-twitter > a').href="http://twitter.com/home?status=" + location.href;
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
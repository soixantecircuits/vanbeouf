'use strict';

var socket = io.connect(':'+location.port);

var states = (location.pathname.length > 1) ? location.pathname.split('/') : [];
states = cleanEmptyArray(states);
var currentState = states.length;

var seriously, video, target, chroma, blend, prop, canvas, key, formatKey, formatVideo;
var character = '' || states[0];
var currentProp = '' || states[1];
var currentID = '' || states[2];

// var msg = '', status = Seriously.incompatible();
// if (status) {
//   if (status === 'canvas') {
//     msg = 'Your browser does not support HTML Canvas. Please consider upgrading.';
//   } else if (status === 'webgl') {
//     msg = 'Your browser does not support WebGL. Please try Firefox or Chrome.';
//   } if (status === 'context') {
//     msg = 'Your graphics hardware does not support WebGL. You may need to upgrade your drivers.';
//   } else {
//     msg = 'Unable to display content.'; //unknown error
//   }
//   var elem = document.createElement('div');
//   elem.className = 'incompatible';
//   elem.textContent = msg;
//   document.body.appendChild(elem);
// }

var first = document.querySelector('.first-row');
var second = document.querySelector('.second-row');
var third = document.querySelector('.third-row');
var list = document.querySelector('#props-list');
var BGColor = {JCVD: '#9dff3b', SLB: '#3c47c2'};
if(character !== ''){
  if(character === 'JCVD'){
    $('.row').each(function(){
      $(this).css('background-color', BGColor.JCVD);
    });
  } else {
    $('.row').each(function(){
      $(this).css('background-color', BGColor.SLB);
    });
  }
}

function cleanEmptyArray(array){
  for (var i = 0; i < array.length; i++) {
    if(array[i] == ''){
      array.splice(i, 1);
      i--;
    }
  }
  return array;
}

function initPreload(){
  for(var i = 1; i < 12; i++){
      var imgObjJCVD = new Image();
      imgObjJCVD.src = '/props/JCVD/poster' + i + '.png';
      var imgObjSLB = new Image();
      imgObjSLB.src = '/props/SLB/poster' + i + '.png';
  }
}
initPreload();

if(currentState === 1) {
  $(first).hide();
  $(third).hide();
  var fullname = (character === 'JCVD') ? 'Van Damme' : 'LaBeouf';
  $('#picked-character').text(fullname);
  $(second).addClass('fadeIn');
  generateProps();
} else if(currentState === 2){
  $(first).hide();
  $(third).hide();
  var fullname = (character === 'JCVD') ? 'Van Damme' : 'LaBeouf';
  $('#picked-character').text(fullname);
  $(second).addClass('fadeIn');
  generateProps();
} else if(currentState === 3){
  $(first).hide();
  $(second).hide();
  $(third).addClass('fadeIn');
  initCanvas();
} else {
  $(first).addClass('fadeIn');
  $(second).hide();
  $(third).hide();
  $('.character').addClass('active');

  $('.img-character').each(function(){
    $(this).one('click', function (event){
      $('.character').addClass('picked');
      $('.pick').addClass('animated fadeOutUp');
      character = event.target.dataset.character;
      history.pushState(character, '', character);
      var fullname = (character === 'JCVD') ? 'Van Damme' : 'LaBeouf';
      $('#picked-character').text(fullname);
      generateProps();
      $(first).removeClass('fadeIn').addClass('fadeOut');
      $(second).show().removeClass('fadeOut').addClass('fadeIn');
    });
  });
}

function generateProps(){
  for (var i = 0; i < 11; i++) {
    var li = document.createElement('li');
    li.className = 'col-md-3 col-sm-6 col-xs-12';
    li.dataset.packeryOptions = '{ "itemSelector": ".item", "gutter": 10 }';

    var index = i + 1;
    var liImg = document.createElement('img');
    liImg.src = '/props/' + character + '/poster' + index + '.png';
    liImg.dataset.index = index;
    liImg.onclick = function (event){
      $('.form').remove();
      $('li > img').removeClass('active');
      $(event.target).addClass('active');
      currentProp = event.target.dataset.index;
      history.replaceState(currentProp, '', '/' + character + '/' + currentProp);
      var form = document.createElement('form');
      var label = document.createElement('label');
      var input = document.createElement('input');
      var btn = document.createElement('button');

      form.className = 'form';
      form.style.display = 'none';

      label.textContent = 'Paste the link of a Youtube video';
      label.setAttribute('for', 'yt');

      input.id = "yt-url";
      input.className = 'form-control';
      input.type = 'url';
      input.name = 'yt';
      input.placeholder = "video URL";

      btn.type = 'submit';
      btn.textContent = 'Vanbeoufize';
      btn.className = 'btn btn-default';
      btn.onclick = function(event){
        sendURL(event, input);
      }

      form.appendChild(label);
      form.appendChild(input);
      form.appendChild(btn);
      event.target.parentElement.appendChild(form);
      $(form).show().addClass('animated fadeIn');
      $(input).focus();
    }

    li.appendChild(liImg);
    list.appendChild(li);
  }
}

function sendURL(event, input){
  event.preventDefault();
  if(!input.value.length){
    return;
  } else if(!input.value.match(/(http(s|):\/\/www\.youtube\.com\/watch\?v=)/gi)){
    var errorElem = document.createElement('div');
    errorElem.className = 'error animated';
    errorElem.textContent = 'Oops... It\'s seems like your video is not hosted on YouTube!';
    errorElem.style.display = 'none';
    second.appendChild(errorElem);
    $(errorElem).show().addClass('fadeIn');
    setTimeout(function() {
      removeGracefully(errorElem, 'fadeIn', 'fadeOut');
    }, 5000);
    return;
  }
  socket.emit('send-URL', input.value);

  var loaderElem = document.createElement('div');
  loaderElem.className = 'load animated';
  loaderElem.textContent = 'Loading...';
  document.querySelector('.second-row').appendChild(loaderElem);
  $(loaderElem).show().addClass('fadeIn');
}

socket.on('video-too-long', function(){
  removeGracefully('.load', 'fadeIn', 'fadeOut');
  var errorElem = document.createElement('div');
  errorElem.className = 'error animated';
  errorElem.textContent = 'Oops... Your video is too long! Please take a shorter one.';
  errorElem.style.display = 'none';
  second.appendChild(errorElem);
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
  $(second).removeClass('fadeIn').addClass('fadeOut');
  $(third).show().removeClass('fadeOut').addClass('fadeIn');
});

function initCanvas(){
  $(document.body).addClass('hide-overflow');

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

  document.querySelector('.soc-email2').href="mailto:?subject=VanBeouf&body= Here's my Vanbeouf video " + location.href + ". Do your Vanbeouf too " + location.origin + " ! Just do it ! #Vanbeouf";
  document.querySelector('.soc-facebook').href="https://www.facebook.com/sharer/sharer.php?u=I’ve just vanbeoufed this video " + location.href +". Be aware, and make your dreams come true, do your Vanbeouf too " + location.origin + ". Just do it ! #vanbeouf";
  document.querySelector('.soc-twitter').href="http://twitter.com/home?status=I’ve just vanbeoufed this video " + location.href +". Check it out and do your own #Vanbeouf too. Just do it ! cc @soixanteci ";
}

$(window).on('popstate', function() {
  location.reload();
});
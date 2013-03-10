function getCurSlideFromHash() {
  var slideNo = parseInt(location.hash.substr(1));
  if (slideNo) {
    return slideNo - 1;
  } else {
    return 0;
  }
}

function disableFrame(frame) {
  frame.src = 'about:blank';
}

function enableFrame(frame) {
  var src = frame._src;
  if (frame.src != src && src != 'about:blank') {
    frame.src = src;
  }
}

function addPrettify() {
  var els = document.querySelectorAll('pre');
  for (var i = 0, el; el = els[i]; i++) {
    if (!el.classList.contains('noprettyprint')) {
      el.classList.add('prettyprint');
    }
  }
  var el = document.createElement('script');
  el.type = 'text/javascript';
  el.src = libUrlPrefix + 'prettify.js';
  el.onload = function () {
    prettyPrint();
  };
  document.body.appendChild(el);
}

function makeBuildLists() {
  for (var i = curSlide, slide; slide = slideEls[i]; i++) {
    var items = slide.querySelectorAll('.build > *');
    for (var j = 0, item; item = items[j]; j++) {
      if (item.classList) {
        item.classList.add('to-build');
      }
    }
  }
}

function addEventListeners() {
  document.addEventListener('keydown', handleBodyKeyDown, false);
}

function handleTouchStart(event) {
  if (event.touches.length == 1) {
    touchDX = 0;
    touchDY = 0;
    touchStartX = event.touches[0].pageX;
    touchStartY = event.touches[0].pageY;
    document.body.addEventListener('touchmove', handleTouchMove, true);
    document.body.addEventListener('touchend', handleTouchEnd, true);
  }
}

function handleTouchMove(event) {
  if (event.touches.length > 1) {
    cancelTouch();
  } else {
    touchDX = event.touches[0].pageX - touchStartX;
    touchDY = event.touches[0].pageY - touchStartY;
  }
}

function handleTouchEnd(event) {
  var dx = Math.abs(touchDX);
  var dy = Math.abs(touchDY);
  if ((dx > PM_TOUCH_SENSITIVITY) && (dy < (dx * 2 / 3))) {
    if (touchDX > 0) {
      prevSlide();
    } else {
      nextSlide();
    }
  }
  cancelTouch();
}

function cancelTouch() {
  document.body.removeEventListener('touchmove', handleTouchMove, true);
  document.body.removeEventListener('touchend', handleTouchEnd, true);
}

function setupInteraction() {
  var el = document.createElement('div');
  el.className = 'slide-area';
  el.id = 'prev-slide-area';
  el.addEventListener('click', prevSlide, false);
  document.querySelector('section.slides').appendChild(el);
  el = document.createElement('div');
  el.className = 'slide-area';
  el.id = 'next-slide-area';
  el.addEventListener('click', nextSlide, false);
  document.querySelector('section.slides').appendChild(el);
  document.body.addEventListener('touchstart', handleTouchStart, false);
}

function updateHash() {
  location.replace('#' + (curSlide + 1));
}

function initialize() {
  console.log('initialize');
  getCurSlideFromHash();
  slideEls = document.querySelectorAll('section.slides > article');
  setupFrames();
  addPrettify();
  addEventListeners();
  updateSlides();
  setupInteraction();
  makeBuildLists();
  document.body.classList.add('loaded');
}

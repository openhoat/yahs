var baseDir = '../'
  , slideClasses = ['far-past', 'past', 'current', 'next', 'far-next']
  , slideEls
  , curSlide
  , touchDX
  , touchDY
  , touchStartX
  , touchStartY;

function getCurSlideFromHash() {
  var slideNo = parseInt(location.hash.substr(1));
  if (slideNo) {
    curSlide = slideNo - 1;
  } else {
    curSlide = 0;
  }
}

function getSlideEl(no) {
  if ((no < 0) || (no >= slideEls.length)) {
    return null;
  } else {
    return slideEls[no];
  }
}

function updateSlideClass(slideNo, className) {
  var el = getSlideEl(slideNo);
  if (!el) {
    return;
  }
  if (className) {
    el.classList.add(className);
  }
  for (var i in slideClasses) {
    if (className != slideClasses[i]) {
      el.classList.remove(slideClasses[i]);
    }
  }
}

function triggerEnterEvent(no) {
  var el = getSlideEl(no);
  if (!el) {
    return;
  }
  var onEnter = el.getAttribute('onslideenter');
  if (onEnter) {
    new Function(onEnter).call(el);
  }
  var evt = document.createEvent('Event');
  evt.initEvent('slideenter', true, true);
  evt.slideNumber = no + 1; // Make it readable
  el.dispatchEvent(evt);
}

function triggerLeaveEvent(no) {
  var el = getSlideEl(no);
  if (!el) {
    return;
  }
  var onLeave = el.getAttribute('onslideleave');
  if (onLeave) {
    new Function(onLeave).call(el);
  }
  var evt = document.createEvent('Event');
  evt.initEvent('slideleave', true, true);
  evt.slideNumber = no + 1; // Make it readable
  el.dispatchEvent(evt);
}

function disableSlideFrames(no) {
  var el = getSlideEl(no);
  if (!el) {
    return;
  }
  var frames = el.getElementsByTagName('iframe');
  for (var i = 0, frame; frame = frames[i]; i++) {
    disableFrame(frame);
  }
}

function enableSlideFrames(no) {
  var el = getSlideEl(no);
  if (!el) {
    return;
  }
  var frames = el.getElementsByTagName('iframe');
  for (var i = 0, frame; frame = frames[i]; i++) {
    enableFrame(frame);
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

function setupFrames() {
  var frames = document.querySelectorAll('iframe');
  for (var i = 0, frame; frame = frames[i]; i++) {
    frame._src = frame.src;
    disableFrame(frame);
  }
  enableSlideFrames(curSlide);
  enableSlideFrames(curSlide + 1);
  enableSlideFrames(curSlide + 2);
}

function updateSlides() {
  for (var i = 0; i < slideEls.length; i++) {
    switch (i) {
      case curSlide - 2:
        updateSlideClass(i, 'far-past');
        break;
      case curSlide - 1:
        updateSlideClass(i, 'past');
        break;
      case curSlide:
        updateSlideClass(i, 'current');
        break;
      case curSlide + 1:
        updateSlideClass(i, 'next');
        break;
      case curSlide + 2:
        updateSlideClass(i, 'far-next');
        break;
      default:
        updateSlideClass(i);
        break;
    }
  }
  triggerLeaveEvent(curSlide - 1);
  triggerEnterEvent(curSlide);
  window.setTimeout(function () {
    // Hide after the slide
    disableSlideFrames(curSlide - 2);
  }, 301);
  enableSlideFrames(curSlide - 1);
  enableSlideFrames(curSlide + 2);
  updateHash();
}

function buildNextSlide() {
  var toBuild = slideEls[curSlide].querySelectorAll('.to-build');
  if (!toBuild.length) {
    return false;
  }
  toBuild[0].classList.remove('to-build');
  return true;
}

function firstSlide() {
  curSlide = 0;
  updateSlides();
}

function lastSlide() {
  curSlide = slideEls.length - 1;
  updateSlides();
}

function prevSlide() {
  if (curSlide > 0) {
    curSlide--;
    updateSlides();
  }
}

function nextSlide() {
  if (buildNextSlide()) {
    return;
  }
  if (curSlide < slideEls.length - 1) {
    curSlide++;
    updateSlides();
  }
}

function handleBodyKeyDown(event) {
  switch (event.keyCode) {
    case 36: // home
      firstSlide();
      event.preventDefault();
      break;
    case 35: // end
      lastSlide();
      event.preventDefault();
      break;
    case 39: // right arrow
    case 13: // Enter
    case 32: // space
    case 34: // PgDn
      nextSlide();
      event.preventDefault();
      break;
    case 37: // left arrow
    case 8: // Backspace
    case 33: // PgUp
      prevSlide();
      event.preventDefault();
      break;
    case 40: // down arrow
      nextSlide();
      event.preventDefault();
      break;
    case 38: // up arrow
      prevSlide();
      event.preventDefault();
      break;
  }
}

function addPrettify() {
  var hasPrettyPrint = false;
  $.each($('pre'), function () {
    if (!$(this).hasClass('noprettyprint')) {
      $(this).addClass('prettyprint');
      hasPrettyPrint = true;
    }
  });
  /*
   if (hasPrettyPrint) {
   $.getScript(baseDir + 'lib/prettify.js', function () {
   prettyPrint();
   });
   }
   */
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

function addSlideNumbers() {
  var slideNumberContainer;
  $.each(slideEls, function (index, item) {
    $(item).addClass('slide' + (index + 1));
    slideNumberContainer = $(item).find('div.slidenumber');
    if (slideNumberContainer.length > 0) {
      $(slideNumberContainer).html(index + 1);
    }
  });
}

function initialize() {
  console.log('initialize');
  getCurSlideFromHash();
  slideEls = $('section.slides > article');
  addSlideNumbers();
  setupFrames();
  addPrettify();
  addEventListeners();
  updateSlides();
  setupInteraction();
  makeBuildLists();
  prettyPrint();
  $('body').addClass('loaded');
}

$(function () {
  initialize();
});

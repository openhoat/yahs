function SlideShow() {
  var slideClasses = ['far-past', 'past', 'current', 'next', 'far-next']
    , slideIndex = 0
    , slides = null;

  function getSlide(index) {
    return index >= 0 && index < slides.length ? slides[index] : null;
  }

  function addSlideNumbers() {
    var slideNumberContainer;
    $.each(slides, function (index, item) {
      $(item).addClass('slide' + (index + 1));
      slideNumberContainer = $(item).find('div.slidenumber');
      if (slideNumberContainer.length > 0) {
        $(slideNumberContainer).text(index + 1);
      }
    });
  }

  function resetIndexFromHash() {
    var index = parseInt(location.hash.substr(1));
    if (index) {
      slideIndex = index - 1;
    } else {
      slideIndex = 0;
    }
  }

  function setFrame(frame, enable) {
    if (enable) {
      if (frame.src != frame._src && frame._src != 'about:blank') {
        frame.src = frame._src;
      }
    } else {
      frame.src = 'about:blank';
    }
  }

  function setSlideFrames(index, enable) {
    var slide = getSlide(index);
    if (!slide) {
      return;
    }
    var frames = $(slide).find('iframe');
    for (var i = 0, frame; frame = frames[i]; i++) {
      setFrame(frame, enable);
    }
  }

  function initFrames() {
    var frames = $('iframe');
    for (var i = 0, frame; frame = frames[i]; i++) {
      frame._src = frame.src;
      setFrame(frame, false);
    }
    setSlideFrames(slideIndex, true);
    setSlideFrames(slideIndex + 1, true);
    setSlideFrames(slideIndex + 2, true);
  }

  function addPrettify() {
    var hasPrettyPrint = false;
    $.each($('pre'), function () {
      if (!$(this).hasClass('noprettyprint')) {
        $(this).addClass('prettyprint');
        hasPrettyPrint = true;
      }
    });
  }

  function firstSlide() {
    slideIndex = 0;
    updateSlides();
  }

  function lastSlide() {
    slideIndex = slides.length - 1;
    updateSlides();
  }

  function prevSlide() {
    if (slideIndex > 0) {
      slideIndex--;
      updateSlides();
    }
  }

  function buildNextSlide() {
    var toBuild = $(slides[slideIndex]).find('.to-build');
    if (!toBuild.length) {
      return false;
    }
    $(toBuild[0]).removeClass('to-build');
    return true;
  }

  function nextSlide() {
    if (buildNextSlide()) {
      return;
    }
    if (slideIndex < slides.length - 1) {
      slideIndex++;
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

  function addEventListeners() {
    $(document).bind('keydown', handleBodyKeyDown);
  }

  function triggerSlideEvent(index, enter) {
    var slide = getSlide(index)
      , onEvent
      , evt;
    if (!slide) {
      return;
    }
    onEvent = slide.getAttribute(enter ? 'onslideenter' : 'onslideleave');
    if (onEvent) {
      new Function(onEvent).call(slide);
    }
    evt = document.createEvent('Event');
    evt.initEvent(enter ? 'slideenter' : 'slideleave', true, true);
    evt.slideNumber = index + 1;
    slide.dispatchEvent(evt);
  }

  function updateHash() {
    location.replace('#' + (slideIndex + 1));
  }

  function updateSlideClass(index, className) {
    var slide = getSlide(index)
      , i;
    if (!slide) {
      return;
    }
    if (className) {
      $(slide).addClass(className);
    }
    for (i = 0; i < slideClasses.length; i++) {
      if (className != slideClasses[i]) {
        $(slide).removeClass(slideClasses[i]);
      }
    }
  }

  function updateSlides() {
    for (var i = 0; i < slides.length; i++) {
      switch (i) {
        case slideIndex - 2:
          updateSlideClass(i, 'far-past');
          break;
        case slideIndex - 1:
          updateSlideClass(i, 'past');
          break;
        case slideIndex:
          updateSlideClass(i, 'current');
          break;
        case slideIndex + 1:
          updateSlideClass(i, 'next');
          break;
        case slideIndex + 2:
          updateSlideClass(i, 'far-next');
          break;
        default:
          updateSlideClass(i);
          break;
      }
    }
    triggerSlideEvent(slideIndex - 1, false);
    triggerSlideEvent(slideIndex, true);
    window.setTimeout(function () {
      setSlideFrames(slideIndex - 2, false);
    }, 301);
    setSlideFrames(slideIndex - 1, true);
    setSlideFrames(slideIndex + 2, true);
    updateHash();
  }

  function handleTouchStart(event) {
    if (event.touches.length == 1) {
      touchDX = 0;
      touchDY = 0;
      touchStartX = event.touches[0].pageX;
      touchStartY = event.touches[0].pageY;
      $(document.body).bind('touchmove', handleTouchMove);
      $(document.body).bind('touchend', handleTouchEnd);
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length > 1) {
      cancelTouch();
    } else {
      touchDX = event.touches[0].pageX - touchStartX;
      touchDY = event.touches[0].pageY - touchStartY;
    }
    return false;
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
    return false;
  }

  function setupInteraction() {
    var slideArea = $('<div/>', {
      id: 'prev-slide-area',
      'class': 'slide-area'
    });
    slideArea.click(prevSlide);
    $('section.slides').append(slideArea);
    slideArea = $('<div/>', {
      id: 'next-slide-area',
      'class': 'slide-area'
    });
    slideArea.click(nextSlide);
    $('section.slides').append(slideArea);
    $(document.body).bind('touchstart', handleTouchStart);
  }

  function makeBuildLists() {
    slides.find('.build > *').addClass('to-build');
  }

  function init() {
    slides = $('section.slides > article');
    addSlideNumbers();
    resetIndexFromHash();
    initFrames();
    addPrettify();
    addEventListeners();
    updateSlides();
    setupInteraction();
    makeBuildLists();
    prettyPrint();
  }

  function start() {
    $('body').addClass('loaded');
  }

  return {
    init: init,
    start: start
  };
}

$(function () {
//  initialize();
  var slideShow = SlideShow();
  slideShow.init();
  slideShow.start();
});

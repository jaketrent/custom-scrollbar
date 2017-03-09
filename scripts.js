document.addEventListener('DOMContentLoaded', _ => {
  console.log('loaded')

  const frame = {
    el: document.querySelector('.frame'),
    height: document.querySelector('.frame').offsetHeight,
  }
  const content = {
    el: document.querySelector('.content'),
    height: document.querySelector('.content').offsetHeight,
  }
  const bar = {
    el: document.querySelector('.bar'),
    height: document.querySelector('.bar').offsetHeight,
  }
  const handle = {
    el: document.querySelector('.handle'),
    height: document.querySelector('.handle').offsetHeight,
  }

  function calcHandleHeight(frameHeight, contentHeight, barHeight) {
    const percentContentVisible = frameHeight / contentHeight
    const newHeight = Math.floor(percentContentVisible * barHeight)
    return newHeight
  }

  function renderHeight(widget, height) {
    widget.el.style.height = height
    widget.height = height
    return widget
  }

  renderHeight(handle, calcHandleHeight(frame.height, content.height, bar.height))

  console.log('frame height', frame.height)
  console.log('content height', content.height)

  ;(function monkeyPatchWheelListener(window, document) {

    var prefix = "", _addEventListener, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaY: 0,
                deltaZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };
            
            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }
  })(window, document)

  let deltaYSum = 0
  let ticking = false
  window.addWheelListener(frame.el, evt => {
    deltaYSum += evt.deltaY

    if (!ticking) {
      window.requestAnimationFrame(_ => {
        scroll(frame, content, handle, bar, deltaYSum)
        ticking = false
        deltaYSum = 0
      })
    }
    ticking = true
  })

  function scroll(frame, content, handle, bar, deltaY) {
    const newScrollTop = calcFrameScrollTop(frame, deltaY)
    renderFrameScrollTop(frame, newScrollTop)
    const percent = calcFramePercentScroll(frame, content)
    const newHandleTop = calcHandleTop(bar, handle, percent)
    renderHandleTop(handle, newHandleTop)
  }

  function calcFrameScrollTop(frame, deltaY) {
    return frame.el.scrollTop + deltaY
  }

  function renderFrameScrollTop(frame, top) {
    frame.el.scrollTop = top
    return frame
  }

  function calcFramePercentScroll(frame, content) {
    return frame.el.scrollTop / content.height
  }

  function calcHandleTop(bar, handle, percent) {
    const topByPercent = bar.height * percent
    return topByPercent < 0
      ? 0
      : topByPercent > bar.height - handle.height
        ? bar.height - handle.height
        : topByPercent
  }

  function renderHandleTop(handle, top) {
    handle.el.style.top = top + 'px'
    return handle
  }

})

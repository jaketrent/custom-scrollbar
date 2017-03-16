// handle resize of window
// handle click to page
// no scroll bar if no need to scroll
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

  ;(function monkeyPatchMouseWheelListener(window, document) {
    const support = 'onwheel' in document.createElement('div')
      ? 'wheel' // modern
      : 'mousewheel' // webkit & IE

    window.addWheelListener = function addWheelListener(elem, callback, useCapture) {
      const handler = support == 'wheel' ? callback : function normalizeOldEvent(originalEvent) {
        const event = {
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: 1,
          deltaX: 0,
          deltaY: 0,
          deltaZ: 0,
          preventDefault: originalEvent.preventDefault
        }

        if (support == 'mousewheel') {
          event.deltaY = - 1 / 40 * originalEvent.wheelDelta
          originalEvent.wheelDeltaX && (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX)
        } else {
          event.deltaY = originalEvent.detail
        }
        return callback(event)
      }

      elem.addEventListener(support, handler, useCapture)
      return elem
    }
  })(window, document)

  let deltaYSum = 0
  let ticking = false
  window.addWheelListener(frame.el, evt => {
    evt.preventDefault()
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

  function parseTop(el) {
    return el.style.top.replace(/^(\d+)px$/, '$1')
  }

  function calcSafeHandleTop(bar, handle, top) {
    return top < 0
      ? 0
      : top > bar.height - handle.height
        ? bar.height - handle.height
        : top
  }

  function calcPercentHandleDownBar(handle, bar) {
    return parseTop(handle.el) / bar.height
  }

  function drag(frame, content, handle, bar, clientY, dragYOffset) {
    const topByEvent = clientY - dragYOffset
    const handleNewTop = calcSafeHandleTop(bar, handle, topByEvent)
    renderHandleTop(handle, handleNewTop)

    const percent = calcPercentHandleDownBar(handle, bar)
    const frameScrollTop = content.height * percent
    renderFrameScrollTop(frame, frameScrollTop)
  }

  let isDrag = false
  let handleDragPointOffset = 0
  window.addEventListener('mousedown', evt => {
    if (evt.target.id === 'handle') {
      isDrag = true
      handleDragPointOffset = evt.clientY - parseTop(evt.target)
    }
  })

  window.addEventListener('mouseup', evt => {
    isDrag = false
  })

  window.addEventListener('mousemove', evt => {
    // TODO: hook up to requestAnimationFrame
    console.log('evt')
    if (isDrag) {
      drag(frame, content, handle, bar, evt.clientY, handleDragPointOffset)
    }
  })

})

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

  console.log('frame height', frame.height)
  console.log('content height', content.height)

  function calcHandleHeight(frameHeight, contentHeight, barHeight) {
    const percentContentVisible = frameHeight / contentHeight
    const newHeight = Math.floor(percentContentVisible * barHeight)
    return newHeight
  }

  function renderHeight(widget, height) {
    widget.el.style.height = height
    return widget
  }

  renderHeight(handle, calcHandleHeight(frame.height, content.height, bar.height))
})

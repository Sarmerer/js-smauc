window.smauc = window.smauc = window.smauc || {}

window.smauc.dom = {
  getElementCenter(element) {
    if (!element) return null

    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  },

  getElementCenterRand(element, spread = 0.5) {
    if (!element) return null

    const { left, top, width, height } = element.getBoundingClientRect()

    const meanX = width / 2
    const meanY = height / 2

    const stddevX = (width / 6) * spread
    const stddevY = (height / 6) * spread

    let x = window.smauc.gaussianDistribution(meanX, stddevX)
    let y = window.smauc.gaussianDistribution(meanY, stddevY)

    x = Math.max(0, Math.min(width, x))
    y = Math.max(0, Math.min(height, y))

    return { x: x + left, y: y + top }
  },

  createClickEvent(x, y) {
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    })

    document.elementFromPoint(x, y).dispatchEvent(clickEvent)
  },

  createTouchEvent(type, x, y) {
    const touch = new Touch({
      identifier: Date.now(),
      target: document.elementFromPoint(x, y),
      clientX: x,
      clientY: y,
      radiusX: 1,
      radiusY: 1,
      force: 1,
    })

    const touchEvent = new TouchEvent(type, {
      cancelable: true,
      bubbles: true,
      touches: type === 'touchend' ? [] : [touch],
      targetTouches: type === 'touchend' ? [] : [touch],
      changedTouches: [touch],
    })

    document.elementFromPoint(x, y).dispatchEvent(touchEvent)
  },
}

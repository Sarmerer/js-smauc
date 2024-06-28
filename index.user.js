// ==UserScript==
// @name         Shit Helper
// @namespace    http://tampermonkey.net/
// @version      2024-06-25
// @description  try to take over the world!
// @author       You
// @match        https://cmonkey.vip/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cmonkey.vip
// @grant        none
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/utils/index.user.js
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/utils/dom.user.js
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/utils/rand.user.js
// @updateURL    https://raw.githubusercontent.com/Sarmerer/js-smauc/main/index.user.js
// @downloadURL  https://raw.githubusercontent.com/Sarmerer/js-smauc/main/index.user.js
// ==/UserScript==

;(function () {
  'use strict'

  const windowReloadIntervalMs = 30 * 1000
  const minGas = 4000
  const numberOfFingersRange = [2, 5]

  const delayBetweenLoops = 70
  const delayBetweenLoopsOffsetRange = [-30, 50]
  const rareExtraDelayBetweenLoopsRange = [200, 350]
  const delayBetweenMiniGameClicksRange = [350, 500]
  const delayBetweenTapsRange = [25, 35]

  const state = {
    forceStop: false,
    overrideMinGas: false,
  }

  const currentScoreSelector =
    '#app > section > div:nth-child(2) > div.home-section__wrapper > div:nth-child(1) > p'

  const energyCountSelector =
    '#app > section > div:nth-child(2) > div.home-section__wrapper > div.energy > div > div.energy__count-div > p > span:nth-child(1)'

  const shitCoinSelector =
    '#app > section > div:nth-child(2) > div.coin-wrapper > div.coin-container > div.coin-shit'

  function reloadPageSafe() {
    saveState()
    location.reload()
  }

  function localStorageSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  function localStorageGet(key) {
    return JSON.parse(localStorage.getItem(key))
  }

  function getState() {
    state.overrideMinGas = localStorageGet('_acOverrideMinGas') || false
  }

  function saveState() {
    localStorageSet('_acOverrideMinGas', state.overrideMinGas)
  }

  function gaussianRandom(mean, stddev) {
    let u = 0
    let v = 0

    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()

    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return num * stddev + mean
  }

  function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function sleepRand(min, max) {
    return sleep(getRandomInRange(min, max))
  }

  function createClickEvent(x, y) {
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    })

    document.elementFromPoint(x, y).dispatchEvent(clickEvent)
  }

  function createTouchEvent(type, x, y) {
    const touchObj = new Touch({
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
      touches: type === 'touchend' ? [] : [touchObj],
      targetTouches: type === 'touchend' ? [] : [touchObj],
      changedTouches: [touchObj],
    })

    document.elementFromPoint(x, y).dispatchEvent(touchEvent)
  }

  function getElementCoordinates(element) {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  function getElementCoordinatesRandom(element, bias = 0.5) {
    const { left, top, width, height } = element.getBoundingClientRect()

    let meanX = width / 2
    let meanY = height / 2

    let stddevX = (width / 6) * bias
    let stddevY = (height / 6) * bias

    let x = gaussianRandom(meanX, stddevX)
    let y = gaussianRandom(meanY, stddevY)

    x = Math.max(0, Math.min(width, x))
    y = Math.max(0, Math.min(height, y))

    return { x: x + left, y: y + top }
  }

  function getCurrentScore() {
    const score = document.querySelector(currentScoreSelector)
    if (!score) return 0

    return parseInt(score.textContent)
  }

  function getAvailableGas() {
    const gasMeter = document.querySelector(energyCountSelector)
    if (!gasMeter) return 0

    return parseInt(gasMeter.textContent) || 0
  }

  async function loop() {
    if (Math.random() < 0.1) {
      await sleepRand(...rareExtraDelayBetweenLoopsRange)
    }

    const miniCoins = document.querySelectorAll('div.game-coin')
    if (miniCoins.length) {
      const realCoins = []
      for (const coin of miniCoins) {
        if (coin.querySelector('p.game-coin__fake')) {
          coin.remove()
          continue
        }

        realCoins.push(coin)
      }

      for (const coin of realCoins) {
        await sleepRand(...delayBetweenMiniGameClicksRange)

        const coordinates = getElementCoordinatesRandom(coin)
        createClickEvent(coordinates.x, coordinates.y)
      }

      return
    }

    const score = getCurrentScore()
    if (score == 0) return

    const gas = getAvailableGas()
    if (gas <= 0) state.overrideMinGas = false
    if (gas >= minGas) state.overrideMinGas = true

    saveState()

    if (gas <= minGas && !state.overrideMinGas) return

    const element = document.querySelector(shitCoinSelector)
    if (!element) return

    const times = getRandomInRange(...numberOfFingersRange)
    const coordinates = getElementCoordinatesRandom(element)

    for (let i = 0; i < times; i++) {
      createTouchEvent('touchstart', coordinates.x, coordinates.y)
      await sleepRand(...delayBetweenTapsRange)

      createTouchEvent('touchend', coordinates.x, coordinates.y)
      await sleepRand(...delayBetweenTapsRange)
    }
  }

  async function startAutoClicker() {
    state.forceStop = false

    async function _loop() {
      try {
        if (state.forceStop) return

        await loop()

        setTimeout(
          _loop,
          delayBetweenLoops + getRandomInRange(...delayBetweenLoopsOffsetRange)
        )
      } catch (e) {
        console.error('Error in loop', e)
        state.forceStop = true
      }
    }

    _loop()
    console.log('mounted')
  }

  function stopAutoClicker() {
    state.forceStop = true
    saveState()
  }

  setTimeout(() => {
    getState()
    startAutoClicker()
  }, 1000)

  setTimeout(reloadPageSafe, windowReloadIntervalMs)

  window.activeWebSockets = []

  const OriginalWebSocket = window.WebSocket
  window.WebSocket = function (...args) {
    const ws = new OriginalWebSocket(...args)
    window.activeWebSockets.push(ws)

    ws.addEventListener('open', () => {})

    ws.addEventListener('close', () => {
      window.activeWebSockets = window.activeWebSockets.filter(
        (socket) => socket !== ws
      )
    })

    ws.addEventListener('message', (event) => {})

    return ws
  }

  window.WebSocket.prototype = OriginalWebSocket.prototype

  const originalSend = WebSocket.prototype.send
  WebSocket.prototype.send = function (...args) {
    const modifiedMessage = args[0]

    return originalSend.call(this, modifiedMessage)
  }
})()

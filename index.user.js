// ==UserScript==
// @name         Shit Helper
// @namespace    http://tampermonkey.net/
// @version      2024-06-25
// @description  try to take over the world!
// @author       You
// @match        https://prodfront.shitcoin.cool/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cmonkey.vip
// @grant        none
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/utils/index.user.js
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/utils/dom.user.js
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/utils/rand.user.js
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/constants.user.js
// @updateURL    https://raw.githubusercontent.com/Sarmerer/js-smauc/main/index.user.js
// @downloadURL  https://raw.githubusercontent.com/Sarmerer/js-smauc/main/index.user.js
// ==/UserScript==

;(function () {
  'use strict'

  const windowReloadIntervalMs = 30 * 1000
  const minGas = 1
  const maxGas = 19000
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

  function getCurrentScore() {
    const score = document.querySelector(
      window.smauc.constants.currentScoreSelector
    )
    if (!score) return 0

    return parseInt(score.textContent)
  }

  function getAvailableGas() {
    const gasMeter = document.querySelector(
      window.smauc.constants.energyCountSelector
    )
    if (!gasMeter) return 0

    return parseInt(gasMeter.textContent) || 0
  }

  async function loop() {
    if (Math.random() < 0.1) {
      await window.smauc.utils.sleepRange(...rareExtraDelayBetweenLoopsRange)
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
        await window.smauc.utils.sleepRange(...delayBetweenMiniGameClicksRange)

        const coordinates = window.smauc.dom.getElementCenterRand(coin)
        window.smauc.dom.createClickEvent(coordinates.x, coordinates.y)
      }

      return
    }

    const score = getCurrentScore()
    if (score == 0) return

    const gas = getAvailableGas()
    if (gas <= minGas) state.overrideMinGas = false
    if (gas >= maxGas) state.overrideMinGas = true

    saveState()

    if (gas <= maxGas && !state.overrideMinGas) return

    const element = document.querySelector(
      window.smauc.constants.shitCoinSelector
    )
    if (!element) return

    const times = Math.min(
      window.smauc.rand.range(...numberOfFingersRange),
      gas - minGas
    )
    const coordinates = window.smauc.dom.getElementCenterRand(element)

    for (let i = 0; i < times; i++) {
      window.smauc.dom.createTouchEvent(
        'touchstart',
        coordinates.x,
        coordinates.y
      )
      await window.smauc.utils.sleepRange(...delayBetweenTapsRange)

      window.smauc.dom.createTouchEvent(
        'touchend',
        coordinates.x,
        coordinates.y
      )
      await window.smauc.utils.sleepRange(...delayBetweenTapsRange)
    }
  }

  async function startAutoClicker() {
    state.forceStop = false

    async function _loop() {
      try {
        if (state.forceStop) return

        await loop()

        const ms =
          delayBetweenLoops +
          window.smauc.rand.range(...delayBetweenLoopsOffsetRange)
        setTimeout(_loop, ms)
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

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
// @require      https://raw.githubusercontent.com/Sarmerer/js-smauc/main/config.user.js
// @updateURL    https://raw.githubusercontent.com/Sarmerer/js-smauc/main/index.user.js
// @downloadURL  https://raw.githubusercontent.com/Sarmerer/js-smauc/main/index.user.js
// ==/UserScript==

;(function () {
  'use strict'

  const smauc = window.smauc

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
    const score = document.querySelector(smauc.constants.currentScoreSelector)
    if (!score) return 0

    return parseInt(score.textContent)
  }

  function getAvailableGas() {
    const gasMeter = document.querySelector(smauc.constants.energyCountSelector)
    if (!gasMeter) return 0

    return parseInt(gasMeter.textContent) || 0
  }

  async function loop() {
    if (Math.random() < 0.1) {
      await smauc.utils.sleepRange(
        ...smauc.config.rareExtraDelayBetweenLoopsRange
      )
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
        await smauc.utils.sleepRange(
          ...smauc.config.delayBetweenMiniGameClicksRange
        )

        const coordinates = smauc.dom.getElementCenterRand(coin)
        smauc.dom.createClickEvent(coordinates.x, coordinates.y)
      }

      return
    }

    const score = getCurrentScore()
    if (score == 0) return

    const minGas = smauc.config.minGas
    const maxGas = smauc.config.maxGas
    const gas = getAvailableGas()
    if (gas <= minGas) state.overrideMinGas = false
    if (gas >= maxGas) state.overrideMinGas = true

    saveState()

    if (gas <= maxGas && !state.overrideMinGas) return

    const element = document.querySelector(smauc.constants.shitCoinSelector)
    if (!element) return

    const times = Math.min(
      smauc.rand.range(...smauc.config.numberOfFingersRange),
      gas - minGas
    )
    const coordinates = smauc.dom.getElementCenterRand(element)

    for (let i = 0; i < times; i++) {
      smauc.dom.createTouchEvent('touchstart', coordinates.x, coordinates.y)
      await smauc.utils.sleepRange(...smauc.config.delayBetweenTapsRange)

      smauc.dom.createTouchEvent('touchend', coordinates.x, coordinates.y)
      await smauc.utils.sleepRange(...smauc.config.delayBetweenTapsRange)
    }
  }

  async function startAutoClicker() {
    state.forceStop = false

    async function _loop() {
      try {
        if (state.forceStop) return

        await loop()

        const ms =
          smauc.config.delayBetweenLoops +
          smauc.rand.range(...smauc.config.delayBetweenLoopsOffsetRange)
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

  setTimeout(reloadPageSafe, smauc.config.windowReloadIntervalMs)

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

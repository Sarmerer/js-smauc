;(function () {
  window.smauc = window.smauc || {}

  window.smauc.config = {
    windowReloadIntervalMs: 30 * 1000,

    minGas: 1,
    maxGas: 19000,

    numberOfFingersRange: [2, 5],

    delayBetweenLoops: 70,
    delayBetweenLoopsOffsetRange: [-30, 50],
    rareExtraDelayBetweenLoopsRange: [200, 350],
    delayBetweenMiniGameClicksRange: [350, 500],
    delayBetweenTapsRange: [25, 35],
  }
})()

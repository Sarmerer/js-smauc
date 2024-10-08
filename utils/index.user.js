;(function () {
  window.smauc = window.smauc || {}

  window.smauc.utils = {
    async sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    async sleepRange(min, max) {
      return window.smauc.utils.sleep(window.smauc.rand.range(min, max))
    },
  }
})()

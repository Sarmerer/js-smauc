;(function () {
  window.smauc = window.smauc || {}

  window.smauc.utils = {
    async sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    async sleepRange(min, max) {
      return sleep(getRandomInRange(min, max))
    },
  }
})()

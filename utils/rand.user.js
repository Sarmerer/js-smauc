;(function () {
  window.smauc = window.smauc || {}

  window.smauc.rand = {
    gaussianDistribution(mean, stddev) {
      let u = 0
      let v = 0

      while (u === 0) u = Math.random()
      while (v === 0) v = Math.random()

      let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
      return num * stddev + mean
    },

    range(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    },
  }
})()

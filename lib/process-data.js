var _ = require('lodash')

function getSpeed(list) {
  var speed = 0

  for (var i=list.length - 1, item; item = list[i]; i--) {
    if (item && item[0]) {
      speed = item[0]
      break
    }
  }

  return speed ? Math.round(speed / 1048576) : 0
}

module.exports = function (data) {
  var downloadData = _.find(data, { target: 'Fibre Download' })
    , uploadData = _.find(data, { target: 'Fibre Upload' })
    , downloadSpeed = getSpeed(downloadData.datapoints)
    , uploadSpeed = getSpeed(uploadData.datapoints)

  return { upload: uploadSpeed, download: downloadSpeed }
}

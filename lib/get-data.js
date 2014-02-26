var request = require('request')

module.exports = function (url, callback) {

  request.get(url, {}, function (error, res) {
    if (error) return callback(error)

    var data = JSON.parse(res.body)

    callback(error, data)
  })
}

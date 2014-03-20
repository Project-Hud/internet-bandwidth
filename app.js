var Widget = new require('hud-widget')
  , widget = new Widget()
  , getData = require('./lib/get-data')
  , processData = require('./lib/process-data')

var url = process.env.DATA_URL

widget.get('/', function (req, res) {
  res.render('index')
})

widget.get('/get-bandwidth', function (req, res) {
  getData(url, function (error, data) {
    if (error) console.warn(error)

    res.json(processData(data))
  })
})

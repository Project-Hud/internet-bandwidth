
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , getData = require('./lib/get-data')
  , processData = require('./lib/process-data')
  , app = express()

// all environments
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler())
}

var url = process.env.DATA_URL

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/get-bandwidth', function (req, res) {
  getData(url, function (error, data) {
    if (error) console.warn(error)

    res.json(processData(data))
  })
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})

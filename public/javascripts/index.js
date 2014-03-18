(function () {

  var downloadMax = 30
    , uploadMax = 20
    , colorDownload = '#99da48'
    , colorUpload = '#66bada'
    , $download = document.getElementsByClassName('js-download')[0]
    , $upload = document.getElementsByClassName('js-upload')[0]
    , $highest = document.getElementsByClassName('js-highest')[0]
    , MBformat = ' MB/S'
    , currentDownload = 0
    , currentUpload = 0
    , downloadEl = d3.select('.chart-gauge--download')
    , uploadEl = d3.select('.chart-gauge--upload')

  var Needle = (function() {
    function Needle(len, radius) {
      this.len = len
      this.radius = radius
    }

    Needle.prototype.drawOn = function(el, perc) {
      el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius).append('text')
      return el.append('path').attr('class', 'needle').attr('d', this.mkCmd(perc))
    }

    Needle.prototype.animateOn = function(el, perc) {
      var self = this
      return el.transition().ease('ease-in').duration(300).selectAll('.needle').tween('progress', function() {
        return function(percentOfPercent) {
          return d3.select(this).attr('d', self.mkCmd(perc * percentOfPercent))
        }
      })
    }

    Needle.prototype.mkCmd = function(perc) {
      var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY
      thetaRad = percToRad(perc / 2)
      centerX = 0
      centerY = 0
      topX = centerX - this.len * Math.cos(thetaRad)
      topY = centerY - this.len * Math.sin(thetaRad)
      leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2)
      leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2)
      rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2)
      rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2)
      return 'M ' + leftX + ' ' + leftY + ' L ' + topX + ' ' + topY + ' L ' + rightX + ' ' + rightY
    }

    return Needle
  })()


  // Initialise the gauges!
  var download = setup(downloadEl, downloadMax)
    , upload = setup(uploadEl, uploadMax)


  function percToDeg(perc) { return perc * 360 }
  function percToRad(perc) { return degToRad(percToDeg(perc)) }
  function degToRad(deg) { return deg * Math.PI / 180 }

  // Setup global functions & Needle prototype
  function setup(el, max) {

    var arc
      , arcEndRad
      , arcStartRad
      , chart
      , endPadRad
      , sectionIndx
      , startPadRad
      , svg
      , _i
      , width = el[0][0].offsetWidth
      , height = 400
      , barWidth = 20
      , chartInset = 0
      , padRad = 0.125
      , radius = Math.min(width, height) / 3
      , sectionPerc = 1 / max / 2
      , totalPercent = 0.75
      , percent = 1


    svg = el.append('svg').attr('width', width).attr('height', height).attr('xmlns', 'http://www.w3.org/2000/svg')
    chart = svg.append('g').attr('transform', 'translate(125,125)')

    for (sectionIndx = _i = 1; 1 <= max ? _i <= max : _i >= max; sectionIndx = 1 <= max ? ++_i : --_i) {
      arcStartRad = percToRad(totalPercent)
      arcEndRad = arcStartRad + percToRad(sectionPerc)
      totalPercent += sectionPerc
      startPadRad = sectionIndx === 0 ? 0 : padRad / 2
      endPadRad = sectionIndx === max ? 0 : padRad / 2
      arc = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth).startAngle(arcStartRad + startPadRad).endAngle(arcEndRad - endPadRad)
      chart.append('path').attr('class', 'arc chart-color' + sectionIndx).attr('d', arc)
    }

    var needle = new Needle(90, 4)
    needle.drawOn(chart, 0)
    needle.animateOn(chart, percent)

    return [needle, chart, percent]
  }

  var request = new XMLHttpRequest()
  request.onreadystatechange = function () {
    if (request.readyState !== 4 || request.status !== 200) return

    var res
      , fill
    try {
      res = JSON.parse(request.response)
    } catch (err){
      console.log(err)
    }

    // Testing data
    // res.download = Math.floor(Math.random() * downloadMax) + 1
    // res.upload = Math.floor(Math.random() * uploadMax) + 1

    if(res.download === currentDownload) return
    currentDownload = res.download
    var downloadPercent = (1 / downloadMax) * res.download
    if (downloadPercent > 1) downloadPercent = 1
    download[0].animateOn(download[1], downloadPercent)
    for (var d = 0; d < downloadMax; d++) {
      fill = '#ffffff'
      if (d < res.download) fill = colorDownload
      document.querySelector('.chart-gauge--download .chart-color'+(d+1)).style.fill = fill
    }
    $download.innerHTML = res.download + MBformat

    if(res.upload === currentUpload) return
    currentUpload = res.upload
    var uploadPercent = (1 / uploadMax) * res.upload
    if (uploadPercent > 1) uploadPercent = 1
    upload[0].animateOn(upload[1], uploadPercent)
    for (var u = 0; u < uploadMax; u++) {
      fill = '#ffffff'
      if (u < res.upload) fill = colorUpload
      document.querySelector('.chart-gauge--upload .chart-color'+(u+1)).style.fill = fill
    }
    $upload.innerHTML = res.upload + MBformat

    if (parseInt($highest.getAttribute('data-mb'), 10) < res.download) {
      $highest.innerHTML = res.download + MBformat
      $highest.setAttribute('data-mb', res.download)
    }
  }

  request.open('GET', '/get-bandwidth', true)
  request.send()

  setInterval(function () {
    request.open('GET', '/get-bandwidth', true)
    request.send()
  }, 30000)


})()

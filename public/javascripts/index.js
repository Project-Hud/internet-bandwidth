(function () {


  var maxMB = 30
    , $download = document.getElementsByClassName('js-download')[0]
    , $upload = document.getElementsByClassName('js-upload')[0]
    , $highest = document.getElementsByClassName('js-highest')[0]
    , MBformat = ' MB/S'
    , currentDownload = 0
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
  var download = setup(downloadEl)
    , upload = setup(uploadEl)



  function percToDeg(perc) { return perc * 360 }
  function percToRad(perc) { return degToRad(percToDeg(perc)) }
  function degToRad(deg) { return deg * Math.PI / 180 }

  // Setup global functions & Needle prototype
  function setup(el) {

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
      , chartInset = 10
      , padRad = 0.125
      , radius = Math.min(width, height) / 3
      , sectionPerc = 1 / maxMB / 2
      , totalPercent = 0.75
      , percent = 1


    svg = el.append('svg').attr('width', width).attr('height', height)
    chart = svg.append('g').attr('transform', 'translate(125,125)')

    for (sectionIndx = _i = 1; 1 <= maxMB ? _i <= maxMB : _i >= maxMB; sectionIndx = 1 <= maxMB ? ++_i : --_i) {
      arcStartRad = percToRad(totalPercent)
      arcEndRad = arcStartRad + percToRad(sectionPerc)
      totalPercent += sectionPerc
      startPadRad = sectionIndx === 0 ? 0 : padRad / 2
      endPadRad = sectionIndx === maxMB ? 0 : padRad / 2
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
    try {
      res = JSON.parse(request.response)
    } catch (err){
      console.log(err)
    }

    // This line creates pseudo integers
    // It should NOT be used in production
    // res.download = Math.floor(Math.random() * maxMB) + 1

    if(res.download === currentDownload) return

    currentDownload = res.download

    var percent = (1 / maxMB) * res.download
    if (percent > 1) percent = 1

    download[0].animateOn(download[1], percent)

    for (var i = 0; i < maxMB; i++) {
      var fill = '#ffffff'
      if (i < res.download) fill = '#8ccf3c'
      document.getElementsByClassName('chart-color'+(i+1))[0].style.fill = fill
    }

    $download.innerHTML = res.download + MBformat
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

(function () {

  var request = new XMLHttpRequest()
  request.onreadystatechange = function () {
    if (request.readyState !== 4 || request.status !== 200) return

    var res = JSON.parse(request.response)

    document.getElementsByClassName('js-download')[0].innerHTML = res.download + ' MB/S'
    document.getElementsByClassName('js-upload')[0].innerHTML = res.upload + ' MB/S'
  }

  request.open('GET', '/get-bandwidth', true)
  request.send()

  setInterval(function () {
    request.open('GET', '/get-bandwidth', true)
    request.send()
  }, 30000)

})()

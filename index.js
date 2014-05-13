var http = require('http')
var Config = require('./config.json')
var fs = require('fs')
var url = require('url')
var path = require('path')
var util = require('./lib/util')
var ejs = require('ejs')

var server = http.createServer()
server.listen(Config.server.port,Config.server.host)

server.on('request',function(req,res) {

  var request = url.parse(req.headers.host + req.url, true)
  if(request.path == '/favicon.ico') return
  console.log(request)

  var render = function(filePath,statusCode) {
    console.log("Filepath is " + filePath)
    if (!statusCode) statusCode = 200
    // if it's not a template file, just deliver it raw
    if (util.getExtension(filePath) != Config.extension) {
      console.log("Extension was " + util.getExtension(filePath) + " so no render")
      fs.readFile(filePath,function(er,file) {
        if (er) {
          send(util.get500(er),500)
        } else {
          send(file,statusCode)
        }
      })
    } else {
      fs.readFile(filePath,{encoding:'utf-8'},function(er,file) {
        if (er) {
          send(util.get500(),500)
        } else {
          console.log("Renderrrred")
          var output
          try {
            send(ejs.render(file, {filename:filePath}),statusCode)
          } catch (e) {
            send(util.get500(e),500)
          }
        }
      })
    }
  }

  var send = function(data,statusCode) {
    res.statusCode = statusCode
    res.write(data)
    res.end();
  }

  var redirect = function(path) {
    res.statusCode = 301
    res.setHeader("Location",path)
    res.end()
  }

  // try explicit path
  var filePath = Config.docRoot + request.pathname
  // if it hasn't got an extension and doesn't look like a directory, use the default
  if (
    !util.hasExtension(request.pathname) &&
    !util.hasTrailingSlash(request.pathname)
    ) filePath += '.' + Config.extension
  fs.stat(filePath,function(er,stats) {
    if (er || !stats.isFile()) {
      // try index file
      filePath = Config.docRoot + request.pathname + Config.index + '.' + Config.extension
      fs.stat(filePath,function(er,stats) {
        if (er || !stats.isFile()) {
          // try adding a trailing slash
          if (util.hasTrailingSlash(request.pathname)) {
            send(util.get404(),404)
          } else {
            redirect(request.pathname + "/" + request.search)
          }
        } else {
          render(filePath)
        }
      })
    } else {
      render(filePath)
    }
  })

})
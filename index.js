var http = require('http')
var fs = require('fs')
var url = require('url')
var path = require('path')
var util = require('./lib/util')
var ejs = require('ejs')
var dashdash = require('dashdash')

var options = [
  {
    names: ['config','c','conf'],
    type: 'string'
  },
  {
    names: ['port','p'],
    type: 'string',
    default: '5000'
  },
  {
    names: ['host','h'],
    type: 'string',
    default: '0.0.0.0'
  },
  {
    names: ['docroot','d'],
    type: 'string',
    default: '.'
  }
]
var opts = dashdash.parse({options: options});
console.log(opts)

// pull in defaults and user-supplied config
var Config = require('./config.json')
if(opts['config']) {
  for (var p in opts.config) {
    Config[p] = opts.config[p]
  }
}
Config.docRoot = path.normalize(opts.docroot)

var server = http.createServer()
server.listen(opts.port,opts.host)

server.on('request',function(req,res) {

  var request = url.parse(req.url, true)
  if(request.path == '/favicon.ico') return
  console.log(request)

  var render = function(filePath,statusCode) {
    console.log("Rendering file " + filePath)
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
          var output
          try {
            send(ejs.render(
              file,
              {
                filename:filePath,
                _GET:request.query
              }
            ),statusCode)
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
  var simplePath = util.normalizePath(request.pathname)
  var filePath = path.normalize(Config.docRoot + simplePath)
  // if it hasn't got an extension and doesn't look like a directory, use the default
  if (
    !util.hasExtension(simplePath) &&
    !util.hasTrailingSlash(simplePath)
    ) filePath += '.' + Config.extension
  fs.stat(filePath,function(er,stats) {
    if (er || !stats.isFile()) {
      // try index file
      filePath = path.normalize(Config.docRoot + simplePath + Config.index + '.' + Config.extension)
      fs.stat(filePath,function(er,stats) {
        if (er || !stats.isFile()) {
          // try adding a trailing slash
          if (util.hasTrailingSlash(simplePath)) {
            send(util.get404(),404)
          } else {
            redirect(simplePath + "/" + request.search)
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
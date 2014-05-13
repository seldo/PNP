var path = require('path')

exports.normalizePath = function(rawPath,docRoot) {
  // TODO: prevent escaping the docroot
  return path.normalize(rawPath)
}

exports.hasExtension = function(path) {
  if (path.indexOf('.') > 0) {
    return true
  }
  return false
}

exports.getExtension = function(path) {
  var pieces = path.split('.')
  return pieces.pop()
}

exports.hasTrailingSlash = function(path) {
  if (path.charAt(path.length-1) == "/") {
    return true
  } else {
    return false
  }
}

exports.get404 = function() {
  return "404: you fucked up"
}

exports.get500 = function(msg) {
  if(!msg) msg = "we fucked up"
  return "500: " + msg
}
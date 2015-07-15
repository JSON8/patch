/* eslint-disable no-redeclare */ // FIXME ? ES6 let/const would be nice here

'use strict'

var serialize = require('json8-pointer').serialize
var type = require('json8').type
var isPrimitive = require('json8').isPrimitive
var equal = require('json8').equal

var diff = function(a, b, pre) {
  var patches = []
  var prefix = pre || []

  var at = type(a)
  var bt = type(b)

  if (bt !== at) {
    if (at === undefined)
      patches.push({"op": "add", "path": serialize(prefix), "value": b})
    else
      patches.push({"op": "replace", "path": serialize(prefix), "value": b})
    return patches
  }
  else if (isPrimitive(b)) {
    if (a !== b)
      patches.push({"op": "replace", "path": serialize(prefix), "value": b})
    return patches
  }

  if (bt === 'object') {
    for (var i in b) {
      var pref = prefix.concat([i])
      patches = patches.concat(diff(a[i], b[i], pref))
    }
    for (var i in a) {
      if (b[i] !== undefined)
        continue
      var pref = prefix.concat([i])
      patches.push({"op": "remove", "path": serialize(pref)})
    }
  }
  else if (bt === 'array') {
    var ai = 0
    for (var i = 0, l = b.length; i < l; i++) {
      if (equal(b[i], a[ai])) {
        ai++
        continue
      }

      console.log(i, b[i])
      // checks next item on B is same as current on A
      if (i < l && equal(b[i + 1], a[ai])) {
        console.log('YES',  b[i])
        var pref = prefix.concat([i.toString()])
        patches.push({"op": "add", "path": serialize(pref), "value": b[i]})
        ai++
        // i++
        continue
      }

      // checks current item on B is same as previous on A
      if (i < l && equal(b[i + 1], a[ai])) {
        console.log(b)
        var pref = prefix.concat([i.toString()])
        patches.push({"op": "add", "path": serialize(pref), "value": b[i]})
        // i++
        continue
      }

      // checks current item on B is same as next on A
      if (equal(b[i], a[i + 1])) {
        var pref = prefix.concat([i.toString()])
        patches.push({"op": "remove", "path": serialize(pref)})
        // i++ // FIXME?
        continue
      }

      // last item of both arrays
      if (l > 1 && i === l - 1 && i - 1 === a.length - 1) {
        var pref = prefix.concat(['-'])
        patches.push({"op": "add", "path": serialize(pref), "value": b[i]})
        continue
      }

      var pref = prefix.concat([i.toString()])
      patches = patches.concat(diff(a[i], b[i], pref))

      ai++
    }
  }

  return patches
}

module.exports = diff

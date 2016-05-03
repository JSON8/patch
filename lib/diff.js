'use strict'

var encode = require('json8-pointer').encode
var equal = require('json8/lib/equal')
var type = require('json8/lib/type')
var ARRAY = 'array'
var OBJECT = 'object'

module.exports = function diff(a, b, pre) {
  var patches = []
  var prefix = pre || []

  var at = type(a)
  var bt = type(b)

  if (bt !== at) {
    if (at === undefined)
      patches.push({"op": "add", "path": encode(prefix), "value": b})
    else
      patches.push({"op": "replace", "path": encode(prefix), "value": b})
    return patches
  }
  else if (bt !== ARRAY && bt !== OBJECT) {
    if (!equal(a, b))
      patches.push({"op": "replace", "path": encode(prefix), "value": b})
    return patches
  }

  if (a === b)
    return patches

  // both are arrays
  if (Array.isArray(b)) {
    // FIXME let's be smarter about array diffing
    if (a.length === 0 && b.length === 0)
      return patches
    if (equal(a, b))
      return patches
    patches.push({"op": "replace", "path": encode(prefix), "value": b})
  }
  // both are objects
  else if (bt === OBJECT) {
    var i, l, keys, k
    keys = Object.keys(b)
    for (i = 0, l = keys.length; i < l; i++) {
      k = keys[i]
      patches = patches.concat(diff(a[k], b[k], prefix.concat([k])))
    }

    keys = Object.keys(a)
    for (i = 0, l = keys.length; i < l; i++) {
      k = keys[i]
      if (b[k] !== undefined)
        continue
      patches.push({"op": "remove", "path": encode(prefix.concat([k]))})
    }
  }

  return patches
}

var index = require('json8-pointer').index
var equal = require('json8/lib/equal')

function getValuePath (obj, value) {
  for (var i in obj) {
    if (equal(obj[i], value)) return i
  }
  return undefined
}

// function diffdiff (A, B, pre) {
//   var patches = []
//   var prefix = pre || []
//   var idxA = index(A)
//   var idxB = index(B)

//   Object.keys(B).forEach(function (k) {
//     var v = B[k]
//     if (A[k] !== undefined)
//       return

//     var path = getValuePath(idxA, v)
//     if (!path) {
//       patches.push({op: })
//     }
//     if (path && !idxB[path]) { // FIXME ''
//       patches.push({"op": "move", "from": path, "path": encode(prefix.concat([k]))})
//     }
//   })

//   return patches
// }

function diffdiff (A, B) {
  var patches = []
  // var prefix = pre || []
  var indexA = index(A)
  var indexB = index(B)

  for (var kB in indexB) {
    if (kB === '') continue
    var vB = indexB[kB]
    var vA = indexA[kB]
    if (!equal(vA, vB)) {
      var patch
      for (var kA in indexA) {
        if (equal(indexA[kA], vB)) {
          if (indexB[kA]) {
            patch = {"op": "copy", "from": kA, "path": kB}
          } else {
            patch = {"op": "move", "from": kA, "path": kB}
            console.log(indexA[kA])
            delete indexA[kA]
            // indexA[kA] = undefined
            console.log(indexA[kA])
          }
          break
        }
      }
      if (!patch) {
        patch ={"op": "add", "path": kB, "value": vB}
      }
      patches.push(patch)
    }


    // if (index)
    // if (equal(indexA[k], v)) {

    // } else
  }

  // Object.keys(B).forEach(function (k) {
  //   var v = B[k]
  //   if (A[k] !== undefined)
  //     return

  //   var path = getValuePath(idxA, v)
  //   if (!path) {
  //     patches.push({op: })
  //   }
  //   if (path && !idxB[path]) { // FIXME ''
  //     patches.push({"op": "move", "from": path, "path": encode(prefix.concat([k]))})
  //   }
  // })

  return patches
}

var obj1 = {foo: "much"}
// var obj2 = {foo: "muchsdf"}
// var obj2 = {truc: "much"}
var obj2 = {truc: "much", machin: "much"}
// var obj2 = {truc: "much", machin: "much", foo: "much"}

console.log(obj1)
console.log(obj2)
console.log(diffdiff(obj1, obj2))

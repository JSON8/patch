(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.JSON8Patch = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var apply = require('./lib/apply')

module.exports.diff = require('./lib/diff')
module.exports.valid = require('./lib/valid')

// Patching
module.exports.patch = apply
module.exports.apply = apply

// Reverting
module.exports.revert = require('./lib/revert')
module.exports.buildPatchFromRevert = require('./lib/buildPatchFromRevert')

// Operations
module.exports.add = require('./lib/add')
module.exports.copy = require('./lib/copy')
module.exports.move = require('./lib/move')
module.exports.remove = require('./lib/remove')
module.exports.replace = require('./lib/replace')
module.exports.test = require('./lib/test')

// Extra operations
module.exports.get = require('./lib/get')
module.exports.has = require('./lib/has')

// Packing
module.exports.pack = require('./lib/pack')
module.exports.unpack = require('./lib/unpack')

// Utilities
module.exports.concat = require('./lib/concat')

},{"./lib/add":2,"./lib/apply":3,"./lib/buildPatchFromRevert":4,"./lib/concat":5,"./lib/copy":6,"./lib/diff":7,"./lib/get":8,"./lib/has":9,"./lib/move":10,"./lib/pack":11,"./lib/remove":12,"./lib/replace":13,"./lib/revert":14,"./lib/test":15,"./lib/unpack":16,"./lib/valid":17}],2:[function(require,module,exports){
'use strict'

var ooPointer = require('json8-pointer')
var parse = ooPointer.parse
var walk = ooPointer.walk

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Add the value to the specified JSON Pointer location
 * http://tools.ietf.org/html/rfc6902#section-4.1
 *
 * @param  {Any}  doc    - JSON document to set the value to
 * @param  {Path} path   - JSON Pointer string or tokens path
 * @param  {Any}  value  - value to add
 * @return {OperationResult}
 */
module.exports = function add(doc, path, value) {
  var tokens = parse(path)

  // replaces the document
  if (tokens.length === 0)
    return {doc: value, previous: doc}

  var r = walk(doc, tokens)
  var token = r[0]
  var parent = r[1]

  var previous
  var idx

  if (Array.isArray(parent)) {
    if (token === '-') {
      parent.push(value)
      idx = parent.length - 1
    }
    else
      parent.splice(token, 0, value)
  }
  else {
    previous = parent[token]
    parent[token] = value
  }

  return {doc: doc, previous: previous, idx: idx}
}

},{"json8-pointer":18}],3:[function(require,module,exports){
'use strict'

var parse = require('json8-pointer').parse
var buildPatchFromRevert = require('./buildPatchFromRevert')

var operations = Object.create(null)
operations.add = require('./add')
operations.copy = require('./copy')
operations.move = require('./move')
operations.remove = require('./remove')
operations.replace = require('./replace')
operations.test = require('./test')

/**
 * @typedef PatchResult
 * @type Object
 * @property {Any}   doc     - The patched document
 * @property {Array} revert  - An array to be used with revert or buildPatchFromRevert methods
 */

/**
 * Apply a single JSON Patch operation object to a JSON document
 * @param  {Any}    doc    - JSON document to apply the patch to
 * @param  {Object} patch  - JSON Patch operation object
 * @return {Any}
 */
function run(doc, patch) {
  if (typeof patch.path === 'string')
    var pathTokens = parse(patch.path)
  if (typeof patch.from === 'string')
    var fromTokens = parse(patch.from)

  switch (patch.op) {
    case 'add':
    case 'replace':
    case 'test':
      if (patch.value === undefined)
        throw new Error('Missing value parameter')
      return operations[patch.op](doc, pathTokens, patch.value)

    case 'move':
    case 'copy':
      return operations[patch.op](doc, fromTokens, pathTokens)

    case 'remove':
      return operations[patch.op](doc, pathTokens)
  }

  throw new Error(patch.op + ' isn\'t a valid operation')
}

/**
 * Apply a JSON Patch to a JSON document
 * @param  {Any}          doc                 - JSON document to apply the patch to
 * @param  {Array}        patch               - JSON Patch array
 * @param  {Object}       options             - options
 * @param  {Boolean}      options.reversible  - return an array to revert
 * @return {PatchResult}
 */
function apply(doc, patch, options) {
  if (!Array.isArray(patch))
    throw new Error('Invalid argument, patch must be an array')

  var done = []

  for (var i = 0, len = patch.length; i < len; i++) {
    var p = patch[i]
    var r

    try {
      r = run(doc, p)
    }
    catch (err) { // restore document
      // does not use ./revert.js because it is a circular dependency
      var revertPatch = buildPatchFromRevert(done)
      apply(doc, revertPatch)
      throw err
    }

    doc = r.doc
    done.push([p, r.previous, r.idx])
  }

  var result = {doc: doc}

  if (options && typeof options === 'object' && options.reversible === true)
    result.revert = done

  return result
}

module.exports = apply

},{"./add":2,"./buildPatchFromRevert":4,"./copy":6,"./move":10,"./remove":12,"./replace":13,"./test":15,"json8-pointer":18}],4:[function(require,module,exports){
'use strict'

var JSON8Pointer = require('json8-pointer')
var serialize = JSON8Pointer.serialize
var parse = JSON8Pointer.parse

/**
 * Return the reverse operation to a JSON Patch operation
 * @param  {Object}       patch     - JSON Patch operation object
 * @param  {Any}          previous  - previous value for add and replace operations
 * @param  {Number}       idx       - index of the item for array
 * @return {Object}
 */
function reverse(patch, previous, idx) {
  var op = patch.op
  var path = patch.path

  if (op === 'copy' || (op === 'add' && previous === undefined)) {
    if (idx === undefined)
      return {"op": "remove", "path": path}

    // for item pushed to array with -
    var tokens = parse(path)
    tokens[tokens.length - 1] = idx.toString()
    return {"op": "remove", "path": serialize(tokens)}
  }
  if (op === 'replace')
    return {"op": "replace", "path": path, "value": previous}
  if (op === 'move')
    return {"op": "move", "path": patch.from, "from": path}
  if (op === 'add' || op === 'remove')
    return {"op": "add", "path": path, "value": previous}
  if (op === 'test')
    return {"op": "test", "path": path, "value": patch.value}
}

/**
 * Builds and returns a valid JSON Patch from a revert value
 * @param  {Array} revert   - revert value from the apply or patch method with {reversible: true}
 * @return {Array} patches  - JSON Patch
 */
module.exports = function buildPatchFromRevert(revert) {
  var patch = []

  for (var i = 0, len = revert.length; i < len; i++) {
    var item = revert[i]
    patch.unshift(reverse(item[0], item[1], item[2]))
  }

  return patch
}

},{"json8-pointer":18}],5:[function(require,module,exports){
'use strict'

/**
 * concat (or merge) multiple patches into one
 * @returns {Array}
 */
module.exports = function concat(/* patch0, patch1, ... */) {
  return [].concat.apply([], arguments)
}

},{}],6:[function(require,module,exports){
'use strict'

var get = require('./get')
var add = require('./add')

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Copy the value at the specified JSON Pointer location to an other location
 * http://tools.ietf.org/html/rfc6902#section-4.5
 *
 * @param  {Object|Array} doc   - JSON document to copy the value from and to
 * @param  {String|Array} path  - JSON Pointer string or tokens path
 * @param  {String}       dest  - JSON Pointer string destination of the value
 * @return {OperationResult}
 */
module.exports = function copy(doc, path, dest) {
  var obj = get(doc, path)
  return add(doc, dest, obj)
}

},{"./add":2,"./get":8}],7:[function(require,module,exports){
'use strict'

var serialize = require('json8-pointer').serialize
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
      patches.push({"op": "add", "path": serialize(prefix), "value": b})
    else
      patches.push({"op": "replace", "path": serialize(prefix), "value": b})
    return patches
  }
  else if (bt !== ARRAY && bt !== OBJECT) {
    if (!equal(a, b))
      patches.push({"op": "replace", "path": serialize(prefix), "value": b})
    return patches
  }

  if (a === b)
    return patches

  if (Array.isArray(b)) {
    // FIXME let's be smarter about array diffing
    if (a.length === 0 && b.length === 0)
      return patches
    if (equal(a, b))
      return patches
    patches.push({"op": "replace", "path": serialize(prefix), "value": b})
  }
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
      patches.push({"op": "remove", "path": serialize(prefix.concat([k]))})
    }
  }

  return patches
}

},{"json8-pointer":18,"json8/lib/equal":24,"json8/lib/type":25}],8:[function(require,module,exports){
'use strict'

var JSON8Pointer = require('json8-pointer')
var walk = JSON8Pointer.walk
var parse = JSON8Pointer.parse

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Get the value at the JSON Pointer location
 *
 * @param  {Object|Array} doc   - JSON document
 * @param  {String|Array} path  - JSON Pointer string or tokens path
 * @return {Any}                - value at the JSON Pointer location
 */
module.exports = function get(doc, path) {
  var tokens = parse(path)

  // returns the document
  if (tokens.length === 0)
    return doc

  var r = walk(doc, tokens)
  var token = r[0]
  var parent = r[1]

  return parent[token]
}

},{"json8-pointer":18}],9:[function(require,module,exports){
'use strict'

var JSON8Pointer = require('json8-pointer')
var walk = JSON8Pointer.walk
var parse = JSON8Pointer.parse

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Check if the document as the property at the specified JSON Pointer location
 *
 * @param  {Object|Array} doc   - JSON document
 * @param  {String|Array} path  - JSON Pointer string or tokens path
 * @return {Bool}
 */
module.exports = function has(doc, path) {
  var tokens = parse(path)

  // returns the document
  if (tokens.length === 0)
    return true

  var r = walk(doc, tokens)
  var token = r[0]
  var parent = r[1]

  return token in parent
}

},{"json8-pointer":18}],10:[function(require,module,exports){
'use strict'

var remove = require('./remove')
var add = require('./add')

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Move the value at the specified JSON Pointer location to an other location
 * http://tools.ietf.org/html/rfc6902#section-4.4
 *
 * @param  {Object|Array} doc   - JSON document to move the value from and to
 * @param  {String|Array} path  - JSON Pointer string or tokens path
 * @param  {String}       dest  - JSON Pointer string destination of the value
 * @return {OperationResult}
 */
module.exports = function move(doc, path, dest) {
  var r = remove(doc, path)
  return add(doc, dest, r.previous)
}

},{"./add":2,"./remove":12}],11:[function(require,module,exports){
'use strict'

var ops = Object.create(null)
ops.add = 0
ops.remove = 1
ops.replace = 2
ops.move = 3
ops.copy = 4
ops.test = 5

module.exports = function pack(patch) {
  var packed = []

  for (var i = 0, l = patch.length; i < l; i++) {
    var p = patch[i]
    var a = ops[p.op]
    var op = [a, p.path]
    // add, replace, test
    if (a === 0 || a === 2 || a === 5)
      op.push(p.value)
    // move copy
    else if (a !== 1) {
      op.push(p.from)
    }

    packed.push(op)
  }

  return packed
}

},{}],12:[function(require,module,exports){
'use strict'

var ooPointer = require('json8-pointer')
var parse = ooPointer.parse
var walk = ooPointer.walk

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Remove the value at the JSON Pointer location
 * http://tools.ietf.org/html/rfc6902#section-4.2
 *
 * @param  {Any}          doc   - JSON document to search into
 * @param  {String|Array} path  - JSON Pointer string or tokens patch
 * @return {OperationResult}
 */
module.exports = function remove(doc, path) {
  var tokens = parse(path)

  // removes the document
  if (tokens.length === 0)
    return {doc: undefined, previous: doc}

  var r = walk(doc, tokens)
  var token = r[0]
  var parent = r[1]

  var previous = parent[token]
  if (previous === undefined)
    throw new Error('Location not found')

  if (Array.isArray(parent))
    parent.splice(token, 1)
  else
    delete parent[token]

  return {doc: doc, previous: previous}
}

},{"json8-pointer":18}],13:[function(require,module,exports){
'use strict'

var ooPointer = require('json8-pointer')
var parse = ooPointer.parse
var walk = ooPointer.walk

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Replace the value at the JSON Pointer location
 * http://tools.ietf.org/html/rfc6902#section-4.3
 *
 * @param  {Any}          doc    - JSON document
 * @param  {String|Array} path   - JSON Pointer string or tokens patch
 * @param  {String}       value  - JSON object to replace with
 * @return {OperationResult}
 */
module.exports = function replace(doc, path, value) {
  var tokens = parse(path)

  // replaces the document
  if (tokens.length === 0)
    return {doc: value, previous: doc}

  var r = walk(doc, tokens)
  var token = r[0]
  var parent = r[1]

  var previous = parent[token]
  if (previous === undefined)
    throw new Error('Location not found')

  parent[token] = value

  return {doc: doc, previous: previous}
}

},{"json8-pointer":18}],14:[function(require,module,exports){
'use strict'

var buildPatchFromRevert = require('./buildPatchFromRevert')
var apply = require('./apply')

/**
 * @typedef RevertResult
 * @type Object
 * @property {Any}   doc     - The patched document
 */

/**
 * Revert apply a JSON Patch
 * @param  {Any}          doc                 - JSON document to which the patch was applied to
 * @param  {Array}        items               - value of revert property from apply method result
 * @return {PatchResult}
 */
module.exports = function revert(doc, items) {
  var patch = buildPatchFromRevert(items)
  return apply(doc, patch)
}

},{"./apply":3,"./buildPatchFromRevert":4}],15:[function(require,module,exports){
'use strict'

var get = require('./get')
var equal = require('json8/lib/equal')

/**
 * @typedef OperationResult
 * @type Object
 * @property {Any}   doc       - The patched document
 * @property {Array} previous  - The previous/replaced value if any
 */

/**
 * Test that the value at the specified JSON Pointer location is equal to the specified value
 * http://tools.ietf.org/html/rfc6902#section-4.6
 *
 * @param  {Object|Array} doc    - JSON document to copy the value from and to
 * @param  {String|Array} path   - JSON Pointer string or tokens path
 * @param  {String}       value  - the value to compare with
 * @return {OperationResult}
 */
module.exports = function test(doc, path, value) {
  var obj = get(doc, path)
  if (!equal(obj, value))
    throw new Error('Test failed')

  return {doc: doc}
}

},{"./get":8,"json8/lib/equal":24}],16:[function(require,module,exports){
'use strict'

var ops = Object.create(null)
ops[0] = 'add'
ops[1] = 'remove'
ops[2] = 'replace'
ops[3] = 'move'
ops[4] = 'copy'
ops[5] = 'test'

module.exports = function unpack(packed) {
  var unpacked = []

  for (var i = 0, l = packed.length; i < l; i++) {
    var p = packed[i]
    var ap = p[0]
    var a = ops[ap]
    var op = {op: a, path: p[1]}

    // add, replace, test
    if (ap === 0 || ap === 2 || ap === 5)
      op.value = p[2]
    // move, copy
    else if (ap !== 1)
      op.from = p[2]

    unpacked.push(op)
  }

  return unpacked
}

},{}],17:[function(require,module,exports){
'use strict'

module.exports = function valid(patch) {
  if (!Array.isArray(patch))
    return false

  for (var i = 0, l = patch.length; i < l; i++) {
    var op = patch[i]

    if (typeof op !== 'object' || op === null || Array.isArray(op))
      return false

    if (typeof op.path !== 'string')
      return false

    var operation = op.op
    if (typeof op.op !== 'string')
      return false

    switch (operation) {
      case 'add':
      case 'replace':
      case 'test':
        if (op.value === undefined)
          return false
        break
      case 'move':
      case 'copy':
        if (typeof op.from !== 'string')
          return false
        break
      case 'remove':
        break
      default:
        return false
    }
  }

  return true
}

},{}],18:[function(require,module,exports){
'use strict'

var encode = require('./lib/encode')
var decode = require('./lib/decode')

module.exports.encode = encode
module.exports.serialize = encode
module.exports.decode = decode
module.exports.parse = decode
module.exports.validArrayToken = require('./lib/validArrayToken')
module.exports.walk = require('./lib/walk')
module.exports.find = require('./lib/find')

},{"./lib/decode":19,"./lib/encode":20,"./lib/find":21,"./lib/validArrayToken":22,"./lib/walk":23}],19:[function(require,module,exports){
'use strict'

/**
 * decode a JSON Pointer string
 *
 * @param  {String} pointer    - JSON Pointer string to decode
 * @param  {String} separator  - separator to use, defaults to /
 * @return {Array}             - array of tokens
 */
module.exports = function decode(pointer, separator) {
  if (Array.isArray(pointer))
    return pointer

  var sep = typeof separator === 'string' && separator.length > 0 ? separator : '/'

  if (pointer.length === 0)
    return []

  if (pointer.charAt(0) !== sep)
    throw new Error('Invalid pointer: ' + pointer)

  var tokens = ['']
  var c = 0

  for (var i = 1, len = pointer.length; i < len; i++) {
    var l = pointer.charAt(i)
    if (l === sep) {
      tokens.push('')
      c++
    }
    else if (l === '~') {
      if (pointer.charAt(i + 1) === '1') {
        tokens[c] += sep
        i++
      }
      else if (pointer.charAt(i + 1) === '0') {
        tokens[c] += '~'
        i++
      }
      else {
        tokens[c] += l
      }
    }
    else {
      tokens[c] += l
    }
  }

  return tokens
}

},{}],20:[function(require,module,exports){
'use strict'

/**
 * Encode a JSON tokens list
 *
 * @param  {Array}  tokens     - array of tokens
 * @param  {String} separator  - separator to use, defaults to /
 * @return {String}            - JSON Pointer string
 */
module.exports = function encode(tokens, separator) {
  var pointer = ''
  var sep = typeof separator === 'string' && separator.length > 0 ? separator : '/'

  for (var i = 0, len = tokens.length; i < len; i++) {
    var token = tokens[i]
    pointer += sep
    for (var y = 0, length = token.length; y < length; y++) {
      var l = token.charAt(y)
      if (l === '~')
        pointer += '~0'
      else if (l === sep)
        pointer += '~1'
      else
        pointer += l
    }
  }

  return pointer
}

},{}],21:[function(require,module,exports){
'use strict'

var decode = require('./decode')
var walk = require('./walk')

/**
 * Get the value at the JSON Pointer location
 *
 * @param  {Object|Array} doc      - JSON document
 * @param  {String|Array} pointer  - JSON Pointer string or tokens array
 * @return {Any}                   - value at the JSON Pointer location - undefined otherwise
 */
module.exports = function find(doc, pointer) {
  var tokens = Array.isArray(pointer) ? pointer : decode(pointer)

  // returns the document
  if (tokens.length === 0)
    return doc

  var r

  try {
    r = walk(doc, tokens)
  }
  catch (e) {
    return undefined
  }

  var token = r[0]
  var parent = r[1]
  return parent[token]
}

},{"./decode":19,"./walk":23}],22:[function(require,module,exports){
'use strict'

/**
 * Check if the token is a valid array token and throws an error
 *
 * @param  {String} token        - token
 * @param  {Number} arrayLength  - array length
 */
module.exports = function validArrayToken(token, arrayLength) {
  if (token === '-')
    return

  var error = new Error('Invalid pointer')
  var length = token.length

  if (length > 1 && token[0] === '0')
    throw error

  for (var i = 0; i < length; i++) {
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(token[i]) === -1)
      throw error
  }

  var idx = +token

  if (idx < 0)
    throw error

  if (idx > arrayLength)
    throw error
}

},{}],23:[function(require,module,exports){
'use strict'

var validArrayToken = require('./validArrayToken')
var OBJECT = 'object'

/**
 * Walk a JSON document with a tokens array
 *
 * @param {Object|Array} doc     - JSON document
 * @param {Array}        tokens  - array of tokens
 * @return {Array}               - [token, target]
 */
module.exports = function walk(doc, tokens) {
  var length = tokens.length

  var i = 0
  var target = doc
  var token

  while (i < length - 1) {
    token = tokens[i++]

    if (Array.isArray(target))
      validArrayToken(token, target.length)
    else if (typeof target !== OBJECT || target === null)
      throw new Error('Cannot be walked')

    target = target[token]
  }

  token = tokens[i]

  if (Array.isArray(target))
    validArrayToken(token, target.length)
  else if (typeof target !== OBJECT || target === null)
    throw new Error('Invalid target')

  return [token, target]
}

},{"./validArrayToken":22}],24:[function(require,module,exports){
(function (global){
'use strict'

var types = require('./types')
var OBJECT = types.OBJECT
var ARRAY = types.ARRAY
var STRING = types.STRING
var BOOLEAN = types.BOOLEAN
var NUMBER = types.NUMBER
var NULL = types.NULL
var type = require('./type')

var toArray = function(set) {
  var array = []
  set.forEach(function(item) {
    array.push(item)
  })
  return array
}

var toObject = function(map) {
  var object = Object.create(null)
  map.forEach(function(value, key) {
    object[key] = value
  })
  return object
}

module.exports = function equal(a, b) {
  var ta = type(a)
  var tb = type(b)

  if (ta !== tb) return false

  var t = ta

  switch (t) {
  case NUMBER:
    if (a === 0 && (1 / a) === -Infinity)
      return b === 0 && (1 / b === -Infinity)
    return a === b
  case STRING:
  case NULL:
  case BOOLEAN:
      return a === b
  }

  var i, l
  if (t === ARRAY) {
    if (global.Set) {
      if (a instanceof Set) a = toArray(a)
      if (b instanceof Set) b = toArray(b)
    }
    if (a.length !== b.length) return false
    for (i = 0, l = a.length; i < l; i++)
      if (!equal(a[i], b[i])) return false
    return true
  }

  if (t === OBJECT) {
    if (global.Map) {
      if (a instanceof Map) a = toObject(a)
      if (b instanceof Map) b = toObject(b)
    }
    var keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    for (i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      if (b.hasOwnProperty && !b.hasOwnProperty(key)) return false
      if (!equal(b[key], a[key])) return false
    }
    return true
  }

  return true
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./type":25,"./types":26}],25:[function(require,module,exports){
(function (global){
'use strict'

var types = require('./types')
var OBJECT = types.OBJECT
var ARRAY = types.ARRAY
var NULL = types.NULL
var STRING = types.STRING
var BOOLEAN = types.BOOLEAN
var NUMBER = types.NUMBER

module.exports = function type(obj) {
  var t = typeof obj

  if (t === BOOLEAN || t === STRING) return t
  else if (t === NUMBER && isFinite(obj)) return NUMBER
  else if (t === OBJECT) {
    if (Array.isArray(obj)) return ARRAY
    else if (global.Set && obj instanceof Set) return ARRAY
    else if (global.Map && obj instanceof Map) return OBJECT
    else if (obj === null) return NULL
    else if (t === OBJECT) return OBJECT
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./types":26}],26:[function(require,module,exports){
'use strict'

var NUMBER = exports.NUMBER = 'number'
var BOOLEAN = exports.BOOLEAN = 'boolean'
var NULL = exports.NULL = 'null'
var STRING = exports.STRING = 'string'
exports.PRIMITIVES = [NUMBER, BOOLEAN, NULL, STRING]

var ARRAY = exports.ARRAY = 'array'
var OBJECT = exports.OBJECT = 'object'
exports.STRUCTURES = [ARRAY, OBJECT]

},{}]},{},[1])(1)
});
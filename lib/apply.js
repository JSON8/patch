'use strict'

var applyOperation = require('./applyOperation')
var buildRevertPatch = require('./buildRevertPatch')

/**
 * @typedef PatchResult
 * @type Object
 * @property {Any}   doc     - The patched document
 * @property {Array} revert  - An array to be used with revert or buildRevertPatch methods
 */

/**
 * Apply a JSON Patch to a JSON document
 * @param  {Any}          doc                 - JSON document to patch
 * @param  {Array}        patch               - JSON Patch array
 * @param  {Object}       options             - options
 * @param  {Boolean}      options.reversible  - return an array to revert
 * @return {PatchResult}
 */
module.exports = function apply(doc, patch, options) {
  if (!Array.isArray(patch))
    throw new Error('Invalid argument, patch must be an array')

  var done = []

  for (var i = 0, len = patch.length; i < len; i++) {
    var p = patch[i]
    var r

    try {
      r = applyOperation(doc, p)
    }
    catch (err) { // restore document
      // does not use ./revert.js because it is a circular dependency
      var revertPatch = buildRevertPatch(done)
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

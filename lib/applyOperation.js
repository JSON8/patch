'use strict'

var decode = require('json8-pointer').decode
var operations = Object.create(null)
operations.add = require('./add')
operations.copy = require('./copy')
operations.move = require('./move')
operations.remove = require('./remove')
operations.replace = require('./replace')
operations.test = require('./test')

/**
 * Apply a single JSON Patch operation object to a JSON document
 * @param  {Any}    doc - JSON document to patch
 * @param  {Object} op  - JSON Patch operation object
 * @return {Any}
 */
module.exports = function applyOperation(doc, op) {
  if (typeof op.path === 'string')
    var pathTokens = decode(op.path)
  if (typeof op.from === 'string')
    var fromTokens = decode(op.from)

  switch (op.op) {
    case 'add':
    case 'replace':
    case 'test':
      if (op.value === undefined)
        throw new Error('Missing value parameter')
      return operations[op.op](doc, pathTokens, op.value)

    case 'move':
    case 'copy':
      return operations[op.op](doc, fromTokens, pathTokens)

    case 'remove':
      return operations[op.op](doc, pathTokens)
  }

  throw new Error(op.op + ' isn\'t a valid operation')
}

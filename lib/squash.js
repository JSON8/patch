'use strict'

function wasModified(patch, path) {
  for (var i = 0; i < patch.length; i++) {
    var op = patch[i]
    if (op.path !== path) continue
    if (op.op === 'add' || op.op === 'replace' || op.op === 'remove' || op.op === 'move' || op.op === 'copy') return true
  }
  return false
}

module.exports = function squash(patch) {
  var squashed = []

  var push = true

  patch.forEach(function(op) {
    // if current op overrides previous operations, remove them
    if (['add', 'replace', 'remove', 'move', 'copy'].indexOf(op.op) !== -1) {
      squashed.forEach(function(prev, idx) {
        if (prev.op === 'test') return
        if (prev.path === op.path) { // same path - FIXME children/parents ?
          if (wasModified(squashed, op.path)) {
            squashed[idx] = undefined
          }

          // the path was created in the patch, the remove operation shouldn't be included
          // example
          //  {"path": "/foo", "op": "add", "value": "foo"},
          //  {"path": "/foo", "op": "remove"}
          if (op.op === 'remove') {
            push = false
          }
          // the path was created in the patch, replace op requires the target to exist
          // example
          // {"path": "/foo", "op": "add", "value": "foo"},
          // {"path": "/foo", "op": "replace", "value": "bar"}
          else if (op.op === 'replace') {
            // push = false
            op = {"path": op.path, "op": "add", "value": op.value}
          }
        }
      })
    }

    if (push) {
      squashed.push(op)
    }
  })

  var foo = []
  squashed.forEach(function(op) {
    if (op !== undefined) foo.push(op)
  })
  return foo
}

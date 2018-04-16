'use strict'

import assert from 'assert'
import squash from '../lib/squash'
import apply from '../lib/apply'
import {clone} from 'json8'

/* eslint comma-dangle: 0 */

function test(patch, squashed, doc, expected) {
  assert.deepEqual(squash(patch), squashed)


  if (doc) {
    assert.deepEqual(apply(clone(doc), patch).doc, apply(clone(doc), squashed).doc)
  }

  if (expected) {
    assert.deepEqual(apply(clone(doc), patch).doc, expected)
    assert.deepEqual(apply(clone(doc), squashed).doc, expected)
  }
}

/*
 * add
 */
// add - add
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  {},
  {"foo": "bar"}
)
// add - remove
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "remove"}
  ],
  [],
  {},
  {}
)
// add - replace
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  {},
  {"foo": "bar"}
)
// add - move to
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  {"bar": "lulz"},
  {"foo": "lulz"}
)
// // add - move from // FIXME this could resolve to [{"op": "add", "path": "/bar", "value": "lulz"}]
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  {},
  {"bar": "lulz"}
)
// add - copy to
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  {"bar": "lulz"},
  {"bar": "lulz", "foo": "lulz"}
)
// add - copy from
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  {},
  {"foo": "lulz", "bar": "lulz"}
)
// add - test
test(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  {},
  {"foo": "lulz"}
)

/*
 * remove
 */
// remove - add
test(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  {"foo": "lulz"},
  {"foo": "bar"}
)
// // remove - remove // FIXME invalid patch ...
// test(
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/foo", "op": "remove"}
//   ],
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/foo", "op": "remove"}
//   ]
// )
// // remove - replace // FIXME invalid patch ...
// test(
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/foo", "op": "replace", "value": "bar"}
//   ],
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/foo", "op": "replace", "value": "bar"}
//   ]
// )
// remove - move to
test(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  {"foo": "cat", "bar": "dog"},
  {"foo": "dog"}
)
// // remove - move from // FIXME invalid patch
// test(
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/bar", "op": "move", "from": "/foo"}
//   ],
//   [
//     {"path": "/foo", "op": "move", "from": "/bar"}
//   ]
// )
// remove - copy to
test(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  {"foo": "turtle", "bar": "dog"},
  {"foo": "dog", "bar": "dog"}
)
// // remove - copy from // FIXME invalid patch
// test(
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/bar", "op": "copy", "from": "/foo"}
//   ],
//   [
//     {"path": "/foo", "op": "add", "value": "lulz"},
//     {"path": "/bar", "op": "copy", "from": "/foo"}
//   ]
// )
// remove - test // FIXME invalid patch
test(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ]
)

/*
 * replace
 */
// replace - add
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  {"foo": "cat"},
  {"foo": "bar"}
)
// replace - remove // FIXAAAAAAAAAAA
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "remove"}
  ],
  [
    {"path": "/foo", "op": "remove"}
  ],
  {"foo": "cat"},
  {}
)
// replace - replace
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// replace - move to
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// replace - move from
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// replace - copy to
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// replace - copy from
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// replace - test
test(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ]
)

/*
 * move to
 */
// move to - add
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// move to - remove
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// move to - replace
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// move to - move to
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// move to - move from // FIXME this could resolve to []
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// move to - copy to // FIXME invalid patch
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// move to - copy from // FIXME this could resolve to [{"op": "copy", "path": "/bar" from: "/foo"}]
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// move to - test
test(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ]
)

/*
 * move from
 */
// move from - add
test(
  [
    {"path": "/bar", "op": "move", "from": "/foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/bar", "op": "move", "from": "/foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// // move from - remove // FIXME invalid patch
// test(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/foo", "op": "remove"}
//   ],
//   []
// )
// // move from - replace // FIXME invalid patch
// test(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/foo", "op": "replace", "value": "bar"}
//   ],
//   [
//     {"path": "/foo", "op": "add", "value": "bar"}
//   ]
// )
// // move from - move to // FIXME invalid patch
// test(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/foo", "op": "move", "from": "/bar"}
//   ],
//   [
//     {"path": "/foo", "op": "move", "from": "/bar"}
//   ]
// )
// // move from - move from // FIXME invalid patch
// test(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/bar", "op": "move", "from": "/foo"}
//   ],
//   [
//     {"path": "/foo", "op": "move", "from": "/bar"},
//     {"path": "/bar", "op": "move", "from": "/foo"}
//   ]
// )
// move from - copy to // FIXME this could resolve to [{"op": "copy", "path": "/bar", "from": "/foo"}]
test(
  [
    {"path": "/bar", "op": "move", "from": "/foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/bar", "op": "move", "from": "/foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// // move from - copy from // FIXME invalid patch
// test(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/bar", "op": "copy", "from": "/foo"}
//   ],
//   [
//     {"path": "/foo", "op": "move", "from": "/bar"},
//     {"path": "/bar", "op": "copy", "from": "/foo"}
//   ]
// )
// // move from - test // FIXME invalid patch
// test(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/foo", "op": "test", "value": "lulz"}
//   ],
//   [
//     {"path": "/foo", "op": "move", "from": "/bar"},
//     {"path": "/foo", "op": "test", "value": "lulz"}
//   ]
// )


/*
 * copy to
 */
// copy to - add
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// copy to - remove
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// copy to - replace
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// copy to - move to
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// copy to - move from // FIXME this could resolve to [{"op": "copy", "path": "/bar" from: "/foo"}]
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// copy to - copy to
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// copy to - copy from // FIXME this could resolve to []
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// copy to - test
test(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ]
)

/*
 * copy from
 */
// copy from - add
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// copy from - remove
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "remove"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "remove"}
  ]
)
// copy from - replace
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ]
)
// copy from - move to // FIXME this could resolve to []
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// copy from - move from
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// copy from - copy to // FIXME this chould resolve to [{"path": "/bar", "op": "copy", "from": "/foo"}]
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// copy from - copy from
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// copy from - test
test(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ]
)

/*
 * test
 */
// test - add
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// test - remove
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "remove"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "remove"}
  ]
)
// test - replace
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ]
)
// test - move to
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// test - move from
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// test - copy to
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// test - copy from
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// test - test
test(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ]
)

'use strict'

import assert from 'assert'
import squash from '../lib/squash'

/* eslint comma-dangle: 0 */

function equal(obj1, obj2) {
  return assert.deepEqual(squash(obj1), obj2)
}

/*
 * add
 */
// add - add
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// add - remove
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// add - replace
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// add - move to
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// // add - move from // FIXME this could resolve to [{"op": "add", "path": "/bar", "value": "foo"}]
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// add - copy to
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// add - copy from
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// add - test
equal(
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "foo"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ]
)

/*
 * remove
 */
// remove - add
equal(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// // remove - remove // FIXME invalid patch ...
// equal(
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
// equal(
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
equal(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// // remove - move from // FIXME invalid patch
// equal(
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/bar", "op": "move", "from": "/foo"}
//   ],
//   [
//     {"path": "/foo", "op": "move", "from": "/bar"}
//   ]
// )
// remove - copy to
equal(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// // remove - copy from // FIXME invalid patch
// equal(
//   [
//     {"path": "/foo", "op": "remove"},
//     {"path": "/bar", "op": "copy", "from": "/foo"}
//   ],
//   [
//     {"path": "/foo", "op": "add", "value": "foo"},
//     {"path": "/bar", "op": "copy", "from": "/foo"}
//   ]
// )
// remove - test // FIXME invalid patch
equal(
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ],
  [
    {"path": "/foo", "op": "remove"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ]
)

/*
 * replace
 */
// replace - add
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// replace - remove
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// replace - replace
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// replace - move to
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// replace - move from
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// replace - copy to
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// replace - copy from
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// replace - test
equal(
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ],
  [
    {"path": "/foo", "op": "replace", "value": "foo"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ]
)

/*
 * move // FIXME maybe add move from/to for each
 */
// move - add
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// move - remove
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// move - replace
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// move - move to
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// move - move from // FIXME this could resolve to [] but that's a pretty edge case
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// move - copy to // FIXME invalid patch
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// move - copy from // FIXME this could resolve to [{"op": "copy", "path": "/bar" from: "/foo"}] but that's a pretty edge case
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// move - test
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ]
)

/*
 * copy // FIXME maybe add copy from/to for each
 */
// copy - add
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// copy - remove
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// copy - replace
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// copy - move to
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// copy - move from // FIXME this could resolve to [{"op": "copy", "path": "/bar" from: "/foo"}] but that's a pretty edge case
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// copy - copy to
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// copy - copy from // FIXME this could resolve to [] but that's a pretty edge case
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// copy - test
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ]
)

/*
 * test
 */
// test - add
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// test - remove
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "remove"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "remove"}
  ]
)
// test - replace
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ]
)
// test - move to
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// test - move from
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// test - copy to
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// test - copy from
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// test - test
equal(
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "foo"},
    {"path": "/foo", "op": "test", "value": "foo"}
  ]
)

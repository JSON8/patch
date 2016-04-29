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
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// add - remove
equal(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// add - replace
equal(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// add - move to
equal(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// // add - move from // FIXME this could resolve to [{"op": "add", "path": "/bar", "value": "lulz"}]
equal(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// add - copy to
equal(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// add - copy from
equal(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// add - test
equal(
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
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
//     {"path": "/foo", "op": "add", "value": "lulz"},
//     {"path": "/bar", "op": "copy", "from": "/foo"}
//   ]
// )
// remove - test // FIXME invalid patch
equal(
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
equal(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// replace - remove
equal(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// replace - replace
equal(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// replace - move to
equal(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// replace - move from
equal(
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
equal(
  [
    {"path": "/foo", "op": "replace", "value": "lulz"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// replace - copy from
equal(
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
equal(
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
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// move to - remove
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// move to - replace
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// move to - move to
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// move to - move from // FIXME this could resolve to []
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
// move to - copy to // FIXME invalid patch
equal(
  [
    {"path": "/foo", "op": "move", "from": "/bar"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// move to - copy from // FIXME this could resolve to [{"op": "copy", "path": "/bar" from: "/foo"}]
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
// move to - test
equal(
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
equal(
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
// equal(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/foo", "op": "remove"}
//   ],
//   []
// )
// // move from - replace // FIXME invalid patch
// equal(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/foo", "op": "replace", "value": "bar"}
//   ],
//   [
//     {"path": "/foo", "op": "add", "value": "bar"}
//   ]
// )
// // move from - move to // FIXME invalid patch
// equal(
//   [
//     {"path": "/bar", "op": "move", "from": "/foo"},
//     {"path": "/foo", "op": "move", "from": "/bar"}
//   ],
//   [
//     {"path": "/foo", "op": "move", "from": "/bar"}
//   ]
// )
// // move from - move from // FIXME invalid patch
// equal(
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
equal(
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
// equal(
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
// equal(
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
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "add", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// copy to - remove
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "remove"}
  ],
  []
)
// copy to - replace
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "replace", "value": "bar"}
  ],
  [
    {"path": "/foo", "op": "add", "value": "bar"}
  ]
)
// copy to - move to
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "move", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "move", "from": "/bar"}
  ]
)
// copy to - move from // FIXME this could resolve to [{"op": "copy", "path": "/bar" from: "/foo"}]
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
// copy to - copy to
equal(
  [
    {"path": "/foo", "op": "copy", "from": "/bar"},
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ],
  [
    {"path": "/foo", "op": "copy", "from": "/bar"}
  ]
)
// copy to - copy from // FIXME this could resolve to []
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
// copy to - test
equal(
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
equal(
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
equal(
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
equal(
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
equal(
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
equal(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/bar", "op": "move", "from": "/foo"}
  ],
  [
    {"path": "/bar", "op": "move", "from": "/foo"}
  ]
)
// copy from - copy to // FIXME this chould resolve to [{"path": "/bar", "op": "copy", "from": "/foo"}]
equal(
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
equal(
  [
    {"path": "/bar", "op": "copy", "from": "/foo"},
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ],
  [
    {"path": "/bar", "op": "copy", "from": "/foo"}
  ]
)
// copy from - test
equal(
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
equal(
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
equal(
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
equal(
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
equal(
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
equal(
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
equal(
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
equal(
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
equal(
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ],
  [
    {"path": "/foo", "op": "test", "value": "lulz"},
    {"path": "/foo", "op": "test", "value": "lulz"}
  ]
)

'use strict'

import diff from '../lib/diff'
import assert from 'assert'

const data = [
  // primitive primitive
  [true, true],
  // structure structure
  [[], []],
  [{}, {}],
  // replace primitive
  [true, false, 'replace', '', false],
  // replace primitive with structure
  [true, [], "replace", '', []],
  // replace structure with primitive
  [[], true, "replace", '', true],
  // replace structure with structure
  [[], {}, 'replace', '', {}],
  [{}, [], 'replace', '', []],
  // remove key
  [{"foo": "bar"}, {}, 'remove', '/foo'],
  // replace key
  [{"foo": "bar"}, {"foo": "foo"}, 'replace', '/foo', 'foo'],
  // add key
  [{}, {"foo": "foo"}, 'add', '/foo', 'foo'],
  // nested replace key
  [{"foo": {"foo": "bar"}}, {"foo": {"foo": "foo"}}, 'replace', '/foo/foo', 'foo'],
  // nested add key
  [{"foo": {}}, {"foo": {"foo": "foo"}}, 'add', '/foo/foo', 'foo'],
  // nested remove key
  [{"foo": {"foo": "foo"}}, {"foo": {}}, 'remove', '/foo/foo'],
  // nested nested
  [{}, {"foo": {"foo": "foo"}}, 'add', '/foo', {"foo": "foo"}],
  // same array
  [["foo"], ["foo"]],
  // add item end
  [["foo"], ["foo", "bar"], 'add', '/-', 'bar'],
  [["foo", "bara"], ["foo", "bara", "bar"], 'add', '/-', 'bar'],
  // replace item
  [["foo"], ["bar"], 'replace', '/0', 'bar'],
  // replace first item
  [["foo", "bar"], ["bar", "bar"], 'replace', '/0', 'bar'],
  // replace last item
  [["foo", "bar"], ["foo", "foo"], 'replace', '/1', 'foo'],
  // add item start
  [["bar"], ["foo", "bar"], 'add', '/0', 'foo'], // here
  // add item start + 1
  [["foo", "bar"], ["hi", "foo", "bar"], 'add', '/0', 'hi'], // here
  // add item in between
  [["foo", "bar"], ["foo", "lol", "bar"], "add", '/1', 'lol'], // here
  // remove item in between
  [["foo", "foobar", "bar"], ["foo", "bar"], "remove", '/1'], // here
  // replace item in between
  [["foo", "", "bar"], ["foo", "foobar", "bar"], "replace", '/1', 'foobar'],
  // replace 2 first items
  [["foo", "bar", "bar"], ["bar", "foo", "bar"], "replace", '/1', 'foobar'],
]

describe('diff', () => {

  data.forEach(function(d) {

    const patch = diff(d[0], d[1])
    it('returns a correct patch', () => { // FIXME better test message
      if (!d[2])
        return assert.deepEqual(patch, [])

      const op = {"op": d[2], "path": d[3]}
      if (d[4] !== undefined)
        op.value = d[4]

      assert.deepEqual(patch, [op])
    })

  })
})

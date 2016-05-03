JSON8 Patch
===========

[![build status](https://img.shields.io/travis/JSON8/patch.svg?style=flat-square)](https://travis-ci.org/JSON8/patch/branches)

JSON Patch [RFC 6902](http://tools.ietf.org/html/rfc6902) (and diff) implementation for JavaScript.

See [jsonpatch.com](http://jsonpatch.com) for more information about JSON Patch.

JSON8 Patch passes the entire [json-patch-tests](https://github.com/json-patch/json-patch-tests) suite; see [Tests](#tests)

* [Getting started](#getting-started)
* [Methods](#methods)
  * [apply](#apply)
  * [patch](#patch)
  * [revert](#revert)
  * [buildRevertPatch](#buildrevertpatch)
  * [diff](#diff)
  * [valid](#valid)
  * [concat](#concat)
  * [Operations](#operations)
    * [add](#add)
    * [remove](#remove)
    * [replace](#replace)
    * [move](#move)
    * [copy](#copy)
    * [test](#test)
  * [Extra operations](#extra-operations)
    * [get](#get)
    * [has](#has)
  * [Patch size](#patch-size)
    * [pack](#pack)
    * [unpack](#unpack)
* [Tests](#tests)
* [Contributing](#contributing)

# Getting started

```npm install json8-patch```

----

```javascript
var ooPatch = require('json8-patch');
```

or

```xml
<script src="node_modules/json8-patch/JSON8Patch.js"></script>
```
```javascript
var ooPatch = window.JSON8Patch
```

For performance concerns JSON8 Patch may mutate target document; if you want it to use its own copy use:

```javascript
var oo = require('json8')
var myDocument = {foo: 'bar'}
var doc = oo.clone(myDocument)
```

See [clone](https://github.com/JSON8/JSON8#ooclone).

JSON8 Patch never mutates patches.

[↑](#json8-pointer)

# Methods

## apply

[demo/playground](https://json8.github.io/patch/demos/apply/)

```javascript
doc = ooPatch.apply(doc, patch).doc;
```

```ooPatch.apply``` (and other ooPatch methods) returns an object with a doc property because per specification a patch can replace the original root document.

The operation is atomic, if any of the patch operation fails, the document will be restored to its original state and an error will be thrown.

[↑](#json8-patch)

## patch

Alias for [apply](#apply) method.

[↑](#json8-patch)

## revert

If the [patch](#patch) or [apply](#apply) method is called with a third argument ```{reversible: true}``` it will return an additional value in the form of a ```revert``` property.

The revert object can be used to revert a patch on a document.

```javascript
// apply the patch with the reversible option
var applyResult = ooPatch.apply(doc, patch, {reversible: true});
doc = applyResult.doc

// revert the patch
doc = ooPatch.revert(doc, applyResult.revert).doc;
// doc is strictly identical to the original
```

See also [buildRevertPatch](#buildrevertpatch) which offers more flexibility.

[↑](#json8-patch)

## buildRevertPatch

[demo/playground](https://json8.github.io/patch/demos/buildRevertPatch/)

Builds a valid JSON Patch from the result of a reversible apply operation.
You can then use this patch with [apply](#apply) method to revert a previously applied patch.

```javascript
// apply the patch
var applyResult = ooPatch.apply(doc, patch, {reversible: true});
doc = applyResult.doc

// revert the patch
var revertPatch = ooPatch.buildRevertPatch(applyResult.revert) // this is a valid JSON Patch
doc = ooPatch.apply(doc, revertPatch).doc
// doc is strictly identical to the original
```

Because `buildRevertPatch + apply` offers more flexibility over `revert` it is preferred.

* use [pack/unpack](#patch-size) with the result of `buildRevertPatch` making it ideal for storage or transport
* reverse a revert (and so on...) with `{reversible: true}`
* [diff](#diff) between reverts
* merge multiple reverts into one
* rebase reverts

[↑](#json8-patch)

## diff

[demo/playground](https://json8.github.io/patch/demos/diff/)

Returns a diff in the form of a JSON Patch for 2 JSON values.

```javascript
ooPatch.diff(true, false)
// [{"op": "replace", "path": "", "value": "false"}]

ooPatch.diff([], [])
// []

ooPatch.diff({}, {"foo": "bar"})
// [{"op": "add", "path": "/foo", "value": "bar"}]
```

[↑](#json8-patch)

## valid

Returns ```true``` if the patch is valid, ```false``` otherwise.

This method _only_ check for JSON Patch semantic.
If you need to verify the patch is JSON valid, use [oo.valid](https://github.com/JSON8/JSON8#oovalid)

```javascript
ooPatch.valid({})  // false
ooPatch.valid([{}] // false
ooPatch.valid([{op: "foo", path: null, value: undefined}]) // false
ooPatch.valid([{op: "add", path: "/foo"}]) // false

ooPatch.valid([]) // true
ooPatch.valid([{op: "add", path: "/foo", value: "bar"}]) // true
```

[↑](#json8-patch)

## concat

Concats multiple patches into one.

```javascript
var patch1 = [{op: "add", value: "bar", path: "/foo"}]
var patch2 = [{op: "remove", path: "/foo"}]
var patch = ooPatch.concat(patch1, patch2)

// patch is
[
  {op: "add", value: "bar", path: "/foo"},
  {op: "remove", path: "/foo"}
]
```

[↑](#json8-patch)

## Operations

```add```, ```copy```, ```replace```, ```move```, ```remove```, ```test``` operations return an object of the form ```{doc: document, previous: value}```

* ```doc``` is the patched document
* ```previous``` is the previous/replaced value

### add
```javascript
doc = ooPatch.add(doc, '/foo', 'foo').doc;
```

[↑](#json8-patch)

### remove
```javascript
doc = ooPatch.remove(doc, '/foo').doc;
```

[↑](#json8-patch)

### replace
```javascript
doc = ooPatch.replace(doc, '/foo', 'foo').doc;
```

[↑](#json8-patch)

### move
```javascript
doc = ooPatch.move(doc, '/foo', '/bar').doc;
```

[↑](#json8-patch)

### copy
```javascript
doc = ooPatch.copy(doc, '/foo', '/bar').doc;
```

[↑](#json8-patch)

### test
```javascript
doc = ooPatch.test(doc, '/foo', 'bar').doc;
```

[↑](#json8-patch)

## Extra operations

Those are not part of the standard and are only provided for convenience.

### get
```javascript
ooPatch.get(doc, '/foo');
// returns value at /foo
```

[↑](#json8-patch)

### has
```javascript
ooPatch.has(doc, '/foo');
// returns true if there is a value at /foo
```

[↑](#json8-patch)

## Patch size

Per specification patches are pretty verbose. JSON8 provides [pack](#patch) and [unpack](#unpack) methods to reduce the size of patches and save memory/space/bandwidth.

Size (in bytes) comparaison for the following patch file

```json
[
  {"op": "add", "path": "/a/b/c", "value": ["foo", "bar"]},
  {"op": "remove", "path": "/a/b/c"},
  {"op": "replace", "path": "/a/b/c", "value": 42},
  {"op": "move", "from": "/a/b/c", "path": "/a/b/d"},
  {"op": "copy", "from": "/a/b/c", "path": "/a/b/e"},
  {"op": "test", "path": "/a/b/c", "value": "foo"}
]
```

|     format    | size (in bytes) |
|:-------------:|:---------------:|
| unpacked      |       313       |
| unpacked gzip |       148       |
| packed        |       151       |
| packed gzip   |        99       |

In pratice I'd recommand to use pack/unpack if

* data compression cannot be used on the transport of the patch
* keeping a large amount of patches in memory/on disk

[↑](#json8-patch)

### pack

[demo/playground](https://json8.github.io/patch/demos/pack/)

```javascript
var patch = [
  {"op": "add", "path": "/a/b/c", "value": ["foo", "bar"]},
  {"op": "remove", "path": "/a/b/c"},
  {"op": "replace", "path": "/a/b/c", "value": 42},
  {"op": "move", "from": "/a/b/c", "path": "/a/b/d"},
  {"op": "copy", "from": "/a/b/c", "path": "/a/b/e"},
  {"op": "test", "path": "/a/b/c", "value": "foo"}
];

var packed = ooPatch.pack(patch);
```

Here is what packed looks like

```json
[
  [0, "/a/b/c", ["foo", "bar"]],
  [1, "/a/b/c"],
  [2, "/a/b/c", 42],
  [3, "/a/b/d", "/a/b/c"],
  [4, "/a/b/e", "/a/b/c"],
  [5, "/a/b/c", "foo"],
]
```

[↑](#json8-patch)

### unpack

[demo/playground](https://json8.github.io/patch/demos/pack/)

```javascript
var patch = ooPatch.unpack(packed);
// [{...}, {...}, ...]
```

[↑](#json8-patch)

###

# Tests

```
npm install mocha browserify
npm test
```

[↑](#json8-patch)

# Contributing

See [CONTRIBUTING.md](https://github.com/JSON8/patch/blob/master/CONTRIBUTING.md)

[↑](#json8-patch)

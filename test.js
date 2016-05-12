var tp = require("./TextPatcher.js");
var assert = require("assert");

var one = 'I can run faster than you';
var two = 'I can jump farther than you';

var op = tp.diff(one, two);

var fmt = tp.format(one, op);

assert.equal(fmt.insert, 'jump farth');
assert.equal(fmt.remove, 'run fast');

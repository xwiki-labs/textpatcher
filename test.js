var tp = require("./TextPatcher2.js");
var assert = require("assert");

var one = 'I can run faster than you';
var two = 'I can jump farther than you';

var op = tp.diff(one, two);

var fmt = tp.format(one, op);

assert.equal(fmt.insert, 'jump farth');
assert.equal(fmt.remove, 'run fast');


var O = 'The quick brown fox jumped over the lazy dog';
var A = 'The quick red fox jumped over the lazy brown dog';

var HASHSCAN_BLOCK = 2;
var hashScan = function (str) {
    var out = {};
    for (var i = 0; i + HASHSCAN_BLOCK < str.length; i++) {
        var slice = str.slice(i, i + HASHSCAN_BLOCK);
        (out[slice] = out[slice] || []).push(i);
    }
    return out;
};

var isCompatible = function (m1, m2) {
    if (m1.oldIndex < m2.oldIndex) {
        if (m1.oldIndex + m1.length >= m2.oldIndex) { return false; }
        if (m1.newIndex + m1.length >= m2.newIndex) { return false; }
    } else if (m2.oldIndex < m1.oldIndex) {
        if (m2.oldIndex + m2.length >= m1.oldIndex) { return false; }
        if (m2.newIndex + m2.length >= m1.newIndex) { return false; }
    } else {
        return false;
    }
    return true;
};

var reduceMatches = function (matches) {
    console.log('matches');
    console.log(matches);
    console.log();
    // napsack problem, remember to bring socks
    for (var i = 0; i < matches.length; i++) {
        matches[i].compatible = [];
        matches[i].totalValue = matches[i].length;
    }
    for (var i = 0; i < matches.length; i++) {
        for (var j = i + 1; j < matches.length; j++) {
            if (isCompatible(matches[i], matches[j])) {
                matches[i].compatible.push(matches[j]);
                matches[j].compatible.push(matches[i]);
            }
        }
    }
    matches.forEach(function (m) {
        m.compatible.filter(function (mm) {
            var ok = (mm.compatible.indexOf(m) !== -1);
            if (ok) { m.totalValue += mm.length; }
            return ok;
        });
    });
    //matches[i].totalValue += matches[j].length;
    matches.sort(function (a, b) { return b.totalValue - a.totalValue; });
    if (matches.length) {
        matches[0].compatible.push(matches[0]);
        return matches[0].compatible.map(function (x) {
            return {
                length: x.length,
                oldIndex: x.oldIndex,
                newIndex: x.newIndex
            };
        });
    }
    return [];
};

var resolve = function (str, hash) {
    var matches = [];
    var candidates = [];
    for (var i = 0; i + HASHSCAN_BLOCK < str.length; i++) {
        var slice = str.slice(i, i + HASHSCAN_BLOCK);
        var instances = (hash[slice] || []).slice(0);
        for (var j = candidates.length - 1; j >= 0; j--) {
            var c = candidates[j];
            var ii = instances.indexOf(c.oldIndex + c.length - HASHSCAN_BLOCK + 1);
            if (ii > -1) {
                c.length++;
                instances.splice(ii, 1);
            } else {
                // We're pushing all of the candidates as "matches" and then we're going to sort them
                // by length and pull out only ones which are non-intersecting because the result
                // of this function needs to be a set of sequencial non-intersecting matches.
                matches.push(candidates[j]);
                //if (candidates.length === 1) { matches.push(candidates[j]); }

                candidates.splice(j, 1);
            }
        }
        for (var k = 0; k < instances.length; k++) {
            candidates.push({
                newIndex: i,
                oldIndex: instances[k],
                length: HASHSCAN_BLOCK
            });
        }
        //console.log(JSON.stringify(candidates));
    }

    // Normally we would only take one candidate, since they're equal value we just pick one and
    // use it. However since we need all possible candidates which we will feed to our reduce
    // function in order to get a list of sequencial non-intersecting matches.
    Array.prototype.push.apply(matches, candidates);
    //if (candidates[0]) { matches.push(candidates[0]); }

    return reduceMatches(matches);
};

var matchesToOps = function (oldS, newS, matches) {
    matches.sort(function (a, b) { return a.oldIndex - b.oldIndex; });
    console.log()
    console.log(matches);
    console.log()
    var oldI = 0;
    var newI = 0;
    var out = [];
    for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        out.push({
            offset: oldI,
            toRemove: m.oldIndex - oldI,
            toInsert: newS.slice(newI, m.newIndex)
        });
        oldI = m.oldIndex + m.length;
        newI = m.newIndex + m.length;
    }
    return out;
};

console.log(O);
console.log(A);
console.log(resolve(A, hashScan(O)));
console.log(matchesToOps(O, A, resolve(A, hashScan(O))));


var newDiff = function () {
    //var O = 'The quick brown fox jumped over the lazy dog';
    var A =  'The quick red fox jumped over the lazy brown dog';
    var op = tp.diff(O, A);
    var fmt = tp.format(O, op);
    console.log(fmt);
};
newDiff();
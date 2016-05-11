# TextPatcher

String diffing is the basis of the [chainpad](https://github.com/xwiki-contrib/chainpad) API, yet it must be implemented differently depending on the application which is built around chainpad.

TextPatcher.js exposes the components of the code we use in conjunction with chainpad at various degrees of abstraction.

## API

### TextPatcher.diff(oldval, newval)

The foundation of this library is the `diff` method.

Given two strings, it will compute a set of instructions which chainpad can use to transform the first string into the second.

The returned value is called an **Operation** within chainpad.

```
var op = TextPatcher.diff('pew', 'pow');

/*

{
    type: "Operation",
    offset: 1,
    toInsert: "o",
    toRemove: 1
}

*/
```

### TextPatcher.patch(ctx, op)

The `patch` method accepts an instance of a chainpad facade (or anything with a compatible API), and an operation.

It then handles inserting and removing characters from the realtime document.

`patch` has no return value, and operate entirely through side effects.

```
var oldval = myRealtime.getUserDoc();
var newval = "pew pew pew";

var op = TextPatcher.diff(oldval, newval);

TextPatcher.patch(myRealtime, op);
```

### TextPatcher.format(text, op)

Operations are useful for chainpad, but they are not always easy for a human to read.

`format` makes it easier to understand what is happening by showing exactly what content will be removed, and what will be inserted.

```
var text1 = "I can run faster than you";
var text2 = "I can jump farther than you";
var op = TextPatcher.diff(text1, text2);

var formatted = TextPatcher.format(text1, op);
/*

{
    insert: "jump farth",
    remove: "run fast"
}

*/
```

### TextPatcher.log(text, op)

The `log` method is simply a convenience function.

Given the original text and an operation for transforming that text, it formats the operation and prints it to the console.

### TextPatcher.applyChange(ctx, oldval, newval, logging)

`apply` wraps up most of the components of this library.

It accepts a chainpad compatible realtime facade, the previous value, the desired new value, and optionally a flag indicating whether it should log debugging info to the console.

```
TextPatcher.apply(myRealtime, "pew", "pow", false);
```

### TextPatcher.transformCursor(cursor, op)

Chainpad is generally used for synchronizing the contents of two users' interfaces.
In this context, replacing the contents of a textarea (for instance) displaces the text selection of the user receiving the changes.

In general, browser APIs represent the text selection of an element as an offset (in characters) from the first character of the textual interface.

`transformCursor` takes this offset as its first argument, and an operation as its second argument, and returns the value of the cursor, corrected for the operation's changes (if necessary).

```
var textarea = document.getElementsByTagName('textarea')[0];

textarea.selectionStart = TextPatcher.transformCursor(textarea.selectionStart, op);
```

### TextPatcher.create(config)

Finally, the `create` method wraps everything up into an extremely easy to use function.

Simply `create` a patcher by supplying a realtime facade, and optionally a flag indicating whether it should print debugging information to the console.

It will return a function which takes one argument (the string which you would like the realtime session to have as its new state).

That function will efficiently diff the current and updated strings and compute an operation, and then apply it to the realtime, logging the changes if necessary.

```
var patcher = TextPatcher.create({
    realtime: myChainpadInstance,
    logging: true
});

// transform the document to have the content 'pewpewpew'
patcher('pewpewpew');

// now remove the last 'pew' and make it ' bang bang'
patcher('pewpew bang bang')
```

Now you can easily attach listeners to whichever user interface text value you'd like to sync, and when it changes simply pass the new content into the _patching function_.
TextPatcher will make it so.

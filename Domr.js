// The MIT License (MIT)

// Copyright (c) 2014 Azad Ratzki

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
var Domr = (function() {
    var domr = {};

    function setAttributes(element, obj) {
        for (var attr, i = 0, attrs = $(element).get(0).attributes, l = attrs.length; i < l; i++) {
            attr = attrs.item(i)
            obj[attr.nodeName] = attr.nodeValue;
        }
    }

    function fromDOM(element, obj) {
        if (!obj) {
            obj = {};
        }
        obj.tag = $(element).prop("tagName");
        setAttributes(element, obj);
        var children = $(element).contents();
        if (children.length > 0) {
            obj.inner = [];
        }
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.nodeName == "#text") {
                obj.inner.push(child.nodeValue);
            } else {
                var innerObj = {};
                obj.inner.push(innerObj);
                fromDOM($(child), innerObj);
            }
        }
        return obj;
    }

    function toDOM(obj, element) {
        if (typeof obj === "string") {
            $(element).append(obj);
            return;
        }
        var ele = document.createElement(obj.tag);
        for (var name in obj) {
            if (name == "count" || name == "func") {
                continue;
            }
            if (name.toLowerCase() != "tag") {
                if (name.toLowerCase() == "inner") {
                    if (obj.inner) {
                        for (var i = 0; i < obj.inner.length; i++) {
                            var objInner = obj.inner[i];
                            toDOM(objInner, ele);
                        }
                    }

                } else if (name == "innerRepeat") {
                    var innerRepeat = obj.innerRepeat;
                    var count = 0;
                    if(innerRepeat.count instanceof Function)
                    {
                        count = innerRepeat.count.call(innerRepeat);
                    }
                    else
                    {
                        count = innerRepeat.count;
                    }


                    var tag = innerRepeat.tag;
                    var func = innerRepeat.func;
                    for (var i = 0; i < count; i++) {
                        var newEle = toDOM(innerRepeat, ele);
                        if (func) {
                            func.call(newEle, i, count);
                        }
                        for (var newName in innerRepeat) {
                            if (newName == "count" || newName == "tag" || newName == "func")
                                continue;
                            if (innerRepeat[newName] instanceof Function) {
                                $(newEle).attr(newName, innerRepeat[newName].call(newEle, i, count));
                            }
                        }
                    }
                } else {
                    $(ele).attr(name, obj[name]);
                }
            }
        }
        if (element) {
            $(element).append(ele);
        }
        return ele;
    }
    domr.fromDOM = fromDOM;
    domr.toDOM = toDOM;
    return domr;
})();
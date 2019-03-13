function concatBuffers(a, b) {
    return _concatTypedArrays(
        new Uint8Array(a.buffer || a), 
        new Uint8Array(b.buffer || b)
    );
}


function _concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

module.exports = {
    concatBuffers : concatBuffers
}
function Completer(timeout) {
    this._promise = new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
    });
    if (timeout > 0) {
        this._id = window.setTimeout(() => {
            this._reject("timeout");
        }, timeout);
    }
    
}

var method = Completer.prototype;

method.getPromise = function() {
    return this._promise;
}

method._onComplete = function() {
    if (this._id) {
        window.clearTimeout(this._id);
        this._id = null;
    }
}

method.complete = function(data) {
    this._resolve(data);
    this._onComplete();
}

method.completeError = function(reason) {
    this._reject(reason);
    this._onComplete();
}

module.exports = Completer;
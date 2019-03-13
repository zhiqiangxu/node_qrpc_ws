function Completer(timeout) {
    var self = this;
    this._promise = new Promise((resolve, reject) => {
        self._resolve = resolve;
        self._reject = reject;
    });
    if (timeout > 0) {
        this._id = window.setTimeout(() => {
            self._reject("timeout");
        });
    }
    
}


var method = Completer.prototype;

method.getPromise = function() {
    return this._promise;
}

method._onComplete = () => {
    if (this._id) {
        window.clearTimeout(this._id);
        this._id = null;
    }
}

method.complete = (data) => {
    this._resolve(data);
    this._onComplete();
}

method.completeError = (reason) => {
    this._reject(reason);
    this._onComplete();
}

module.exports = Completer;
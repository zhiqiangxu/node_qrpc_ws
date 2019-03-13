function Completer() {
    var self = this;
    this._promise = new Promise(function(resolve, reject){
        self._resolve = resolve;
        self._reject = reject;
    });
}


var method = Completer.prototype;

method.getPromise = function() {
    return this._promise;
}

method.complete = function(data) {
    this._resolve(data);
}

method.completeError = function(reason) {
    this._reject(reason);
}

module.exports = Completer;
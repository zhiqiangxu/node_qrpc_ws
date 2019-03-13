function Config() {
}

var method = Config.prototype;
method.getDialTimeout = function() {
    return this._dialTimeout;
}

method.setDialTimeout = function(timeout) {
    this._dialTimeout = timeout;
}

method.getRequestTimeout = function() {
    return this._requestTimeout;
}

method.setRequestTimeout = function(timeout) {
    this._requestTimeout = timeout;
}

module.exports = Config;
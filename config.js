function Config() {
}

var method = Config.prototype;
method.getDialTimeout = function() {
    return this._dialTimeout;
}

method.setDialTimeout = function(timeout) {
    this._dialTimeout = timeout;
}

module.exports = Config;
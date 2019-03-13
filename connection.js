var FrameReader = require('./framereader');
var binary = require("./binary");
var Completer = require("./completer");

function Connection(url, conf, sub, closecb) {

    this._url = url;
    this._conf = conf;
    this._sub = sub;
    this._closecb = closecb;
    this._respes = {}

}

var method = Connection.prototype;

method.connect = function() {
    if (this._ws) return Promise.resolve();

    console.log("start connect");

    var openc = new Completer();
    var reader = new FrameReader();
    if (typeof WebSocket == "undefined") {
        WebSocket = require("ws");
    }
    var ws = new WebSocket(this._url, null, {
        handshakeTimeout: this._conf.getDialTimeout()
    });
    ws.binaryType = 'arraybuffer';

    var self = this;
    ws.onclose = function(ev) {
        console.log("onclose", ev);
        if (self._closecb) self._closecb(self);
    };
    ws.onopen = function(ev) {
        self._ws = ws;
        openc.complete(ev);
        openc = null;
    }
    ws.onerror = function(ev) {
        console.log("onerror closing", ev, "readyState", ws.readyState);
        if (openc) {
            openc.completeError("connect failed");
            openc = null;
        } else {
            self.close();
        }
        
    };
    ws.onmessage = function(ev) {
        console.log("onmessage", ev);
        if (typeof ev.data === "string") {
            console.log("ignored string data:", ev.data);
            return;
        }
        if (!reader.add(new Uint8Array(ev.data))) {
            console.log("reader.add fail, close");
            self.close();
        }

        while (true) {
            var frame = reader.take();
            if (!frame) break;
            if (frame.isPushed()) {
                if (self._sub != null) {
                    self._sub(self, frame);
                } else {
                    console.log("no sub, pushed msg ignored");
                }
                continue;
            }
            if (frame.requestID in self._respes) {
                self._respes[frame.requestID].complete(frame);
                delete self._respes[frame.requestID];
            } else {
                console.log("dangling frame ignored", frame, "respes", self._respes);
            }
        }
    };

    return openc.getPromise();
}

method.request = function(cmd, flags, payload, timeout) {
    if (typeof payload == "string") payload = new TextEncoder("utf-8").encode(payload);

    if (!this._ws) return Promise.reject("not connected");

    var requestID;
    var ok = false;
    for (var i = 0; i < 3; i++) {
        requestID = this._requestID();
        if (!(requestID in this._respes)) {
            ok = true;
            this._respes[requestID] = new Completer(timeout ? timeout : this._conf.getRequestTimeout());
            break;
        }
    }

    if (!ok) return Promise.reject("out of requestID");

    var size = 12 + payload.length;
    var sizeBytes = new Uint8Array(4);
    sizeBytes[0] = size >> 24;
    sizeBytes[1] = size >> 16;
    sizeBytes[2] = size >> 8;
    sizeBytes[3] = size;
    var allBytes = sizeBytes;

    console.log("request requestID", requestID);
    allBytes = binary.concatBuffers(allBytes, requestID)

    var cmdBytes = new Uint8Array(4);
    cmdBytes[0] = flags;
    cmdBytes[1] = cmd >> 16;
    cmdBytes[2] = cmd >> 8;
    cmdBytes[3] = cmd;
    allBytes = binary.concatBuffers(allBytes, cmdBytes)

    allBytes = binary.concatBuffers(allBytes, payload)

    this._ws.send(allBytes);

    return this._respes[requestID].getPromise();
}

method.close = function() {
    if (this._ws) {
        this._ws.close();
        this._ws = null;
        for (var requestID in this._respes) {
            this._respes[requestID].completeError("closed");
        }
        this._respes = {}
    }
}

method._requestID = function() {
    let bytes = new Uint32Array(2);
    bytes[0] = Math.floor(Math.random()*(2**32-1));
    bytes[1] = Math.floor(Math.random()*(2**32-1));
    return new Uint8Array(bytes.buffer);
}

module.exports = Connection;
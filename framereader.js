
function FrameReader() {
    this._frames = [];
}

var QrpcFrame = require("./qrpc")
var binary = require("./binary")
var method = FrameReader.prototype;

method.add = function(data) {
    if (!this._buffer) {
        this._buffer = data;
    } else {
        this._buffer = binary.concatBuffers(this._buffer, data);
    }
    

    console.log("buffer.length", this._buffer.length);

    while (this._buffer.length >= 16) {
        var size = (this._buffer[0] << 24) + 
                    (this._buffer[1] << 16) + 
                    (this._buffer[2] << 8) + 
                    this._buffer[3];

        console.log("size", size);

        if (size < 12) return false;
        if (this._buffer.length >= 4+size) {
            var requestID = this._buffer.subarray(4, 12);
            console.log("resp requestID", requestID);
            // print("Got requestID $requestID");
            var flags = this._buffer[12];
            var cmd = (this._buffer[13] << 16) + 
                      (this._buffer[14] << 8) + 
                      this._buffer[15];
            var payload = this._buffer.subarray(16, 4+size);
            this._buffer = this._buffer.subarray(4+size);
            var frame = new QrpcFrame(requestID, flags, cmd, payload);
            this._frames.push(frame);
            console.log("got a frame", "frames.length", this._frames.length);
          }
    }

    return true;
};

method.take = function() {
    if (this._frames.length == 0) {
        console.log("frames is empty");
        return;
    }

    return this._frames.shift();
};

module.exports = FrameReader;
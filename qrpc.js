function QrpcFrame(requestID, flags, cmd, payload) {
    this.requestID = requestID;
    this.flags = flags;
    this.cmd = cmd;
    this.payload = payload;
}

var method = QrpcFrame.prototype;


const QrpcStreamFlag = 1;
const QrpcStreamEndFlag = 2;
const QrpcStreamRstFlag = 4;
const QrpcNBFlag = 8;
const QrpcPushFlag = 16;
const QrpcCompressFlag = 32;

method.isPushed = function() {
    return (this.flags & QrpcPushFlag) != 0;
}

module.exports = QrpcFrame;
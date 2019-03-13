```javascript
var qrpc = require("qrpc-over-ws");


var conf = new qrpc.Config()
conf.setDialTimeout(1000);

var addr="ws://localhost:8901/qrpc";
var conn = new qrpc.Connection(addr, conf, function(conn, frame){
	console.log("pushed", frame);
}, function(conn) {
	console.log("closed");
});


var cmd = 0;
var flags = 0;
var loginRequest = {"app":"app","uid":"cs1","device":"mac","token":"cs"};
var payload = JSON.stringify(loginRequest);
conn.connect().then(function(ev) {
	return conn.request(cmd, flags, payload);
}).then(function(frame){
	console.log("login data", new TextDecoder('utf-8').decode(frame.payload));
}).catch(function(error){
	console.log("error", error);
});

```
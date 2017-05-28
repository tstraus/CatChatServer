var WebSocketServer = require('uws').Server;
var wss = new WebSocketServer({ port: 1234 });

function onMessage(message) {
    console.log('received: ' + message);
}

wss.on('connection', function(ws) {
    ws.on('message', onMessage);
    ws.send('something');
});
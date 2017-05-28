const uuid = require("uuid/v4");
var WebSocketServer = require("uws").Server;

var wss = new WebSocketServer({ port: 1234 });
var connections = new Map(); // uuid to websocket connection map
var users = new Map(); // username to uuid map

function onMessage(message) {
    var msg = JSON.parse(message);

    if (msg.type === "join" && connections.has(msg.uuid)) {
        console.log(msg.user + " joined");
        users.set(msg.user, msg.uuid);
    }

    else if (msg.type === "msg" && connections.has(msg.uuid)) {
        try {
            console.log(msg.user + " -> " + msg.data.dest + ": " + msg.data.msg);

            var output = {
                type: "msg",
                uuid: users.get(msg.data.dest), // uuid of the desination, verification
                user: msg.user, // sender username
                data: msg.data.msg
            };

           connections.get(output.uuid).send(JSON.stringify(output));
        } catch (err) {
            console.log("Could not find the destination");
        }
    }

    else {
        console.log("Received invalid message type");
    }
}

function onClose() {

}

wss.on("connection", function(ws) {
    ws.on("message", onMessage);
    ws.on("close", onClose);

    ws.uuid = uuid();
    connections.set(ws.uuid, ws);
    console.log("connection: " + ws.uuid);

    var id = {
        type: "uuid",
        uuid: ws.uuid
    };

    ws.send(JSON.stringify(id));
});
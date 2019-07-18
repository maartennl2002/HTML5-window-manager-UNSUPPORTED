//host met node.js

var http = require('http');
var server = http.createServer(function(request, response) {});

var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
        httpServer: server
    });

server.listen(23456, function() {
    console.log((new Date()) + ' Server is listening on port 23456');
});

var count = 0;
var clients = {};
wsServer.on('request', function(r) {
    console.log(r.requestedProtocols[0]);
    var connection = r.accept(r.requestedProtocols[0], r.origin);

    // Specific id for this client & increment count
    var id = count++;

    console.log((new Date()) + ' Connection accepted [' + id + ']');
    // Store the connection method so we can loop through & contact all clients
    clients[id] = connection;
    // Create event listener
    connection.on('message', function(message) {

        // The string message that was sent to us
        var msgString = message.utf8Data;
        broadcast(msgString);

    });

    connection.on('close', function(reasonCode, description) {
        delete clients[id];
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function broadcast(msgString) {
    // Loop through all clients
    for (var i in clients) {
        // Send a message to the client with the message
        clients[i].sendUTF(msgString);
    }
}

function send(msgString, id) {
    clients[id].sendUTF(msgString);
}


var express = require('express');
var app = express();
var http = require('http').Server(app);
var http_rasp = require('http').Server(app);
var io = require('socket.io')(http);
var io_rasp = require('socket.io')(http_rasp);

var fs = require('fs');
var path = require('path');

var dateformat = require("dateformat");

app.use('/', express.static(path.join(__dirname, 'stream')));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var sockets = {};

io.on('connection', function(socket) {
	sockets[socket.id] = socket;
	console.log("Total clients connected : ", Object.keys(sockets).length);

	socket.on('disconnect', function() {

		delete sockets[socket.id];
		// no more sockets, kill the stream
		if (Object.keys(sockets).length == 0) {
			app.set('watchingFile', false);
			fs.unwatchFile(__dirname+'./stream/image_stream.jpg');
		}
	});
	socket.on('start-stream', function() {
		startStreaming(io);
	});
});


http.listen(3000, function() {
	console.log('listening on *:3000');
});
function stopStreaming() {

	if (Object.keys(sockets).length == 0) {
		app.set('watchingFile', false);
		fs.unwatchFile(__dirname+'/stream/image_stream.jpg');
	}
}

function startStreaming(io) {
	if (app.get('watchingFile')) {
		io.sockets.emit('liveStream', {url:'image_stream.jpg?_t=' + (Math.random() * 100000), time:dateformat(new Date(), "yyyy/mm/dd HH:MM:ss")});
		return;
	}

	console.log('Watching for changes...');
	app.set('watchingFile', true);

	fs.watchFile(__dirname+'/stream/image_stream.jpg', function(current, previous) {
		console.log('emmit liveStewam');
		io.sockets.emit('liveStream', {url:'image_stream.jpg?_t=' + (Math.random() * 100000), time:dateformat(new Date(), "yyyy/mm/dd HH:MM:ss")});
	})
}

////////////////////////////////////////////
http_rasp.listen(3001, function() {
	console.log('listening on *:3001');
});

io_rasp.on('connection', function(socket) {
	sockets[socket.id] = socket;
	console.log("Total clients connected[rasp] : ", Object.keys(sockets).length);

	socket.on('liveStream', function(data) {
		console.log("receive liveStream[rasp] : ");
		fs.writeFile(__dirname+'/stream/image_stream.jpg', data.buffer);
	});

	socket.on('disconnect', function() {
		delete sockets[socket.id];
	});
});

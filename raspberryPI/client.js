
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

var spawn = require('child_process').spawn;
var proc;

var dateformat = require("dateformat");

app.use('/', express.static(path.join(__dirname, 'stream')));

var client = require('socket.io-client');
var socket = client.connect('http://hogehoge:3001');
socket.on('connect', function() {
	console.log('Connection - ');

	var args = ["-bm", "-w", "320", "-h", "240", "-o", __dirname + "/stream/image_stream.jpg", "-t", "999999999", "-tl", "500", "--nopreview"];
	proc = spawn('raspistill', args);
	console.log('Watching for changes...');

	fs.watchFile(__dirname+'/stream/image_stream.jpg', function(current, previous) {
		fs.readFile(__dirname+'/stream/image_stream.jpg', function(err, buf){
			socket.emit('liveStream', { image: true, buffer: buf, time:dateformat(new Date(), "yyyy/mm/dd HH:MM:ss") });
			console.log('emmit liveStewam 2 server');
		});
	})

});

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var data = require('./data.js');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '/map.html'));
});

app.get('/track', function (req, res) {
	res.sendFile(path.join(__dirname, '/track.html'));
});

app.get('/socket', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/alldrivers', function (req, res) {
	var dateString = req.query.date;
	data.getAllPosition(dateString, function (result) {
		res.send(result);
	});
});

app.get('/trackdriver', function (req, res) {
	var driverId = req.query.driver;
	var dateString = req.query.date;
	data.getOneTrack(dateString, driverId, function (result) {
		res.send(result);
	});
});

app.post('/insertlog', function (req, res) {
	console.log(req.body);
	data.insertLog(req.body.driverId, req.body.driverName, req.body.lng, req.body.lat, function (result) {
		res.send(result);
	});
});

io.on('connection', function (socket) {
	console.log('a user connected');
	socket.emit('name', 'You connected to socket.io.');
	socket.on('chat message', function (msg) {
		console.log('message: ' + msg);
	});
	socket.on('send location', function (di, dn, lng, lat) {
		data.insertLog(di, dn, lng, lat, function (result) {
			console.log(result);
		});
	});
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});

var server = http.listen(3001, function () {
	console.log('Server start successfully.');
	
	data.connect();
});
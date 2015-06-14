/* TODO

- create mock data for a few entries.
- when a new client connects, send them the mock data + merged memory data to parse.
- new client will build list view from scratch with that data.
- when clicking on a list item, go into detail view with that data to display using detail/{id}.
- when clicking "Share my Basket, create a new data object and store it in memory/or a db with MakerBot Fridge as the name"
- on reload of the index page the new data should show and go back to #1.

*/

// load credentials
require('dotenv').load();

var fs = require('fs'),
	express = require('express'),
 	app = express(),
 	http = require('http').Server(app),
 	io = require('socket.io')(http),
	Firebase = require('firebase'),
	_ = require('underscore');

var firebase_email = process.env.FIREBASE_EMAIL,
	firebase_password = process.env.FIREBASE_PASS,
	firebase_sandbox = process.env.FIREBASE_SANDBOX;

var ref = new Firebase(firebase_sandbox);
var credentials = { email: firebase_email, password: firebase_password };

var users = {};
var mock = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Firebase
ref.authWithPassword(credentials, function(err, auth) {
	if (err) {
		console.error('Failed to login with credentials:', err);
	} else if (auth) {


		// What is the weight of our tray?
		ref.child('users').child('google:105724342149087020351/devices/chillhubs/dummy/milkyWeighs/1ea8fdb9-2418-440b-a67b-fa16210f0c9e/weight').on('value', function(snapshot) {
			var percentageOfFoodOnTray = JSON.stringify(snapshot.val(), null, 2);
			console.log("percentageOfFoodOnTray : "  + percentageOfFoodOnTray);
			io.sockets.emit('foodWeightChange', { data: percentageOfFoodOnTray });
		});

		// do we have eggs?
		ref.child('users').child('google:105724342149087020351/devices/chillhubs/dummy/foodshare/072b3293-d637-4f53-a273-edf8c7711d17/egg_presenct1').on('value', function(snapshot) {
			var isPresent = JSON.stringify(snapshot.val(), null, 2);
			console.log("eggPresent1 : "  + isPresent);
			io.sockets.emit('eggChange', { data: isPresent });
		});

		ref.child('users').child('google:105724342149087020351/devices/chillhubs/dummy/foodshare/072b3293-d637-4f53-a273-edf8c7711d17/egg_presenct2').on('value', function(snapshot) {
			var isPresent = JSON.stringify(snapshot.val(), null, 2);
			console.log("eggPresent2 : "  + isPresent);
			io.sockets.emit('eggChange', { data: isPresent });
		});

		// how fresh is the food? 0-100
		ref.child('users').child('google:105724342149087020351/devices/chillhubs/dummy/foodshare/072b3293-d637-4f53-a273-edf8c7711d17/freshness_ind').on('value', function(snapshot) {
			var freshness = JSON.stringify(snapshot.val(), null, 2);
			console.log("freshness % : "  + freshness);
			io.sockets.emit('freshnessChange', { data: freshness });
		});

	} else {
		console.error('Failed to login with credentials!');
		console.error('Make sure you entered your email and password correctly.');
	}
});

// Express Routes
app.set('view engine', 'jade');

app.use('/assets',express.static(__dirname + '/assets'));

app.get('/', function(req, res){
	res.render('index', { data: mock });
	//res.sendFile(__dirname + '/index.html');
});

// app.get('/detail', function(req, res){
// 	res.sendFile(__dirname + '/detail.html');
// });

app.get('/detail/:id', function(req, res, next) {
	var id = req.params.id;

	obj = _.find(mock, function(obj) { return obj.id == id });

	if(typeof obj === "undefined") {
		// err
		return next();
	}

	res.render('detail', { data: obj });
});

app.get('/notify/:id', function(req, res, next) {
	var id = req.params.id;

	obj = _.find(mock, function(obj) { return obj.id == id });

	if(typeof obj === "undefined") {
		// err
		return next();
	}

	res.render('notify', { data: obj });
});

app.get('/share', function(req, res){
	res.render('share');
});

app.get('/splash', function(req, res){
	res.sendFile(__dirname + '/splash.html');
});

// app.get('/notify', function(req, res){
// 	res.sendFile(__dirname + '/notify.html');
// });


// Socket IO
io.on('connection', function(socket) {
	users[socket.id] = socket;
	console.log('user connected', Object.keys(users).length);

	socket.on('disconnect', function(){
		delete users[socket.id];
		console.log('user disconnected', Object.keys(users).length);
	});

	socket.on('interested', function(){
		console.log('user is interested in your food');
	});

	socket.on('share', function(){
		console.log('user wants to share their video food');
	});
});


// start server
http.listen(3000, function(){
	console.log('listening on *:3000');
});
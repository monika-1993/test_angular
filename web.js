var flock = require('flockos');
var config = require('./config.js');
var express = require('express');
var fs = require('fs');
const pg = require('pg');

flock.setAppId(config.appId);
flock.setAppSecret(config.appSecret);

var app = express();

// Listen for events on /events, and verify event tokens using the token verifier.
app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);

// Read tokens from a local file, if possible.
var tokens;
try {
  tokens = require('./tokens.json');
} catch (e) {
  tokens = {};
}
debugger;

// save tokens on app.install
flock.events.on('app.install', function (event) {
  tokens[event.userId] = event.token;
});

// delete tokens on app.uninstall
flock.events.on('app.uninstall', function (event) {
  delete tokens[event.userId];
});

// Start the listener after reading the port from config
var port = config.port || 6000;
app.listen(port, function () {
  console.log('Listening on port: ' + port);
});

// exit handling -- save tokens in token.js before leaving
process.on('SIGINT', process.exit);
process.on('SIGTERM', process.exit);
process.on('exit', function () {
  fs.writeFileSync('./tokens.json', JSON.stringify(tokens));
});
// var express = require('express');
// var app = express();
//
app.set('port', (process.env.PORT || 6000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

app.get('/', function(request, response) {
  response.render('pages/index');
});
// app.get('/home', function(request, response) {
//   response.render('pages/home');
// });
//
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

module.exports = app;

var pg = require('pg');
var methood = require('methood');
var EventEmitter = require('events').EventEmitter;
var buildConnectionString = require('./build-connection-string');
var myClient = require('./client');


var method = methood(exports);

method('connection', function(cb){
	return exports.connection({}, cb);
});

method('connection', function(connectionInfo, cb){
	var eventEmitter = new EventEmitter();

	pg.connect(buildConnectionString(connectionInfo), function(err, client, done){
		cb(err, myClient(client), done);
	});

	return eventEmitter;
});

method('transaction', function(cb){
	var eventEmitter = new EventEmitter();

	exports.connection(function(err, client, done){
		client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE', function(err) {
			var rollback = function(){
				client.query('ROLLBACK', function(err) {
					done(err || 'rolling back');

					eventEmitter.emit('rollback');
				});
			};
			var commit = function() {
				client.query('COMMIT', function(err){
					done(err);
					eventEmitter.emit('commit');
				});
			};

			cb(err, client, commit, rollback);
		});
	});

	return eventEmitter;
});


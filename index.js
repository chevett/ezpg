var pg = require('pg');
var methood = require('methood');
var EventEmitter = require('events').EventEmitter;
var buildConnectionString = require('./build-connection-string');
var myClient = require('./client');
var atry = require('atry');


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
	return exports.transaction({}, cb);
});

method('transaction', function(connectionInfo, cb){
	var eventEmitter = new EventEmitter();

	exports.connection(function(err, client, done){
		client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE', function(err) {
			var wasTransactionProperlyEnded = false;

			var rollback = function(cb){
				client.query('ROLLBACK', function(err) {
					if (wasTransactionProperlyEnded) return;

					done(err || 'rolling back');
					wasTransactionProperlyEnded = true;

					eventEmitter.emit('rollback');
					if (cb) cb();
				});
			};
			var commit = function() {
				client.query('COMMIT', function(err){
					if (wasTransactionProperlyEnded) return;

					done(err);
					wasTransactionProperlyEnded = true;

					eventEmitter.emit('commit');
				});
			};


			atry(function(){
				cb(err, client, commit, rollback);
			}).catch (function(e){
				if (!wasTransactionProperlyEnded){
					rollback(function(){
						eventEmitter.emit('error', e);
					});
				} else {
					eventEmitter.emit('error', e);
				}
			});
		});
	});

	return eventEmitter;
});

method('temporary', function(cb){
	return exports.transaction(function(err, client, commit, rollback){
		if (err) throw err;
		cb(client, rollback);
	});
});

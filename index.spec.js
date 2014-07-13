var expect = require('chai').expect,
	ezpg = require('./index');

describe('ezpg', function(){
	it('should be able to get a connection without connection info', function(done){
		ezpg.connection(function(err, client, release){
			client.query('select 9000 as ans;', function(err, result){
				expect(result.rows[0].ans).to.be.equal(9000);
				release();
				done();
			});
		});

	});

	it('should be able to get a connection and call a function', function(done){
		ezpg.connection(function(err, client, release){
			client.func('pg_database_size', ['relay'], function(err, result){
				if (err){
					release();
					return done(err);
				}

				expect(result[0]).to.match(/^\d+$/);
				release();
				done();
			});
		});

	});

	it('should be able to rollback a transaction', function(done){
		var transaction = ezpg.transaction(function(err, client, commit, rollback){
			expect(err).to.not.be.ok;

			client.query('create table relay.temp_test(id smallint);insert into relay.temp_test(id) values(7);', function(err, result){
				client.query('select id from relay.temp_test', function(err, result){
					expect(err).to.not.be.ok;
					expect(result.rows[0].id).to.be.equal(7);

					rollback();
				});
			});
		});

		transaction.on('rollback', function(){
			ezpg.connection(function(err, client, release){
				client.query('select id from relay.temp_test', function(err, result){
					expect(err).to.be.ok;
					expect(result).to.not.be.ok;

					done();
				});
			});
		});
	});
});

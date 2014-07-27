ezpg [![Build Status](http://build.deliveryrelay.com:3000/chevett/ezpg/badge)](http://build.deliveryrelay.com:3000/chevett/ezpg)
====


```js
var ezpg = require('ezpg');


ezpg.connection(function(err, client, done){
	// normal pq stuff
	client.query('select 1;', function(err, result){
		//done()
	});

	// ez'er pg function
	client.func('pg_database_size', ['template1'], function(err, result){
		console.log('your db is ' + result[0] + 'bytes.');
		done();
	});
});

ezpg.transaction(function(err, client, commit, rollback){
	client.query('create table relay.thisismynewtabkldasfadsfdsfads(id smallint);', function(err, result){
		
		// jk
		rollback();
	});
});
```



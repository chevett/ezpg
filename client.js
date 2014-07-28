var methood = require('methood'),
	_ = require('lodash'),
	util = require('util');

function _buildFunctionCall(functionName, parameters){
	var strParameters = parameters.map(function(p, i){ return '$' + (i+1); });
	return util.format('select * from %s(%s);', functionName, strParameters);
}

module.exports = function(pgClient){
	if (!pgClient) return;
	var method = methood(pgClient);

	method('func', function(functionName, cb){
		return pgClient.func(functionName, [], cb);
	});

	method('func', function(functionName, parameters, cb){
		if (typeof cb !== 'function') throw new Error('ezpg.func needs a callback!');
		parameters = _.flatten([parameters], true);

		var sql = _buildFunctionCall(functionName, parameters);

		pgClient.query(sql, parameters, function(err, result){
			if (err) return cb(err);

			var pluckFunctionName = result.rows.every(_.partialRight(_.has, functionName)),
				pluckSingleKey = !pluckFunctionName && result.rows.every(function(row){
					return _.keys(row).length === 1;
				}),
				singleKey = pluckSingleKey && result.rows.length > 0 && _.keys(result.rows[0])[0];

			if (pluckFunctionName){
				cb(null, _.pluck(result.rows, functionName));
			} else if (pluckSingleKey){
				cb(null, _.pluck(result.rows, singleKey));
			} else {
				cb(null, result.rows);
			}
		});
	});

	return pgClient;
};




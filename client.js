var methood = require('methood'),
	_ = require('lodash'),
	util = require('util');

function _buildFunctionCall(functionName, parameters){
	parameters = parameters || [];

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
		pgClient.query(_buildFunctionCall(functionName, parameters), parameters, function(err, result){
			if (err){
				cb(err);
			} else {
				cb(null, _.pluck(result.rows, functionName));
			}
		});
	});

	return pgClient;
};




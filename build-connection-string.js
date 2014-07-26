var _ = require('lodash'),
	util = require('util');

var CONNECTION_INFO = {
	host     : process.env.MYSQL_MYRULES_HOST ||'localhost',
	user     : process.env.MYSQL_MYRULES_USER || 'relay',
	database : process.env.MYSQL_MYRULES_DATABASE || 'relay',
	password : process.env.MYSQL_MYRULES_PASS || ''
};

module.exports = function(connectionInfo){
	connectionInfo = _.extend({}, CONNECTION_INFO, connectionInfo);

	return util.format('postgres://%s:%s@%s/%s', 
		connectionInfo.user,
		connectionInfo.password,
		connectionInfo.host,
		connectionInfo.database
	);
};

//the server folder needs to hold a file called 'config.js' that looks similar to this
module.exports = {
	'secret': "secret-key-for-app",
	'db': {
		'url': "mongodb://user:pw@host:port/database-name",
		'options': {
			'keepAlive': true,
			'autoReconnect': true
		}
	},
	'tokens': {
		'duration': 86400
	},
	'email': {
		'address': 'email-address-to-send-from',
		'name': 'Critter DB',
		'password': 'email-address-password'
	}
};

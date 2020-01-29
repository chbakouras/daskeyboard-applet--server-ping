const assert = require('assert');
const ServerPing = require('../index').ServerPing;
const requestUri = 'https://www.google.com';

function getDefaultConfig() {
	return {
		applet: {
			defaults: {
				serverUrl: requestUri,
				requestInterval: 60,
				upColor: '#00ff00',
				downColor: '#ff0000'
			}
		}
	};
}

describe('Server Ping: #run()', () => {
	it(`Request ${requestUri}`, async () => {
		let config = getDefaultConfig();
		let app = new ServerPing();
		await app.processConfig(config);
		return app.run()
			.then((signal) => {
				let point = signal.points[0][0];
				return !!point ? assert.ok(point.color) : assert.fail('No signal color returned by applet');
			})
			.catch((err) => assert.fail(err));

	});
});

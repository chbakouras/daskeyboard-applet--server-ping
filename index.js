const q = require('daskeyboard-applet');
const rp = require('request-promise-native');
const logger = q.logger;

async function ping(url) {
    return rp.get({
        uri: url,
        resolveWithFullResponse: true,
        simple: false
    });
}

class ServerPing extends q.DesktopApp {

    constructor() {
        super();
    }

    async run() {
        return ping(this.serverUrl)
            .then(response => {
                let color = this.getStatusColor(response.statusCode);
                let statusString = this.getStatusString(response.statusCode);
                return ServerPing.buildSignal(color, this.serverUrl, statusString, response.statusCode);
            }).catch(error => ServerPing.buildSignal(this.downColor, this.serverUrl, null, null, error));
    }

    async applyConfig() {
        this.pollingInterval = 1000 * this.requestInterval;
    }

    get serverUrl() {
        let u = this.config.serverUrl;
        return /http(s)?\:\/\//.test(u) ? u : `http://${u}`;
    }

    get requestInterval(){
        return this.config.requestInterval || 1000 * 60;
    }

    get upColor() {
        return this.config.upColor || '#00ff00';
    }

    get downColor() {
        return this.config.downColor || '#ff0000';
    }

    get desiredStatusCode() {
        return JSON.parse(this.config.desiredStatusCode || 200);
    }

    getStatusString(statusCode) {
        return statusCode === this.desiredStatusCode ? 'UP' : 'DOWN';
    }

    getStatusColor(statusCode) {
        return statusCode === this.desiredStatusCode ? this.upColor : this.downColor;
    }

    static buildSignal(color, url, serverStatus, serverStatusCode, err) {
        if (err)
            return q.Signal.error([`SERVER PING ERROR<br/>${err}`]);
        return new q.Signal({
            points: [[new q.Point(color)]],
            name: `Server Ping`,
            message: `Server is ${serverStatus}<br />${url}: ${serverStatusCode}`
        });
    }
}

const applet = new ServerPing();

module.exports = {
    ServerPing: ServerPing
};

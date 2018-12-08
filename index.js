const q = require('daskeyboard-applet');
const rp = require('request-promise');
const logger = q.logger;

async function ping(url) {
    return rp.get({
        url: url,
        resolveWithFullResponse: true
    });
}

class ServerPing extends q.DesktopApp {

    constructor() {
        super();
        this.pollingInterval = 60000;
    }

    async run() {
        const $this = this;
        return $this.getServerUrl()
            .then(url => ping(url))
            .then(response => 
                ServerPing.buildSignal($this.getStatusColor(response.statusCode), response.statusCode)
            )
            .catch(error => ServerPing.buildSignal($this.getDownColor(), error));
    }

    async applyConfig() {
        const $this = this;
        return $this.getServerUrl()
            .then(url => ping(url))
            .then(response => response.statusCode === 200)
            .catch(error => {
                logger.warn(error);
                return false;
            });
    }

    getServerUrl() {
        return this.config.serverUrl
            ? Promise.resolve(this.config.serverUrl)
            : Promise.reject()
    }

    getUpColor() {
        return this.config.upColor
            ? this.config.upColor
            : "#00FF00";
    }

    getDownColor() {
        return this.config.downColor
            ? this.config.downColor
            : "#FF0000";
    }

    getStatusColor(status) {
        return status === 200
            ? this.getUpColor()
            : this.getDownColor();
    }

    static buildSignal(color, serverStatus) {
        return new q.Signal({
            points: [
                [new q.Point(color)]
            ],
            name: `Server ping`,
            message: `Server status: ${serverStatus}`
        });
    }
}

const applet = new ServerPing();

module.exports = {
    ServerPing: ServerPing
};

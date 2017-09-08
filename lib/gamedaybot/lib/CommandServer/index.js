const Logger = require('../Logger');

const server = require('./server.js');
const config = require('config');

const EventEmitter = require('events').EventEmitter;
class CommandServer extends EventEmitter
{
    constructor()
    {
        super();

        this.logger = new Logger("CommandServer", config.get("CommandServer.logLevel"));
        this._app = server(this);
    }

    start()
    {
        var self = this;

        this.logger.verbose("Starting server");
        var port = config.get("CommandServer.port");
        this._app.listen(port, function () { self.logger.verbose(`Listening on port ${port}`) });
    }
}

module.exports = CommandServer;
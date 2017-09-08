const server = require('./server.js');
const config = require('config');

var self = null;

const EventEmitter = require('events').EventEmitter;
class CommandServer extends EventEmitter
{
    constructor()
    {
        super();

        self = this;
        self._app = server(self);
    }

    start()
    {
        var port = config.get('CommandServer.port');
        self._app.listen(port, () => console.log('listening:', port));
    }
}

module.exports = CommandServer;
const Logger  = require('../logging/Logger.js');
const express = require('express');
const bParser = require('body-parser');

var self = null;

const EventEmitter = require('events').EventEmitter;
class CommandServer extends EventEmitter
{
    constructor(watcher)
    {
        super();

        self = this;
        self.watcher = watcher;

        self.logger = new Logger("CServ", "debug");
        
        self.initServer();
    }

    initServer()
    {
        self.logger.debug("Initializing server");
        
        self._inner = express();
        self._inner.use(bParser.urlencoded({ extended: true }));

        self._inner.post('/rangersbot', (req, res) => {
            var args = req.body.text.split(' ');

            switch(args[0].toUpperCase())
            {
                case "START":
                    self.emit('start', args, req);
                    break;
                case "STOP":
                    self.emit('stop', args, req);
                    break;
                case "DELAY":
                    self.emit('delay', args, req);
                    break;
                case "PREVIEW":
                    self.emit('preview', args, req);
                    break;
                default:
                    self.emit('unknown', args, req);
                    break;
            }
        });
    }

    listen(port)
    {
        self.port = port;
        self._inner.listen(self.port, () => self.logger.verbose(`Listening on port ${self.port}`));
    }
};

module.exports = CommandServer;

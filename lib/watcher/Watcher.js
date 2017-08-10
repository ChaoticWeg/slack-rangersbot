const EventEmitter = require('events').EventEmitter;
const Logger = require('../logging/Logger.js');
const moment = require('moment');

class Watcher extends EventEmitter
{
    constructor()
    {
        super();

        this.logger = new Logger("Watcher");

        this.lastRequestTimestamp = moment().format("YYYYMMDD_HHmmss");
        this.logger.verbose(`Last timestamp: ${this.lastRequestTimestamp}`);
    }
}

module.exports = Watcher;
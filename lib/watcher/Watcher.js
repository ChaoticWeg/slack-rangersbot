const EventEmitter = require('events').EventEmitter;

class Watcher extends EventEmitter
{
    constructor()
    {
        super();
    }
}

module.exports = Watcher;
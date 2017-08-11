const EventEmitter = require('events').EventEmitter;
const Constants = require('../Constants.js');
const Gameday   = require('./Gameday.js');
const Logger    = require('../logging/Logger.js');
const moment    = require('moment');
const path      = require('path');

var self = null;

class Watcher extends EventEmitter
{
    constructor()
    {
        super();

        self = this;

        self._logger  = new Logger("Watcher", "debug");
        self._gameday = new Gameday(self);

        self._running = false;

        self.timers = {};
        self.timers.nextRequest = null;
        self.timers.keepAlive = null;
    }

    // getters
    get logger()    { return self._logger;  }
    get gameday()   { return self._gameday; }
    get gameId()    { return self._gameId;  }
    get isRunning() { return self._running; }

    /**
     * Set state to running, start all timers
     */
    start(gameId)
    {
        if (!gameId)
            throw new Error("Game ID not defined!");

        self._gameId = gameId;

        self.logger.debug(`Starting to watch game ${self.gameId}...`);

        self._running = true;
        self.timers.keepAlive = setInterval(self.tick, Constants.Watcher.TickTime);

        self.logger.info(`Started watching game ${self.gameId}`);
        self.emit('started', self);
    }

    /**
     * What to do on each tick
     */
    tick()
    {
        self.logger.silly('tick');
        self.emit('tick', self);

        // do not schedule the next tick if the Watcher has stopped
        if (!self.isRunning) {
            self.logger.debug('Tick, but we are not running! Bailing out...');
            return;
        }
    }

    /**
     * Halt all timers and set the Watcher's state to stopped
     */
    stop()
    {
        self._running = false;

        clearInterval(self.timers.keepAlive);
        clearInterval(self.timers.nextRequest);

        self.emit('stopped', self);
    }
    
}

module.exports = Watcher;
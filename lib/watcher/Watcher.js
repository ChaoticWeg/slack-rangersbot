const EventEmitter = require('events').EventEmitter;
const Logger    = require('../logging/Logger.js');
const Timestamp = require('../Timestamp.js');
const Constants = require('../Constants.js');
const Gameday   = require('./Gameday.js');
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
        self._gameday = new Gameday();

        self._gameData = {};

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
        self._lastRequestTimestamp = Timestamp.gameday();

        self.logger.debug(`Starting to watch game ${self.gameId}...`);

        self._running = true;
        self.timers.keepAlive = setInterval(self.tick, Constants.Watcher.TickTime);

        self.logger.info(`Started watching game ${self.gameId}`);
        self.emit('started', self);

        self.scheduleNextRequest(Constants.Watcher.InitialDelay);
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


    /**
     * Schedule the next request
     * @param delaySec Number of seconds to wait for this request
     */
    scheduleNextRequest(delaySec = Constants.Watcher.DefaultWaitTime)
    {
        self.logger.debug(`Scheduling next request for ${delaySec} seconds from now`);
        self.timers.nextRequest = setTimeout(self.request, delaySec * 1000);
    }


    /**
     * What to do on each keep-alive tick
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
     * What to do on each request tick
     */
    request()
    {
        self.logger.silly('Request tick');

        if (!self.isRunning)
        {
            self.logger.warn('Request tick, but the watcher is not running! Bailing out...');
            return;
        }

        self.gameday.getGameData(self._gameId).then(self.handleData, self.handleError);
    }


    /**
     * Handle data from Gameday
     * @param data The data to be handled
     */
    handleData(data)
    {
        self.emit('data', data);
        self.scheduleNextRequest(data.metaData.wait || Constants.Watcher.DefaultWaitTime);
    }


    /**
     * Handle error from Gameday
     * @param err The error to be handled
     */
    handleError(err)
    {
        self.logger.error(err);
    }
    
}

module.exports = Watcher;
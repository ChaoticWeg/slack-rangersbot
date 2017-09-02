const EventEmitter = require('events').EventEmitter;
const Logger    = require('../logging/Logger.js');
const Timestamp = require('../Timestamp.js');
const Constants = require('../Constants.js');
const Gameday   = require('./Gameday.js');
const moment    = require('moment');
const _         = require('lodash');
const path      = require('path');

var self = null;

class Watcher extends EventEmitter
{
    constructor()
    {
        super();

        self = this;

        self._logger  = new Logger("Watcher", Constants.Watcher.LogLevel);
        self._gameday = new Gameday();

        self._gameData = {};
        self._lastRequestTimestamp = moment().utc();

        self._running = false;

        self.timers = {};
        self.timers.nextRequest = null;
        self.timers.keepAlive = null;

        self.currentInning = { number: 0, state: "" }
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

        if (self.isRunning)
            throw new Error("Already running");

        self._gameId = gameId;

        self.logger.debug(`Starting to watch game ${self.gameId}...`);

        self._running = true;
        self.timers.keepAlive = setInterval(self.tick, Constants.Watcher.TickTime);

        self.logger.info(`Started watching game ${self.gameId}`);
        self.emit('start', self);

        self.refreshTimestamp();
        self.scheduleNextRequest(Constants.Watcher.InitialDelay);
    }


    /**
     * Halt all timers and set the Watcher's state to stopped
     */
    stop()
    {
        self._running = false;

        clearInterval(self.timers.keepAlive);
        clearTimeout(self.timers.nextRequest);

        self.emit('stop', self);
    }


    /**
     * 
     */
    refreshTimestamp()
    {
        self.logger.debug('Refreshing timestamp');
        self._lastRequestTimestamp = moment().utc();
        self.logger.verbose(`Timestamp is now: ${self._lastRequestTimestamp.format(Timestamp.GamedayFormat)}`);
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

        self.gameday.getGameData(self._gameId).done(self.handleData);
    }


    /**
     * Handle data from Gameday
     * @param data The data to be handled
     */
    handleData(data)
    {
        self.emit('data', data);

        self.checkForInningChange(data);

        var plays = _.pickBy(data.liveData.plays.allPlays, self.isPlayValid);

        self.logger.debug(`${Object.keys(plays).length} new play(s)`);

        if (Object.keys(plays).length > 0)
        {
            Object.keys(plays).forEach(key => self.handlePlay(plays[key]));
            self.refreshTimestamp();
        }

        self.logger.debug(`Wait value from metadata: ${data.metaData.wait}`);
        self.scheduleNextRequest(data.metaData.wait);
    }

    /**
     * Check to see whether we are in a different half-inning than we were before.
     * @param linescore 
     */
    checkForInningChange(data)
    {
        if (!data || !data.liveData || !data.liveData.linescore)
            return;

        if (data.liveData.linescore.currentInning !== self.currentInning.number ||
            data.liveData.linescore.inningState !== self.currentInning.state)
        {
            self.currentInning.number = data.liveData.linescore.currentInning;
            self.currentInning.state  = data.liveData.linescore.inningState;

            self.emit('inning', data);
        }
    }


    /**
     * 
     * @param play The play to be handled
     */
    handlePlay(play)
    {
        if (!play || !play.about || !play.result || !play.about.isComplete)
            return;
        
        self.emit('play', play);
    }

    isPlayValid(play)
    {
        return play.about.isComplete && play.about.endTfs &&
            moment.utc(play.about.endTfs, Timestamp.GamedayFormat).isAfter(self._lastRequestTimestamp);
    }


    /**
     * Handle error from Gameday
     * @param err The error to be handled
     */
    handleError(err)
    {
        self.emit('error', err);
        self.logger.error(err);
        self.stop();
    }
    
}

module.exports = Watcher;
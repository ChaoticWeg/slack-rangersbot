const config        = require('config');

const Logger        = require('./lib/Logger');
const CommandServer = require('./lib/CommandServer');
const Gameday       = require('./lib/Gameday');

class GamedayBot
{
    constructor()
    {
        this._logger = new Logger(config.get("GamedayBot.name"), config.get("GamedayBot.logLevel"));

        this._commandServer = new CommandServer();
        this._gameday       = new Gameday();
    }

    get logger()        { return this._logger; }
    get commandServer() { return this._commandServer; }
    get gameday()       { return this._gameday; }
}

module.exports = GamedayBot;
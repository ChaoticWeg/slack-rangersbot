const Watcher   = require('./lib/watcher/Watcher.js');
const Logger    = require('./lib/logging/Logger.js');
const Constants = require('./lib/Constants.js');

var logger  = new Logger("MAIN");
var watcher = new Watcher();

watcher.on('data', data => {
    logger.debug('Data event intercepted');
});

watcher.gameday.getGameByTeamId(Constants.TeamID).then(

    data => {
        if (!data.gamePk)
        {
            console.error("The requested team does not play today.");
            return;
        }

        watcher.start(data.gamePk);
    },

    err => {
        console.error(err);
    }

);
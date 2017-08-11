const Watcher   = require('./lib/watcher/Watcher.js');
const Logger    = require('./lib/logging/Logger.js');
const Timestamp = require('./lib/Timestamp.js');
const Constants = require('./lib/Constants.js');

var logger  = new Logger("MAIN");
var watcher = new Watcher();

watcher.on('data', data => {
    logger.debug('Data event intercepted');
});

watcher.on('play', play => {
    logger.info(play.result.description.trim());
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
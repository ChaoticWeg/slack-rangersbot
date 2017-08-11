const Slack     = require('./lib/slack/SlackHandler.js');
const Watcher   = require('./lib/watcher/Watcher.js');
const Logger    = require('./lib/logging/Logger.js');
const Timestamp = require('./lib/Timestamp.js');
const Constants = require('./lib/Constants.js');
const fs        = require('fs');

var logger  = new Logger("MAIN");
var watcher = new Watcher();
var slack   = new Slack();

watcher.on('data', data => fs.writeFileSync('./tmp/last-data.json', JSON.stringify(data, null, 4)));

watcher.on('play', play => {
    logger.info(`New play! ${play.result.description.trim()}`);
    slack.announce(play.result.description.trim());
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
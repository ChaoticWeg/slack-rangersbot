const Constants = require('./lib/Constants.js');
const Watcher   = require('./lib/watcher/Watcher.js');

// TODO get rangers game ID from scoreboard
var watcher = new Watcher();

watcher.gameday.getGameByTeamId(Constants.TeamID).then(

    (data) => {
        if (!data.gamePk)
        {
            console.error("The requested team does not play today.");
            return;
        }

        watcher.start(data.gamePk);
    },

    (err) => {
        console.error(err);
    }

);